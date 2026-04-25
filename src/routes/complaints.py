from fastapi import APIRouter, Depends, Query
from typing import List, Optional
from src.services.complaint import ComplaintService
from src.middleware.auth import get_current_user
from src.models.complaint import ComplaintCreate, ComplaintResponse

router = APIRouter(prefix="/complaints", tags=["Complaints"])

@router.post("", response_model=ComplaintResponse, status_code=201)
async def create_complaint(complaint: ComplaintCreate, user: dict = Depends(get_current_user)):
    user_id = str(user["_id"])
    if not complaint.client_id:
        complaint.client_id = user_id
    complaint_dict = await ComplaintService.create_complaint(complaint)
    return ComplaintResponse(**complaint_dict)

@router.get("", response_model=List[ComplaintResponse])
async def get_complaints(client_id: Optional[str] = Query(None), user: dict = Depends(get_current_user)):
    complaints = await ComplaintService.get_complaints(client_id)
    return [ComplaintResponse(**c) for c in complaints]
