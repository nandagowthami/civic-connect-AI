import os
import uuid
import random
import tempfile
from pathlib import Path
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form, Query
from fastapi.responses import Response
from PIL import Image, ImageOps, UnidentifiedImageError
from database import complaints_col, status_history_col, notifications_col, users_col, db, is_mongo_active
from models import ComplaintCreate, StatusUpdate, DepartmentAssign, SupportComplaint
from routers.auth import get_current_user, require_current_user, require_admin, require_officer_or_admin
from ai_engine import analyze_issue, find_duplicate_issues

router = APIRouter(prefix="/api/issues", tags=["Civic Issues"])
MAX_UPLOAD_BYTES = 10 * 1024 * 1024
ALLOWED_IMAGE_TYPES = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp"}

APP_ENV = os.getenv("APP_ENV", "development").lower()
DEFAULT_UPLOAD_DIR = "/tmp/civicconnect/uploads" if APP_ENV == "production" else os.path.join(os.path.dirname(__file__), "..", "..", "uploads")
UPLOAD_DIR = os.path.abspath(os.getenv("UPLOAD_DIR", DEFAULT_UPLOAD_DIR))
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(os.path.join(UPLOAD_DIR, "proofs"), exist_ok=True)

async def save_validated_image(file: UploadFile, prefix: str = "", subdir: str = ""):
    extension = ALLOWED_IMAGE_TYPES.get(file.content_type or "")
    if not extension:
        raise HTTPException(status_code=400, detail="Upload a JPG, PNG, or WEBP image.")
    content = await file.read(MAX_UPLOAD_BYTES + 1)
    if not content or len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="Image must be smaller than 10 MB.")
    try:
        from io import BytesIO
        with Image.open(BytesIO(content)) as image:
            if image.width * image.height > 30_000_000:
                raise HTTPException(status_code=400, detail="Image dimensions are too large.")
            image.verify()
        with Image.open(BytesIO(content)) as image:
            image = ImageOps.exif_transpose(image)
            output = BytesIO()
            output_format = {".jpg": "JPEG", ".png": "PNG", ".webp": "WEBP"}[extension]
            if output_format == "JPEG" and image.mode not in {"RGB", "L"}:
                image = image.convert("RGB")
            image.save(output, format=output_format, quality=88)
            content = output.getvalue()
    except HTTPException:
        raise
    except (UnidentifiedImageError, OSError, ValueError):
        raise HTTPException(status_code=400, detail="The uploaded file is not a valid image.")
    filename = f"{prefix}{uuid.uuid4().hex}{extension}"
    # Hosted service filesystems can be temporary. Keep production uploads in
    # Atlas GridFS beside the report records so they survive restarts.
    if os.getenv("APP_ENV", "development").lower() == "production" and is_mongo_active and db is not None:
        from gridfs import GridFSBucket
        bucket = GridFSBucket(db, bucket_name="report_images")
        with bucket.open_upload_stream(filename, metadata={"content_type": extension_to_content_type(extension), "subdir": subdir}) as stream:
            stream.write(content)
        return {"url": f"/api/issues/image/{filename}", "filename": filename}

    target_dir = os.path.join(UPLOAD_DIR, subdir)
    os.makedirs(target_dir, exist_ok=True)
    Path(target_dir, filename).write_bytes(content)
    path = f"/uploads/{subdir}/{filename}" if subdir else f"/uploads/{filename}"
    return {"url": path, "filename": filename}


def extension_to_content_type(extension: str) -> str:
    return {".jpg": "image/jpeg", ".png": "image/png", ".webp": "image/webp"}[extension]


