from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from src.models.base import PyObjectId

class UserBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    phone: Optional[str] = None
    role: str = "user"  # 'user' | 'admin'

class UserCreate(UserBase):
    password: str

class UserInDB(UserBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    password_hash: str
    is_verified: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class UserResponse(UserBase):
    id: str = Field(alias="_id")
    is_verified: bool
    created_at: datetime
    
    class Config:
        populate_by_name = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse
