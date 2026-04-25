from typing import Optional
from pydantic import BaseModel, Field
from src.models.base import PyObjectId

class FloorBase(BaseModel):
    number: int
    description: Optional[str] = None

class FloorCreate(FloorBase):
    pass

class FloorInDB(FloorBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")

class FloorResponse(FloorBase):
    id: str = Field(alias="_id")

    class Config:
        populate_by_name = True
