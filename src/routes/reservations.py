from fastapi import APIRouter, Depends
from typing import List
from src.services.reservation import ReservationService
from src.middleware.auth import get_current_user
from src.models.reservation import ReservationCreate, ReservationResponse

router = APIRouter(prefix="/reservations", tags=["Reservations"])

@router.post("", response_model=ReservationResponse, status_code=201)
async def create_reservation(reservation: ReservationCreate, user: dict = Depends(get_current_user)):
    user_id = str(user["_id"])
    if not reservation.client_id:
        reservation.client_id = user_id
    reservation_dict = await ReservationService.create_reservation(user_id, reservation)
    return ReservationResponse(**reservation_dict)

@router.get("", response_model=List[ReservationResponse])
async def get_user_reservations(user: dict = Depends(get_current_user)):
    user_id = str(user["_id"])
    reservations = await ReservationService.get_client_reservations(user_id)
    return [ReservationResponse(**r) for r in reservations]
