import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.routers import auth, issues, departments, analytics, notifications
from backend.seed_data import seed_database

app = FastAPI(
    title="CivicConnect AI API",
    description="Crowdsourced Civic Issue Reporting and AI-Based Priority Routing System",
    version="1.0.0"
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static uploads directory for photos
UPLOAD_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "uploads"))
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(os.path.join(UPLOAD_DIR, "proofs"), exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Include Routers
app.include_router(auth.router)
app.include_router(issues.router)
app.include_router(departments.router)
app.include_router(analytics.router)
app.include_router(notifications.router)

@app.on_event("startup")
def on_startup():
    try:
        seed_database()
    except Exception as e:
        print(f"Seed startup warning: {e}")

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "system": "CivicConnect AI",
        "version": "1.0.0",
        "timestamp": os.getenv("CURRENT_TIME", "2026-09-08")
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
