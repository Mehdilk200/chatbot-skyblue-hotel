from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from src.config import database
from src.middleware.auth import get_current_user

router = APIRouter(prefix="/admin", tags=["Admin"])

def require_admin(user: dict = Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return user

@router.get("/stats")
async def get_admin_stats(user: dict = Depends(require_admin)):
    """Return dashboard statistics for admin panel."""
    total_rooms = await database.db.rooms.count_documents({})
    available_rooms = await database.db.rooms.count_documents({"status": "available"})
    occupied_rooms = await database.db.rooms.count_documents({"status": "occupied"})
    dirty_rooms = await database.db.rooms.count_documents({"status": "dirty"})
    maintenance_rooms = await database.db.rooms.count_documents({"status": "maintenance"})
    total_reservations = await database.db.reservations.count_documents({})
    pending_complaints = await database.db.complaints.count_documents({"status": "pending"})
    total_users = await database.db.users.count_documents({})
    total_categories = await database.db.room_categories.count_documents({})

    return {
        "total_rooms": total_rooms,
        "available_rooms": available_rooms,
        "occupied_rooms": occupied_rooms,
        "dirty_rooms": dirty_rooms,
        "maintenance_rooms": maintenance_rooms,
        "total_reservations": total_reservations,
        "pending_complaints": pending_complaints,
        "total_users": total_users,
        "total_categories": total_categories
    }

@router.get("/users")
async def get_all_users(user: dict = Depends(require_admin)):
    """Return all registered users (admin only)."""
    cursor = database.db.users.find({}, {"password_hash": 0})
    users = await cursor.to_list(length=500)
    for u in users:
        u["_id"] = str(u["_id"])
    return users

@router.patch("/users/{user_id}/role")
async def update_user_role(user_id: str, role: str, admin: dict = Depends(require_admin)):
    """Set a user's role to 'user' or 'admin'."""
    from bson import ObjectId
    if role not in ("user", "admin"):
        raise HTTPException(status_code=400, detail="Role must be 'user' or 'admin'")
    result = await database.db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"role": role}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"success": True, "user_id": user_id, "role": role}