@router.get("/image/{filename}")
def get_uploaded_image(filename: str):
    """Serve a persisted production upload from Atlas GridFS."""
    if os.getenv("APP_ENV", "development").lower() != "production" or not is_mongo_active or db is None:
        raise HTTPException(status_code=404, detail="Image not found")
    if not filename or "/" in filename or "\\" in filename:
        raise HTTPException(status_code=404, detail="Image not found")
    from gridfs import GridFSBucket
    bucket = GridFSBucket(db, bucket_name="report_images")
    matches = bucket.find({"filename": filename}).sort("uploadDate", -1).limit(1)
    item_info = next(iter(matches), None)
    if item_info is None:
        raise HTTPException(status_code=404, detail="Image not found")
    # GridFSBucket.find() yields a GridOut stream, not a dict. Read its
    # metadata and bytes directly; indexing it as `item_info["_id"]` caused
    # every persisted production image request to fail with HTTP 500.
    content_type = (item_info.metadata or {}).get("content_type", "application/octet-stream")
    return Response(content=item_info.read(), media_type=content_type, headers={"Cache-Control": "public, max-age=3600"})

def generate_complaint_id() -> str:
    year = datetime.utcnow().year
    rand_digits = random.randint(1000, 9999)
    # Check uniqueness
    cid = f"CC-{year}-{rand_digits}"
    while complaints_col.find_one({"complaint_id": cid}):
        rand_digits = random.randint(1000, 9999)
        cid = f"CC-{year}-{rand_digits}"
    return cid

def public_issue(issue: dict) -> dict:
    """Remove reporter identifiers from public issue endpoints."""
    result = dict(issue)
    result.pop("citizen", None)
    return result

def create_notification(user_id: Optional[str], title: str, message: str, complaint_id: str, n_type: str = "status_change"):
    if not user_id:
        return
    notif = {
        "_id": str(uuid.uuid4()),
        "user_id": user_id,
        "complaint_id": complaint_id,
        "title": title,
        "message": message,
        "type": n_type,
        "is_read": False,
        "created_at": datetime.utcnow().isoformat()
    }
    notifications_col.insert_one(notif)

@router.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    return await save_validated_image(file)

@router.post("/upload-proof")
async def upload_proof(file: UploadFile = File(...), current_user: dict = Depends(require_officer_or_admin)):
    return await save_validated_image(file, prefix="proof_", subdir="proofs")

