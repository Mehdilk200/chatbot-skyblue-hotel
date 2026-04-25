from typing import Optional
from pydantic import BaseModel, Field
from src.models.base import PyObjectId

class RoomCategoryBase(BaseModel):
    name: str  # Standard, Deluxe, Suite
    base_price: float
    capacity: int

class RoomCategoryCreate(RoomCategoryBase):
    pass

class RoomCategoryInDB(RoomCategoryBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")

class RoomCategoryResponse(RoomCategoryBase):
    id: str = Field(alias="_id")

    class Config:
        populate_by_name = True
