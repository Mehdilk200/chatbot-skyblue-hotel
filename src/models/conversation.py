from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime
from src.models.base import PyObjectId

class Message(BaseModel):
    role: str 
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class ConversationBase(BaseModel):
    session_id: str
    messages: List[Message] = []

class ConversationCreate(ConversationBase):
    pass

class ConversationInDB(ConversationBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: Optional[PyObjectId] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ConversationResponse(ConversationBase):
    id: str = Field(alias="_id")
    user_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True