@router.post("")
def create_issue(
    req: ComplaintCreate,
    current_user: Optional[dict] = Depends(get_current_user)
):
    """
    Submits a civic issue:
    1. Runs spatial duplicate detection.
    2. Runs AI multimodal analysis (Image + NLP + Multi-factor priority).
    3. Auto-routes to recommended department.
    4. Records complaint and status timeline.
    """
    citizen_id = str(current_user.get("_id") or current_user.get("id")) if current_user else "anonymous"
    # Civic reports do not disclose account contact details to public issue views.
    citizen_name = "Anonymous Citizen"
    citizen_email = ""
    citizen_phone = ""

    # Check for active complaints nearby to find duplicates
    active_issues = complaints_col.find({"status": {"$ne": "Resolved"}})
    duplicate_info = find_duplicate_issues(
        latitude=req.latitude,
        longitude=req.longitude,
        title=req.title,
        description=req.description,
        category=req.category or "Other",
        existing_issues=active_issues,
        distance_threshold_meters=150.0
    )

    report_count = 1
    linked_parent_id = None
    if duplicate_info:
        linked_parent_id = duplicate_info["parent_id"]
        # Increment parent's crowd count
        parent = complaints_col.find_one({"complaint_id": linked_parent_id})
        if parent:
            new_crowd_count = parent.get("report_count", 1) + 1
            complaints_col.update_one(
                {"complaint_id": linked_parent_id},
                {
                    "$inc": {"report_count": 1},
                    "$push": {
                        "duplicate_reports": {
                            "reporter_name": citizen_name,
                            "timestamp": datetime.utcnow().isoformat(),
                            "description": req.description
                        }
                    }
                }
            )
            # Recalculate parent's priority because citizen count increased!
            re_ai = analyze_issue(
                title=parent["title"],
                description=parent["description"],
                user_category=parent.get("category"),
                location_name=parent.get("location", {}).get("address", ""),
                nearby_reports_count=new_crowd_count
            )
            complaints_col.update_one(
                {"complaint_id": linked_parent_id},
                {
                    "$set": {
                        "priority": re_ai["priority_level"],
                        "priority_score": re_ai["priority_score"],
                        "ai_analysis": re_ai
                    }
                }
            )

    # Local image path if uploaded
    local_img_path = None
    temporary_image_path = None
    if req.image_url and req.image_url.startswith("/uploads/"):
        filename = req.image_url.replace("/uploads/", "")
        local_img_path = os.path.join(UPLOAD_DIR, filename)
    elif req.image_url and req.image_url.startswith("/api/issues/image/") and is_mongo_active and db is not None:
        filename = req.image_url.rsplit("/", 1)[-1]
        from gridfs import GridFSBucket
        bucket = GridFSBucket(db, bucket_name="report_images")
        match = next(iter(bucket.find({"filename": filename}).sort("uploadDate", -1).limit(1)), None)
        if match is not None:
            download = bucket.open_download_stream(match["_id"])
            with tempfile.NamedTemporaryFile(suffix=os.path.splitext(filename)[1], delete=False) as image_file:
                image_file.write(download.read())
                temporary_image_path = image_file.name
            local_img_path = temporary_image_path

    # Run AI Analysis
    try:
        ai_result = analyze_issue(
            title=req.title,
            description=req.description,
            user_category=req.category,
            image_path=local_img_path,
            location_name=req.address,
            latitude=req.latitude,
            longitude=req.longitude,
            nearby_reports_count=report_count
        )
    finally:
        if temporary_image_path and os.path.exists(temporary_image_path):
            os.unlink(temporary_image_path)

    complaint_id = generate_complaint_id()
    now_iso = datetime.utcnow().isoformat()

    complaint_doc = {
        "_id": str(uuid.uuid4()),
        "complaint_id": complaint_id,
        "title": req.title,
        "description": req.description,
        "category": ai_result["detected_category"],
        "user_selected_category": req.category,
        "status": "Assigned",  # Auto-routed immediately
        "priority": ai_result["priority_level"],
        "priority_score": ai_result["priority_score"],
        "department": ai_result["recommended_department"],
        "assigned_officer": None,
        "image_url": req.image_url,
        "resolution_proof_url": None,
        "resolution_notes": None,
        "location": {
            "address": req.address,
            "landmark": req.landmark or "",
            "latitude": req.latitude,
            "longitude": req.longitude,
            "coordinates": [req.longitude, req.latitude]  # GeoJSON [lng, lat]
        },
        "citizen": {
            "id": citizen_id,
            "name": citizen_name,
            "email": citizen_email,
            "phone": citizen_phone
        },
        "ai_analysis": ai_result,
        "report_count": 1,
        "duplicate_of": linked_parent_id,
        "duplicate_reports": [],
        "created_at": now_iso,
        "updated_at": now_iso
    }

    complaints_col.insert_one(complaint_doc)

    # Create initial status history entry
    history_entry = {
        "_id": str(uuid.uuid4()),
        "complaint_id": complaint_id,
        "status": "Submitted",
        "title": "Complaint Submitted",
        "description": f"Complaint recorded by {citizen_name}. AI categorized as {ai_result['detected_category']}.",
        "updated_by": citizen_name,
        "timestamp": now_iso
    }
    status_history_col.insert_one(history_entry)

    # Auto-routing history entry
    routing_entry = {
        "_id": str(uuid.uuid4()),
        "complaint_id": complaint_id,
        "status": "Assigned",
        "title": f"Auto-Routed to {ai_result['recommended_department']}",
        "description": f"AI assigned {ai_result['priority_badge']} with {ai_result['confidence_percentage']}% confidence. Recommended action dispatched.",
        "updated_by": "CivicConnect AI Engine",
        "timestamp": now_iso
    }
    status_history_col.insert_one(routing_entry)

    # Send Notification to Citizen
    create_notification(
        user_id=citizen_id,
        title=f"Complaint {complaint_id} Registered",
        message=f"Your complaint has been verified by AI and auto-routed to {ai_result['recommended_department']} ({ai_result['priority_badge']}).",
        complaint_id=complaint_id,
        n_type="registered"
    )

    return complaint_doc

