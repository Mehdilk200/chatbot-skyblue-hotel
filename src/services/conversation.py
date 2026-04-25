from typing import List, Optional
from src.config import database
from src.models.conversation import ConversationInDB, Message
from bson import ObjectId

class ConversationService:
    @staticmethod
    async def save_conversation(session_id: str, messages: List[dict], user_id: Optional[str] = None) -> dict:
        uid = ObjectId(user_id) if user_id else None
        
        # Check if conversation exists
        existing_conv = await database.db.conversations.find_one({"session_id": session_id})
        
        if existing_conv:
            # Update
            await database.db.conversations.update_one(
                {"_id": existing_conv["_id"]},
                {"$set": {"messages": messages, "user_id": uid}}
            )
            existing_conv["messages"] = messages
            existing_conv["user_id"] = uid
            existing_conv["_id"] = str(existing_conv["_id"])
            if existing_conv.get("user_id"):
                existing_conv["user_id"] = str(existing_conv["user_id"])
            return existing_conv
        else:
            # Add new
            new_conv = ConversationInDB(
                session_id=session_id,
                messages=messages,
                user_id=uid
            )
            conv_dict = new_conv.model_dump(by_alias=True)
            conv_dict["_id"] = ObjectId()
            
            result = await database.db.conversations.insert_one(conv_dict)
            conv_dict["_id"] = str(result.inserted_id)
            if conv_dict.get("user_id"):
                conv_dict["user_id"] = str(conv_dict["user_id"])
            return conv_dict

    @staticmethod
    async def get_conversation(session_id: str) -> Optional[dict]:
        conv = await database.db.conversations.find_one({"session_id": session_id})
        if conv:
            conv["_id"] = str(conv["_id"])
            if conv.get("user_id"):
                conv["user_id"] = str(conv["user_id"])
        return conv

    @staticmethod
    async def get_user_conversations(user_id: str) -> List[dict]:
        cursor = database.db.conversations.find({"user_id": ObjectId(user_id)}).sort("updated_at", -1).limit(20)
        conversations = await cursor.to_list(length=20)
        for conv in conversations:
            conv["_id"] = str(conv["_id"])
            if conv.get("user_id"):
                conv["user_id"] = str(conv["user_id"])
        return conversations
