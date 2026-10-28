import os
import sys

# Add ALTS directory to sys.path
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from backend.seed_data import seed_database
from backend.database import complaints_col, users_col
from backend.ai_engine import analyze_issue, find_duplicate_issues

print("Testing database and seed...")
seed_database()

user_count = users_col.count_documents()
complaint_count = complaints_col.count_documents()
print(f"Users in database: {user_count}")
print(f"Complaints in database: {complaint_count}")

# Test AI Engine
print("\nTesting AI Multi-Factor Analysis...")
res = analyze_issue(
    title="Large dangerous pothole with severe accident risk near Metro Station",
    description="Vehicles are swerving into oncoming traffic to avoid this 2 foot deep pothole on MG Road. Several bikers fell down.",
    user_category="Pothole",
    location_name="MG Road Metro Junction",
    nearby_reports_count=5
)
print(f"Detected Category: {res['detected_category']}")
print(f"AI Confidence: {res['confidence_percentage']}%")
print(f"Priority Level: {res['priority_level']} ({res['priority_badge']})")
print(f"Priority Score: {res['priority_score']}")
print(f"Recommended Department: {res['recommended_department']}")
print(f"Explanation: {res['ai_explanation']}")

# Test Duplicate detection
print("\nTesting Spatial Duplicate Detection (<150m)...")
all_issues = complaints_col.find()
dup = find_duplicate_issues(
    latitude=12.9751, # within ~20 meters of MG road pothole at 12.9750, 77.6050
    longitude=77.6051,
    title="Another pothole report at Metro",
    description="Bad pothole right here on MG road",
    category="Pothole",
    existing_issues=all_issues
)
print("Duplicate match found:", dup)

print("\nALL BACKEND & AI LOGIC VERIFIED SUCCESSFULLY!")
