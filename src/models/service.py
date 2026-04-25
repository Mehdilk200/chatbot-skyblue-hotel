from typing import Optional
from pydantic import BaseModel, Field
from src.models.base import PyObjectId

class ServiceBase(BaseModel):
    name: str # e.g. Breakfast, Spa, Transport
    price: float

class ServiceCreate(ServiceBase):
    pass

class ServiceInDB(ServiceBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")

class ServiceResponse(ServiceBase):
    id: str = Field(alias="_id")

    class Config:
        populate_by_name = True
