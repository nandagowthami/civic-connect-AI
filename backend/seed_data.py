import os
import uuid
from datetime import datetime, timedelta
from PIL import Image, ImageDraw, ImageFont
from .database import users_col, complaints_col, departments_col, status_history_col, notifications_col
from .routers.auth import hash_password
from .routers.departments import DEFAULT_DEPARTMENTS
from .ai_engine import analyze_issue

UPLOAD_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "uploads"))
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(os.path.join(UPLOAD_DIR, "proofs"), exist_ok=True)

def generate_sample_civic_image(filename: str, title: str, subtitle: str, bg_color: tuple, accent_color: tuple):
    """Generates an aesthetic smart city photo placeholder with civic iconography."""
    filepath = os.path.join(UPLOAD_DIR, filename)
    if os.path.exists(filepath):
        return f"/uploads/{filename}"

    img = Image.new("RGB", (800, 500), color=bg_color)
    draw = ImageDraw.Draw(img)

    # Draw grid lines for smart city / technical look
    for x in range(0, 800, 40):
        draw.line([(x, 0), (x, 500)], fill=(bg_color[0]+10, bg_color[1]+10, bg_color[2]+10), width=1)
    for y in range(0, 500, 40):
        draw.line([(0, y), (800, y)], fill=(bg_color[0]+10, bg_color[1]+10, bg_color[2]+10), width=1)

    # Draw framed box
    draw.rectangle([40, 40, 760, 460], outline=accent_color, width=3)
    
    # Top badge
    draw.rectangle([60, 60, 260, 100], fill=accent_color)
    draw.text((75, 72), "SMART CITY CIVIC PHOTO", fill=(255, 255, 255))

    # Center graphic badge
    draw.ellipse([340, 140, 460, 260], fill=(255, 255, 255), outline=accent_color, width=4)
    draw.ellipse([370, 170, 430, 230], fill=accent_color)

    # Title & Subtitle text
    draw.text((70, 310), title, fill=(255, 255, 255))
    draw.text((70, 350), subtitle, fill=(200, 220, 240))
    draw.text((70, 410), "Geo-Tagged & AI Verified • CivicConnect AI System", fill=(160, 180, 200))

    img.save(filepath, format="JPEG", quality=85)
    return f"/uploads/{filename}"

