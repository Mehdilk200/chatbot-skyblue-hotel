from fastapi import APIRouter, Depends
from typing import List
from src.services.hotel_operations import HotelOperationsService
from src.models.service import ServiceCreate, ServiceResponse
from src.middleware.auth import get_current_user

router = APIRouter(prefix="/services", tags=["Hotel Services"])

@router.post("", response_model=ServiceResponse, status_code=201)
async def create_service(service: ServiceCreate, user: dict = Depends(get_current_user)):
    service_dict = await HotelOperationsService.create_service(service)
    return ServiceResponse(**service_dict)

@router.get("", response_model=List[ServiceResponse])
async def get_services():
    services = await HotelOperationsService.get_services()
    return [ServiceResponse(**s) for s in services]
