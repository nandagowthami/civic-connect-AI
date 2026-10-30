import os
import secrets
from pathlib import Path
from datetime import datetime, timezone
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from backend.routers import auth, issues, departments, analytics, notifications
from backend.seed_data import seed_database, update_demo_report_locations
from backend.database import users_col
from backend.routers.auth import hash_password

APP_ENV = os.getenv("APP_ENV", "development").lower()
FRONTEND_ORIGINS = [origin.strip() for origin in os.getenv(
    "FRONTEND_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
).split(",") if origin.strip()]

app = FastAPI(
    title="CivicConnect AI API",
    description="Crowdsourced Civic Issue Reporting and AI-Based Priority Routing System",
    version="1.0.0",
    docs_url=None if APP_ENV == "production" else "/docs",
    redoc_url=None if APP_ENV == "production" else "/redoc",
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_ORIGINS,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static uploads directory for photos
UPLOAD_DIR = os.path.abspath(os.getenv("UPLOAD_DIR", os.path.join(os.path.dirname(__file__), "..", "uploads")))
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(os.path.join(UPLOAD_DIR, "proofs"), exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Include Routers
app.include_router(auth.router)
app.include_router(issues.router)
app.include_router(departments.router)
app.include_router(analytics.router)
app.include_router(notifications.router)

FRONTEND_DIST = Path(__file__).resolve().parent.parent / "frontend" / "dist"

@app.on_event("startup")
def on_startup():
    if APP_ENV == "production":
        if not os.getenv("FRONTEND_ORIGINS", "").strip():
            raise RuntimeError("Set FRONTEND_ORIGINS to the Vercel site origin(s).")
        if not os.getenv("JWT_SECRET") or len(os.getenv("JWT_SECRET", "")) < 32:
            raise RuntimeError("Set JWT_SECRET to a random value of at least 32 characters.")
        admin_email = os.getenv("ADMIN_EMAIL", "").strip().lower()
        admin_password = os.getenv("ADMIN_PASSWORD", "")
        if not admin_email or len(admin_password) < 12:
            raise RuntimeError("Set ADMIN_EMAIL and an ADMIN_PASSWORD of at least 12 characters.")
        if os.getenv("DEMO_MODE", "false").lower() in {"1", "true", "yes"} and len(os.getenv("DEMO_ACCESS_KEY", "")) < 24:
            raise RuntimeError("When DEMO_MODE is enabled, set a DEMO_ACCESS_KEY of at least 24 characters.")
        demo_enabled = os.getenv("DEMO_MODE", "false").lower() in {"1", "true", "yes"}
        demo_password = os.getenv("DEMO_PASSWORD", "")
        if demo_enabled and len(demo_password) < 12:
            raise RuntimeError("When DEMO_MODE is enabled, set a DEMO_PASSWORD of at least 12 characters.")
        demo_accounts = [
            ("citizen@smartcity.gov", "Demo Citizen", "citizen", None),
            ("admin@smartcity.gov", "Demo Municipal Administrator", "admin", "Smart City Central Administration"),
            ("officer.roads@smartcity.gov", "Demo Roads Officer", "officer", "Roads and Transportation Department"),
            ("officer.sanitation@smartcity.gov", "Demo Sanitation Officer", "officer", "Sanitation Department"),
            ("officer.electricity@smartcity.gov", "Demo Electricity Officer", "officer", "Electricity Department"),
            ("officer.water@smartcity.gov", "Demo Water Officer", "officer", "Water Supply Department"),
        ]
        if demo_enabled and admin_email in {account[0] for account in demo_accounts}:
            raise RuntimeError("ADMIN_EMAIL must be separate from built-in demo personas when DEMO_MODE is enabled.")
        if demo_enabled:
            for email, name, role, department in demo_accounts:
                account = {
                    "name": name,
                    "email": email,
                    "password_hash": hash_password(demo_password),
                    "phone": "",
                    "role": role,
                    "department": department,
                }
                existing = users_col.find_one({"email": email})
                if existing:
                    users_col.update_one({"_id": existing.get("_id")}, {"$set": account})
                else:
                    users_col.insert_one({"_id": f"demo_{role}_{email.split('@')[0]}", "id": f"demo_{role}_{email.split('@')[0]}", **account})
        else:
            # If an old local/demo database is reused, strip the published staff roles and passwords.
            for email, _, role, _ in demo_accounts:
                existing = users_col.find_one({"email": email})
                if existing and role in {"admin", "officer"}:
                    users_col.update_one({"_id": existing.get("_id")}, {"$set": {
                        "role": "citizen",
                        "department": None,
                        "password_hash": hash_password(secrets.token_urlsafe(32)),
                    }})

        admin_account = {
            "name": os.getenv("ADMIN_NAME", "Project Administrator"),
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "phone": "",
            "role": "admin",
            "department": "Smart City Central Administration",
        }
        existing_admin = users_col.find_one({"email": admin_email})
        if existing_admin:
            users_col.update_one({"_id": existing_admin.get("_id")}, {"$set": admin_account})
        else:
            users_col.insert_one({"_id": "bootstrap_admin", "id": "bootstrap_admin", **admin_account})
    else:
        try:
            seed_database()
            update_demo_report_locations()
        except Exception as e:
            print(f"Seed startup warning: {e}")

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "system": "CivicConnect AI",
        "version": "1.0.0",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@app.get("/{path:path}", include_in_schema=False)
def serve_frontend(path: str):
    if path == "api" or path.startswith("api/") or path == "uploads" or path.startswith("uploads/"):
        raise HTTPException(status_code=404, detail="Not found")

    frontend_root = FRONTEND_DIST.resolve()
    requested_file = (frontend_root / path).resolve()
    if frontend_root not in requested_file.parents and requested_file != frontend_root:
        raise HTTPException(status_code=404, detail="Not found")

    if requested_file.is_file():
        return FileResponse(requested_file)

    if path == "assets" or path.startswith("assets/"):
        raise HTTPException(status_code=404, detail="Not found")

    index_file = frontend_root / "index.html"
    if index_file.is_file():
        return FileResponse(index_file)

    raise HTTPException(status_code=404, detail="Frontend build not found")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