def seed_database():
    """Initializes seed users, sample civic complaints, and audit records."""
    existing_users = users_col.count_documents()
    if existing_users > 0:
        print("Database already contains records. Skipping full reseed.")
        return

    print("Initializing Smart City seed dataset...")

    # 1. Seed Users
    sample_users = [
        {
            "_id": "user_citizen_1",
            "name": "Arun Sharma",
            "email": "citizen@smartcity.gov",
            "password_hash": hash_password("password123"),
            "phone": "+91 98765 43210",
            "role": "citizen",
            "department": None,
            "created_at": datetime.utcnow().isoformat()
        },
        {
            "_id": "user_admin_1",
            "name": "Dr. Rajesh Verma (Municipal Commissioner)",
            "email": "admin@smartcity.gov",
            "password_hash": hash_password("admin123"),
            "phone": "+91 98111 22334",
            "role": "admin",
            "department": "Smart City Central Administration",
            "created_at": datetime.utcnow().isoformat()
        },
        {
            "_id": "user_officer_roads",
            "name": "Eng. Suresh Kumar",
            "email": "officer.roads@smartcity.gov",
            "password_hash": hash_password("officer123"),
            "phone": "+91 98450 11223",
            "role": "officer",
            "department": "Roads and Transportation Department",
            "created_at": datetime.utcnow().isoformat()
        },
        {
            "_id": "user_officer_sanitation",
            "name": "Meera Nair",
            "email": "officer.sanitation@smartcity.gov",
            "password_hash": hash_password("officer123"),
            "phone": "+91 98450 33445",
            "role": "officer",
            "department": "Sanitation Department",
            "created_at": datetime.utcnow().isoformat()
        },
        {
            "_id": "user_officer_electricity",
            "name": "Kavita Reddy",
            "email": "officer.electricity@smartcity.gov",
            "password_hash": hash_password("officer123"),
            "phone": "+91 98450 55667",
            "role": "officer",
            "department": "Electricity Department",
            "created_at": datetime.utcnow().isoformat()
        },
        {
            "_id": "user_officer_water",
            "name": "Vikram Patil",
            "email": "officer.water@smartcity.gov",
            "password_hash": hash_password("officer123"),
            "phone": "+91 98450 77889",
            "role": "officer",
            "department": "Water Supply Department",
            "created_at": datetime.utcnow().isoformat()
        }
    ]

    for u in sample_users:
        users_col.insert_one(u)

    # 2. Seed Sample Images
    img_pothole = generate_sample_civic_image("sample_pothole.jpg", "Severe Road Crater & Pothole", "MG Road Junction near Metro Station", (40, 50, 60), (220, 38, 38))
    img_garbage = generate_sample_civic_image("sample_garbage.jpg", "Garbage Dump Overflow", "Sector 4 Market Main Entrance", (35, 65, 45), (22, 163, 74))
    img_light = generate_sample_civic_image("sample_streetlight.jpg", "Broken Dark Streetlight Fixture", "8th Cross, Residential Colony", (25, 30, 45), (234, 179, 8))
    img_water = generate_sample_civic_image("sample_water.jpg", "Main Drinking Water Pipeline Burst", "Ring Road Flyover Service Lane", (20, 55, 80), (2, 132, 199))
    img_drainage = generate_sample_civic_image("sample_drainage.jpg", "Overflowing Stormwater Drain", "Subhash Nagar Low-Lying Area", (45, 40, 60), (139, 92, 246))
    img_hazard = generate_sample_civic_image("sample_hazard.jpg", "Hanging Live Electric Wire Near School", "Near St. Joseph Primary School", (60, 20, 25), (225, 29, 72))
    
    proof_pothole = generate_sample_civic_image("proof_pothole.jpg", "COMPLETED: Asphalt Resurfaced & Leveled", "Official Resolution Inspection by Roads Dept", (20, 60, 35), (34, 197, 94))
    proof_garbage = generate_sample_civic_image("proof_garbage.jpg", "COMPLETED: Site Cleared & Disinfected", "Sanitation Sanitation Drive Report", (20, 60, 35), (34, 197, 94))

    now = datetime.utcnow()

    # 3. Seed Realistic Complaints
    raw_complaints = [
        {
            "cid": "CC-2026-1042",
            "title": "Massive deep pothole causing vehicle damage and traffic bottleneck",
            "desc": "There is a massive 2-foot deep pothole on MG Road near the Metro Station entrance. Multiple two-wheelers have skidded and cars are suffering axle damage. It poses an immediate accident danger during peak hours.",
            "category": "Pothole",
            "address": "MG Road, near Metro Pillar 142, Central Ward",
            "landmark": "Opposite Metro Station Gate 2",
            "lat": 12.9750,
            "lng": 77.6050,
            "status": "In Progress",
            "img": img_pothole,
            "report_count": 9,  # High crowd duplicate cluster!
            "created_days_ago": 2,
            "user_id": "user_citizen_1"
        },
        {
            "cid": "CC-2026-1043",
            "title": "Overflowing garbage dump attracting stray animals and severe stench",
            "desc": "The community waste bin has not been cleared for 4 days. Waste is spilling onto the roadway, blocking pedestrian footpath and causing severe sanitary risk to adjacent vegetable shops.",
            "category": "Garbage Problem",
            "address": "Sector 4 Commercial Complex, Gandhi Bazaar",
            "landmark": "Near Municipal Park Gate",
            "lat": 12.9620,
            "lng": 77.5850,
            "status": "Assigned",
            "img": img_garbage,
            "report_count": 4,
            "created_days_ago": 1,
            "user_id": "user_citizen_1"
        },
        {
            "cid": "CC-2026-1044",
            "title": "Broken streetlights leaving entire street in pitch darkness",
            "desc": "Three consecutive streetlights are non-functional on 8th Cross Road. The whole stretch is pitch dark after 7 PM, creating safety concerns for women and evening pedestrians.",
            "category": "Broken Streetlight",
            "address": "8th Cross, Indiranagar 2nd Stage",
            "landmark": "Near BDA Community Hall",
            "lat": 12.9785,
            "lng": 77.6405,
            "status": "Assigned",
            "img": img_light,
            "report_count": 2,
            "created_days_ago": 3,
            "user_id": "user_citizen_1"
        },
        {
            "cid": "CC-2026-1045",
            "title": "Major potable water pipeline burst gushing thousands of liters",
            "desc": "An underground supply pipeline has fractured under high pressure. Clean drinking water is gushing across the road and flooding the basements of nearby shops. Immediate valve shutdown required!",
            "category": "Water Leakage",
            "address": "Ring Road Service Lane, Koramangala 5th Block",
            "landmark": "Near Water Booster Station",
            "lat": 12.9350,
            "lng": 77.6240,
            "status": "In Progress",
            "img": img_water,
            "report_count": 7,
            "created_days_ago": 1,
            "user_id": "user_citizen_1"
        },
        {
            "cid": "CC-2026-1046",
            "title": "Clogged storm drainage overflowing black sewage water",
            "desc": "The main roadside stormwater drain is choked with silt and plastic debris. Dirty sewage water is backing up onto the pavement and entering residential compound gates.",
            "category": "Drainage Problem",
            "address": "Subhash Nagar Main Road, Low-lying Sector",
            "landmark": "Near Government Dispensary",
            "lat": 12.9810,
            "lng": 77.5750,
            "status": "Assigned",
            "img": img_drainage,
            "report_count": 3,
            "created_days_ago": 2,
            "user_id": "user_citizen_1"
        },
        {
            "cid": "CC-2026-1047",
            "title": "DANGEROUS: Hanging live electric wire sparking near school gate",
            "desc": "High voltage overhead power line has snapped and is dangling only 5 feet above the pedestrian walkway right outside the school entrance. Continuous electric sparks observed. High electrocution hazard!",
            "category": "Public Safety Issue",
            "address": "Residency Road, outside St. Joseph Primary School",
            "landmark": "School Main Pedestrian Gate",
            "lat": 12.9720,
            "lng": 77.6080,
            "status": "In Progress",
            "img": img_hazard,
            "report_count": 12,  # Extreme crowd report
            "created_days_ago": 0,
            "user_id": "user_citizen_1"
        },
        {
            "cid": "CC-2026-1038",
            "title": "Asphalt cave-in and pothole near Hospital Emergency entrance",
            "desc": "Road surface eroded by recent rains near the emergency ward gate, impeding ambulance movement. Successfully repaired with hot asphalt mix by municipal road engineers.",
            "category": "Pothole",
            "address": "Victoria Hospital Road, City Center",
            "landmark": "Emergency Gate 1",
            "lat": 12.9630,
            "lng": 77.5740,
            "status": "Resolved",
            "img": img_pothole,
            "resolution_img": proof_pothole,
            "resolution_notes": "Road crew dispatched under work order #RW-882. Excavated weak subgrade, filled with stone ballast, and completed bitumen blacktopping.",
            "report_count": 6,
            "created_days_ago": 5,
            "user_id": "user_citizen_1"
        },
        {
            "cid": "CC-2026-1039",
            "title": "Illegal debris and commercial waste dumping behind bus terminus",
            "desc": "Commercial building debris and organic waste cleared using compacting trucks. Area disinfected with bleaching powder.",
            "category": "Garbage Problem",
            "address": "Majestic Central Bus Stand Backside",
            "landmark": "Platform 16 Exit",
            "lat": 12.9770,
            "lng": 77.5710,
            "status": "Resolved",
            "img": img_garbage,
            "resolution_img": proof_garbage,
            "resolution_notes": "Night sanitation squad deployed 2 tipper trucks. 4.2 tons of solid waste safely transported to composting facility. Penalty notice issued to adjacent contractor.",
            "report_count": 5,
            "created_days_ago": 6,
            "user_id": "user_citizen_1"
        }
    ]

    for item in raw_complaints:
        c_time = (now - timedelta(days=item["created_days_ago"])).isoformat()
        
        # Run AI to get authentic calculated scores
        ai_res = analyze_issue(
            title=item["title"],
            description=item["desc"],
            user_category=item["category"],
            location_name=item["address"],
            latitude=item["lat"],
            longitude=item["lng"],
            nearby_reports_count=item["report_count"]
        )

        doc = {
            "_id": str(uuid.uuid4()),
            "complaint_id": item["cid"],
            "title": item["title"],
            "description": item["desc"],
            "category": ai_res["detected_category"],
            "user_selected_category": item["category"],
            "status": item["status"],
            "priority": ai_res["priority_level"],
            "priority_score": ai_res["priority_score"],
            "department": ai_res["recommended_department"],
            "assigned_officer": None,
            "image_url": item["img"],
            "resolution_proof_url": item.get("resolution_img"),
            "resolution_notes": item.get("resolution_notes"),
            "location": {
                "address": item["address"],
                "landmark": item["landmark"],
                "latitude": item["lat"],
                "longitude": item["lng"],
                "coordinates": [item["lng"], item["lat"]]
            },
            "citizen": {
                "id": item["user_id"],
                "name": "Arun Sharma",
                "email": "citizen@smartcity.gov",
                "phone": "+91 98765 43210"
            },
            "ai_analysis": ai_res,
            "report_count": item["report_count"],
            "duplicate_of": None,
            "duplicate_reports": [
                {
                    "reporter_name": f"Citizen #{i+1}",
                    "timestamp": (now - timedelta(hours=i*3)).isoformat(),
                    "notes": "Verified this same civic disruption at this spot."
                } for i in range(item["report_count"] - 1)
            ],
            "created_at": c_time,
            "updated_at": (now - timedelta(hours=2)).isoformat()
        }
        complaints_col.insert_one(doc)

        # Status history
        status_history_col.insert_one({
            "_id": str(uuid.uuid4()),
            "complaint_id": item["cid"],
            "status": "Submitted",
            "title": "Citizen Complaint Registered",
            "description": f"Registered with photo and GPS location coordinates.",
            "updated_by": "Arun Sharma",
            "timestamp": c_time
        })

        status_history_col.insert_one({
            "_id": str(uuid.uuid4()),
            "complaint_id": item["cid"],
            "status": "Assigned",
            "title": f"AI Routed to {ai_res['recommended_department']}",
            "description": f"Assigned {ai_res['priority_badge']} with {ai_res['confidence_percentage']}% confidence based on severity, location, and {item['report_count']} reports.",
            "updated_by": "CivicConnect AI Engine",
            "timestamp": c_time
        })

        if item["status"] in ["In Progress", "Resolved"]:
            status_history_col.insert_one({
                "_id": str(uuid.uuid4()),
                "complaint_id": item["cid"],
                "status": "In Progress",
                "title": "Work Commenced on Site",
                "description": "Field engineer acknowledged task and equipment dispatched to site.",
                "updated_by": "Department Dispatcher",
                "timestamp": (now - timedelta(hours=14)).isoformat()
            })

        if item["status"] == "Resolved":
            status_history_col.insert_one({
                "_id": str(uuid.uuid4()),
                "complaint_id": item["cid"],
                "status": "Resolved",
                "title": "Resolution Verified & Closed",
                "description": item.get("resolution_notes", "Task completed."),
                "proof_url": item.get("resolution_img"),
                "updated_by": "Supervising Officer",
                "timestamp": (now - timedelta(hours=2)).isoformat()
            })

    print(f"Seeded {len(sample_users)} users and {len(raw_complaints)} realistic complaints successfully!")