@router.get("")
def list_issues(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    department: Optional[str] = None,
    category: Optional[str] = None,
    citizen_id: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = Query(default=100, ge=1, le=150),
    current_user: Optional[dict] = Depends(get_current_user)
):
    query = {}
    if status and status != "All":
        query["status"] = status
    if priority and priority != "All":
        query["priority"] = priority
    if department and department != "All":
        query["department"] = department
    if category and category != "All":
        query["category"] = category
    if citizen_id:
        if not current_user:
            raise HTTPException(status_code=401, detail="Sign in to view your reports.")
        if current_user.get("role") == "citizen" and citizen_id != str(current_user.get("_id") or current_user.get("id")):
            raise HTTPException(status_code=403, detail="You can only view your own reports.")
        query["citizen.id"] = citizen_id

    issues = complaints_col.find(query, sort=[("created_at", -1)], limit=limit)

    if search:
        s = search.lower()
        issues = [
            iss for iss in issues
            if s in iss.get("title", "").lower()
            or s in iss.get("complaint_id", "").lower()
            or s in iss.get("description", "").lower()
            or s in iss.get("location", {}).get("address", "").lower()
        ]

    return [public_issue(issue) for issue in issues]

@router.get("/track/{query}")
def track_issue(query: str):
    """Public tracking by complaint ID only; do not expose reports by personal contact data."""
    clean_q = query.strip()
    
    # Check by complaint_id
    issue = complaints_col.find_one({"complaint_id": clean_q.upper()})
    if not issue:
        # Case-insensitive complaint_id check
        all_issues = complaints_col.find()
        for iss in all_issues:
            if iss.get("complaint_id", "").lower() == clean_q.lower():
                issue = iss
                break
    
    if not issue:
        raise HTTPException(
            status_code=404,
            detail="No civic complaint found for that reference. Check the complaint ID and try again."
        )

    # Fetch status history timeline
    cid = issue.get("complaint_id")
    history = status_history_col.find({"complaint_id": cid}, sort=[("timestamp", 1)])
    issue["status_history"] = history
    return public_issue(issue)

@router.get("/{id}")
def get_issue(id: str):
    issue = complaints_col.find_one({"_id": id})
    if not issue:
        issue = complaints_col.find_one({"complaint_id": id})
    if not issue:
        raise HTTPException(status_code=404, detail="Complaint not found.")

    cid = issue.get("complaint_id")
    history = status_history_col.find({"complaint_id": cid}, sort=[("timestamp", 1)])
    issue["status_history"] = history
    return public_issue(issue)

@router.patch("/{id}/status")
def update_status(
    id: str,
    req: StatusUpdate,
    current_user: dict = Depends(require_officer_or_admin)
):
    issue = complaints_col.find_one({"_id": id}) or complaints_col.find_one({"complaint_id": id})
    if not issue:
        raise HTTPException(status_code=404, detail="Complaint not found.")

    if current_user.get("role") == "officer" and current_user.get("department") != issue.get("department"):
        raise HTTPException(status_code=403, detail="You can only update reports assigned to your department.")
    actor_name = current_user.get("name", "Department Officer")
    cid = issue["complaint_id"]
    now_iso = datetime.utcnow().isoformat()

    update_payload = {
        "status": req.status,
        "updated_at": now_iso
    }
    if req.notes:
        update_payload["status_notes"] = req.notes
    if req.resolution_proof_url:
        update_payload["resolution_proof_url"] = req.resolution_proof_url
        update_payload["resolved_at"] = now_iso

    complaints_col.update_one({"complaint_id": cid}, {"$set": update_payload})

    # Timeline entry
    history_entry = {
        "_id": str(uuid.uuid4()),
        "complaint_id": cid,
        "status": req.status,
        "title": f"Status changed to {req.status}",
        "description": req.notes or f"Complaint updated to {req.status} by {actor_name}.",
        "proof_url": req.resolution_proof_url,
        "updated_by": actor_name,
        "timestamp": now_iso
    }
    status_history_col.insert_one(history_entry)

    # Citizen notification
    citizen_id = issue.get("citizen", {}).get("id")
    if citizen_id and citizen_id != "anonymous":
        msg = f"Your complaint {cid} status has been updated to '{req.status}'."
        if req.status == "Resolved":
            msg += " Resolution proof has been uploaded. Thank you for making our city better!"
        create_notification(
            user_id=citizen_id,
            title=f"Complaint {cid}: {req.status}",
            message=msg,
            complaint_id=cid,
            n_type="status_change"
        )

    return {"success": True, "status": req.status, "complaint_id": cid}

