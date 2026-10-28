from fastapi import APIRouter
from ..database import departments_col, complaints_col, users_col

router = APIRouter(prefix="/api/departments", tags=["Departments"])

DEFAULT_DEPARTMENTS = [
    {
        "id": "dept_roads",
        "name": "Roads and Transportation Department",
        "code": "ROADS",
        "icon": "Car",
        "color": "#2563eb",
        "description": "Pothole repair, road surface reconstruction, dividers, and asphalt maintenance."
    },
    {
        "id": "dept_sanitation",
        "name": "Sanitation Department",
        "code": "SANITATION",
        "icon": "Trash2",
        "color": "#16a34a",
        "description": "Garbage clearing, solid waste disposal, public dustbin clearance, and community cleanliness."
    },
    {
        "id": "dept_electricity",
        "name": "Electricity Department",
        "code": "ELECTRICITY",
        "icon": "Zap",
        "color": "#eab308",
        "description": "Streetlight maintenance, electrical pole repairs, power lines, and illumination."
    },
    {
        "id": "dept_water",
        "name": "Water Supply Department",
        "code": "WATER",
        "icon": "Droplets",
        "color": "#0284c7",
        "description": "Potable water pipeline repairs, leak detection, valve replacements, and supply restoration."
    },
    {
        "id": "dept_municipal",
        "name": "Municipal Engineering Department",
        "code": "MUNICIPAL",
        "icon": "Wrench",
        "color": "#8b5cf6",
        "description": "Stormwater drains, sewer blockages, manhole maintenance, and urban drainage networks."
    },
    {
        "id": "dept_safety",
        "name": "Emergency / Public Safety Department",
        "code": "SAFETY",
        "icon": "ShieldAlert",
        "color": "#dc2626",
        "description": "Immediate hazards, live wires, structural collapse risks, and emergency public interventions."
    },
    {
        "id": "dept_public_works",
        "name": "Public Works Department",
        "code": "PWD",
        "icon": "Building2",
        "color": "#f97316",
        "description": "Public park infrastructure, bus shelters, municipal property, and civic amenities."
    },
    {
        "id": "dept_traffic",
        "name": "Traffic Management Department",
        "code": "TRAFFIC",
        "icon": "Navigation",
        "color": "#0891b2",
        "description": "Traffic lights, junction management, road signboards, and lane markings."
    }
]

@router.get("")
def get_departments():
    complaints = complaints_col.find()
    depts = []
    
    for d in DEFAULT_DEPARTMENTS:
        d_name = d["name"]
        dept_issues = [c for c in complaints if c.get("department") == d_name]
        
        total = len(dept_issues)
        high_pri = len([c for c in dept_issues if c.get("priority") == "HIGH"])
        pending = len([c for c in dept_issues if c.get("status") in ["Assigned", "Under AI Review", "Submitted"]])
        in_progress = len([c for c in dept_issues if c.get("status") == "In Progress"])
        resolved = len([c for c in dept_issues if c.get("status") == "Resolved"])
        
        res_rate = round((resolved / total * 100) if total > 0 else 100, 1)

        depts.append({
            **d,
            "total_complaints": total,
            "high_priority_count": high_pri,
            "pending_count": pending,
            "in_progress_count": in_progress,
            "resolved_count": resolved,
            "resolution_rate": res_rate
        })

    return depts
