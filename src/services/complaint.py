from typing import List, Optional
from src.config import database
from bson import ObjectId
from src.models.complaint import ComplaintCreate, ComplaintInDB

class ComplaintService:
    @staticmethod
    async def create_complaint(complaint_data: ComplaintCreate) -> dict:
        db_complaint = ComplaintInDB(**complaint_data.model_dump())
        complaint_dict = db_complaint.model_dump(by_alias=True)
        complaint_dict["_id"] = ObjectId()
        
        result = await database.db.complaints.insert_one(complaint_dict)
        complaint_dict["_id"] = str(result.inserted_id)
        return complaint_dict

    @staticmethod
    async def get_complaints(client_id: Optional[str] = None) -> List[dict]:
        query = {"client_id": client_id} if client_id else {}
        cursor = database.db.complaints.find(query)
        complaints = await cursor.to_list(length=100)
        for complaint in complaints:
            complaint["_id"] = str(complaint["_id"])
        return complaints

    @staticmethod
    async def update_complaint_status(complaint_id: str, new_status: str) -> bool:
        result = await database.db.complaints.update_one(
            {"_id": ObjectId(complaint_id)},
            {"$set": {"status": new_status}}
        )
        return result.modified_count > 0