@router.patch("/{id}/assign")
def assign_department(
    id: str,
    req: DepartmentAssign,
    current_user: dict = Depends(require_admin)
):
    issue = complaints_col.find_one({"_id": id}) or complaints_col.find_one({"complaint_id": id})
    if not issue:
        raise HTTPException(status_code=404, detail="Complaint not found.")

    actor_name = current_user.get("name", "Government Authority")
    cid = issue["complaint_id"]
    now_iso = datetime.utcnow().isoformat()

    complaints_col.update_one(
        {"complaint_id": cid},
        {
            "$set": {
                "department": req.department,
                "assigned_officer": req.assigned_officer_id,
                "status": "Assigned",
                "updated_at": now_iso
            }
        }
    )

    # Timeline
    history_entry = {
        "_id": str(uuid.uuid4()),
        "complaint_id": cid,
        "status": "Assigned",
        "title": f"Reassigned to {req.department}",
        "description": req.notes or f"Manually assigned to {req.department} by {actor_name}.",
        "updated_by": actor_name,
        "timestamp": now_iso
    }
    status_history_col.insert_one(history_entry)

    # Citizen Notification
    citizen_id = issue.get("citizen", {}).get("id")
    if citizen_id and citizen_id != "anonymous":
        create_notification(
            user_id=citizen_id,
            title=f"Complaint {cid} Department Updated",
            message=f"Your complaint has been assigned to {req.department}.",
            complaint_id=cid,
            n_type="reassigned"
        )

    return {"success": True, "department": req.department}

@router.post("/{id}/support")
def support_issue(
    id: str,
    req: SupportComplaint,
    current_user: dict = Depends(require_current_user)
):
    """
    Citizen 'I also have this issue' crowd upvote:
    Elevates report count and triggers AI priority recalculation.
    """
    issue = complaints_col.find_one({"_id": id}) or complaints_col.find_one({"complaint_id": id})
    if not issue:
        raise HTTPException(status_code=404, detail="Complaint not found.")

    if current_user.get("role") != "citizen":
        raise HTTPException(status_code=403, detail="Only citizen accounts can support a report.")

    cid = issue["complaint_id"]
    user_name = current_user.get("name", "Concerned Citizen") if current_user else "Concerned Citizen"
    now_iso = datetime.utcnow().isoformat()

    new_count = issue.get("report_count", 1) + 1
    
    # Recalculate priority
    re_ai = analyze_issue(
        title=issue["title"],
        description=issue["description"],
        user_category=issue.get("category"),
        location_name=issue.get("location", {}).get("address", ""),
        nearby_reports_count=new_count
    )

    complaints_col.update_one(
        {"complaint_id": cid},
        {
            "$inc": {"report_count": 1},
            "$push": {
                "duplicate_reports": {
                    "reporter_name": user_name,
                    "timestamp": now_iso,
                    "notes": req.notes or "Also affected by this civic issue."
                }
            },
            "$set": {
                "priority": re_ai["priority_level"],
                "priority_score": re_ai["priority_score"],
                "ai_analysis": re_ai,
                "updated_at": now_iso
            }
        }
    )

    return {
        "success": True,
        "new_report_count": new_count,
        "new_priority": re_ai["priority_level"],
        "message": f"Support recorded! Priority recalculated to {re_ai['priority_level']} due to elevated crowd reports."
    }
