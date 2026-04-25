from typing import Optional
from pydantic import BaseModel, Field
from src.models.base import PyObjectId

class ComplaintBase(BaseModel):
    client_id: str
    type: str          # Room, Service, Noise, etc.
    description: str = ""  # Actual complaint text content
    priority: str      # Low, Medium, High
    status: str = "pending"  # pending, in_progress, resolved

class ComplaintCreate(ComplaintBase):
    pass

class ComplaintInDB(ComplaintBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")

class ComplaintResponse(ComplaintBase):
    id: str = Field(alias="_id")

    class Config:
        populate_by_name = True
