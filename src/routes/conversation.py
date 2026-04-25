from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from pydantic import BaseModel
from src.services.conversation import ConversationService
from src.services.chatbot_orchestrator import chatbot

from src.middleware.auth import get_current_user_optional, get_current_user
from src.models.conversation import ConversationResponse
from src.services.chatbot_orchestrator import chatbot

router = APIRouter(prefix="/conversations", tags=["Conversations"])


class ConversationSaveRequest(BaseModel):
    sessionId: str
    messages: List[dict]

class ChatMessageRequest(BaseModel):
    message: str
    sessionId: Optional[str] = None
    image_base64: Optional[str] = None


@router.post("", response_model=ConversationResponse, status_code=201)
async def save_conversation(request: ConversationSaveRequest, user: Optional[dict] = Depends(get_current_user_optional)):
    user_id = str(user["_id"]) if user else None
    conv = await ConversationService.save_conversation(request.sessionId, request.messages, user_id)
    return ConversationResponse(**conv)

@router.get("/{sessionId}", response_model=ConversationResponse)
async def get_conversation(sessionId: str, user: Optional[dict] = Depends(get_current_user_optional)):
    conv = await ConversationService.get_conversation(sessionId)
    if not conv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
        
    if conv.get("user_id") and (not user or str(user["_id"]) != conv["user_id"]):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized access to conversation")
        
    return ConversationResponse(**conv)

@router.get("", response_model=List[ConversationResponse])
async def get_user_conversations(user: dict = Depends(get_current_user)):
    conversations = await ConversationService.get_user_conversations(str(user["_id"]))
    return [ConversationResponse(**c) for c in conversations]
@router.post("/chat")
async def chat_with_assistant(request: ChatMessageRequest, user: Optional[dict] = Depends(get_current_user_optional)):
    user_id = str(user["_id"]) if user else "anonymous"
    response = await chatbot.process_message(request.message, user_id, request.image_base64)
    return {"reply": response}
