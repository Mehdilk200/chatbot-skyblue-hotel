from typing import List, Optional
from src.config import database
from bson import ObjectId
from src.models.room import RoomCreate, RoomInDB, RoomUpdate
from src.models.room_category import RoomCategoryCreate, RoomCategoryInDB
from src.models.floor import FloorCreate, FloorInDB
from src.models.service import ServiceCreate, ServiceInDB

class HotelOperationsService:

    # --- Floors ---
    @staticmethod
    async def create_floor(floor_data: FloorCreate) -> dict:
        db_floor = FloorInDB(**floor_data.model_dump())
        floor_dict = db_floor.model_dump(by_alias=True)
        floor_dict["_id"] = ObjectId()
        result = await database.db.floors.insert_one(floor_dict)
        floor_dict["_id"] = str(result.inserted_id)
        return floor_dict

    @staticmethod
    async def get_floors() -> List[dict]:
        cursor = database.db.floors.find({})
        floors = await cursor.to_list(length=100)
        for floor in floors:
            floor["_id"] = str(floor["_id"])
        return floors

    # --- Room Categories ---
    @staticmethod
    async def create_room_category(category_data: RoomCategoryCreate) -> dict:
        db_category = RoomCategoryInDB(**category_data.model_dump())
        category_dict = db_category.model_dump(by_alias=True)
        category_dict["_id"] = ObjectId()
        result = await database.db.room_categories.insert_one(category_dict)
        category_dict["_id"] = str(result.inserted_id)
        return category_dict

    @staticmethod
    async def get_room_categories() -> List[dict]:
        cursor = database.db.room_categories.find({})
        categories = await cursor.to_list(length=100)
        for category in categories:
            category["_id"] = str(category["_id"])
        return categories

    # --- Rooms ---
    @staticmethod
    async def create_room(room_data: RoomCreate) -> dict:
        db_room = RoomInDB(**room_data.model_dump())
        room_dict = db_room.model_dump(by_alias=True)
        room_dict["_id"] = ObjectId()
        result = await database.db.rooms.insert_one(room_dict)
        room_dict["_id"] = str(result.inserted_id)

        # Add to RAG Knowledge Base
        from src.services.rag_service import rag_service
        rag_service.add_room_to_knowledge_base(
            room_id=room_dict["_id"],
            room_number=room_dict["number"],
            description=room_dict.get("description", ""),
            characteristics=room_dict.get("characteristics", [])
        )

        return room_dict

    @staticmethod
    async def get_rooms(status: Optional[str] = None) -> List[dict]:
        query = {"status": status} if status else {}
        cursor = database.db.rooms.find(query)
        rooms = await cursor.to_list(length=200)
        for room in rooms:
            room["_id"] = str(room["_id"])
        return rooms

    @staticmethod
    async def get_room_by_id(room_id: str) -> Optional[dict]:
        try:
            room = await database.db.rooms.find_one({"_id": ObjectId(room_id)})
            if room:
                room["_id"] = str(room["_id"])
            return room
        except Exception:
            return None

    @staticmethod
    async def update_room(room_id: str, update_data: RoomUpdate) -> Optional[dict]:
        changes = {k: v for k, v in update_data.model_dump().items() if v is not None}
        if not changes:
            return await HotelOperationsService.get_room_by_id(room_id)
        try:
            result = await database.db.rooms.update_one(
                {"_id": ObjectId(room_id)},
                {"$set": changes}
            )
            if result.matched_count == 0:
                return None
            return await HotelOperationsService.get_room_by_id(room_id)
        except Exception:
            return None

    @staticmethod
    async def delete_room(room_id: str) -> bool:
        try:
            result = await database.db.rooms.delete_one({"_id": ObjectId(room_id)})
            return result.deleted_count > 0
        except Exception:
            return False

    # --- Hotel Services ---
    @staticmethod
    async def create_service(service_data: ServiceCreate) -> dict:
        db_service = ServiceInDB(**service_data.model_dump())
        service_dict = db_service.model_dump(by_alias=True)
        service_dict["_id"] = ObjectId()
        result = await database.db.services.insert_one(service_dict)
        service_dict["_id"] = str(result.inserted_id)
        return service_dict

    @staticmethod
    async def get_services() -> List[dict]:
        cursor = database.db.services.find({})
        services = await cursor.to_list(length=100)
        for service in services:
            service["_id"] = str(service["_id"])
        return services
