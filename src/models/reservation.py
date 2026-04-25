from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime, date
from src.models.base import PyObjectId

class ReservationBase(BaseModel):
    client_id: str
    room_id: str
    date_start: date
    date_end: date
    status: str = "confirmed" # confirmed, cancelled, completed, no-show

class ReservationCreate(ReservationBase):
    pass

class ReservationInDB(ReservationBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ReservationResponse(ReservationBase):
    id: str = Field(alias="_id")
    created_at: datetime

    class Config:
        populate_by_name = True
