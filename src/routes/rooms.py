from fastapi import APIRouter, Depends, Query, HTTPException, status, UploadFile, File
from typing import List, Optional
import os
import uuid
from src.services.hotel_operations import HotelOperationsService
from src.models.room import RoomCreate, RoomResponse, RoomUpdate
from src.models.room_category import RoomCategoryCreate, RoomCategoryResponse
from src.models.floor import FloorCreate, FloorResponse
from src.middleware.auth import get_current_user

router = APIRouter(prefix="/hotel", tags=["Hotel Operations"])

# --- Floors ---
@router.post("/floors", response_model=FloorResponse, status_code=201)
async def create_floor(floor: FloorCreate, user: dict = Depends(get_current_user)):
    floor_dict = await HotelOperationsService.create_floor(floor)
    return FloorResponse(**floor_dict)

@router.get("/floors", response_model=List[FloorResponse])
async def get_floors():
    floors = await HotelOperationsService.get_floors()
    return [FloorResponse(**f) for f in floors]

# --- Categories ---
@router.post("/categories", response_model=RoomCategoryResponse, status_code=201)
async def create_category(category: RoomCategoryCreate, user: dict = Depends(get_current_user)):
    cat_dict = await HotelOperationsService.create_room_category(category)
    return RoomCategoryResponse(**cat_dict)

@router.get("/categories", response_model=List[RoomCategoryResponse])
async def get_categories():
    categories = await HotelOperationsService.get_room_categories()
    return [RoomCategoryResponse(**c) for c in categories]

# --- Rooms ---
@router.post("/rooms", response_model=RoomResponse, status_code=201)
async def create_room(room: RoomCreate, user: dict = Depends(get_current_user)):
    room_dict = await HotelOperationsService.create_room(room)
    return RoomResponse(**room_dict)

@router.get("/rooms", response_model=List[RoomResponse])
async def get_rooms(status: Optional[str] = Query(None)):
    rooms = await HotelOperationsService.get_rooms(status)
    return [RoomResponse(**r) for r in rooms]

@router.get("/rooms/{room_id}", response_model=RoomResponse)
async def get_room(room_id: str):
    room = await HotelOperationsService.get_room_by_id(room_id)
    if not room:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")
    return RoomResponse(**room)

@router.patch("/rooms/{room_id}", response_model=RoomResponse)
async def update_room(room_id: str, update_data: RoomUpdate, user: dict = Depends(get_current_user)):
    room = await HotelOperationsService.update_room(room_id, update_data)
    if not room:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")
    return RoomResponse(**room)

@router.delete("/rooms/{room_id}", status_code=204)
async def delete_room(room_id: str, user: dict = Depends(get_current_user)):
    deleted = await HotelOperationsService.delete_room(room_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")

@router.post("/rooms/{room_id}/upload_image", response_model=RoomResponse)
async def upload_room_image(room_id: str, file: UploadFile = File(...), user: dict = Depends(get_current_user)):
    room = await HotelOperationsService.get_room_by_id(room_id)
    if not room:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")
        
    # Ensure uploads directory exists
    uploads_dir = os.path.join(os.path.dirname(__file__), "..", "uploads")
    if not os.path.exists(uploads_dir):
        os.makedirs(uploads_dir)
        
    # Generate unique filename
    ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    filename = f"{uuid.uuid4()}.{ext}"
    file_path = os.path.join(uploads_dir, filename)
    
    # Save file
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
        
    # Update room with new image URL
    image_url = f"/uploads/{filename}"
    images = room.get("images", [])
    images.append(image_url)
    
    update_data = RoomUpdate(images=images)
    updated_room = await HotelOperationsService.update_room(room_id, update_data)
    
    return RoomResponse(**updated_room)
