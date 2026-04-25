from typing import Optional, List
from pydantic import BaseModel, Field
from src.models.base import PyObjectId

class RoomBase(BaseModel):
    number: str
    floor_id: str
    category_id: str
    status: str = "available"       # available, occupied, dirty, maintenance
    description: str = ""
    characteristics: List[str] = []
    price: Optional[float] = None   # Override price; if None, falls back to category price
    images: List[str] = []          # List of image URLs

class RoomCreate(RoomBase):
    pass

class RoomUpdate(BaseModel):
    status: Optional[str] = None
    description: Optional[str] = None
    characteristics: Optional[List[str]] = None
    price: Optional[float] = None
    images: Optional[List[str]] = None

class RoomInDB(RoomBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")

class RoomResponse(RoomBase):
    id: str = Field(alias="_id")

    class Config:
        populate_by_name = True
