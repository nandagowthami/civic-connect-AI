from typing import Optional
from fastapi import APIRouter, Depends
from ..database import notifications_col
from ..routers.auth import get_current_user

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])

@router.get("")
def list_notifications(current_user: Optional[dict] = Depends(get_current_user)):
    user_id = str(current_user.get("_id") or current_user.get("id")) if current_user else None
    
    query = {}
    if user_id:
        query = {"$or": [{"user_id": user_id}, {"user_id": "all"}]}
    
    items = notifications_col.find(query, sort=[("created_at", -1)], limit=30)
    # If no items, provide helpful default system alerts
    if not items:
        items = [
            {
                "_id": "welcome_notif",
                "title": "Welcome to CivicConnect AI",
                "message": "Report public infrastructure issues easily. Our AI classifies and prioritizes them in real-time.",
                "type": "welcome",
                "is_read": False,
                "created_at": "Just now"
            }
        ]
    return items

@router.patch("/{id}/read")
def mark_read(id: str):
    notifications_col.update_one({"_id": id}, {"$set": {"is_read": True}})
    return {"success": True}

@router.post("/mark-all-read")
def mark_all_read(current_user: Optional[dict] = Depends(get_current_user)):
    user_id = str(current_user.get("_id") or current_user.get("id")) if current_user else None
    if user_id:
        notifications_col.update_one({"user_id": user_id}, {"$set": {"is_read": True}})
    return {"success": True}
