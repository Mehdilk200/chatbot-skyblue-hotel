from typing import List
from src.config import database
from src.models.reservation import ReservationCreate, ReservationInDB
from bson import ObjectId

class ReservationService:
    @staticmethod
    async def create_reservation(client_id: str, reservation_data: ReservationCreate) -> dict:
        from datetime import date, datetime
        db_reservation = ReservationInDB(**reservation_data.model_dump())
        reservation_dict = db_reservation.model_dump(by_alias=True)
        reservation_dict["_id"] = ObjectId()

        # Convert date/datetime objects to ISO strings for MongoDB compatibility
        for key, val in reservation_dict.items():
            if isinstance(val, (date, datetime)):
                reservation_dict[key] = val.isoformat()

        result = await database.db.reservations.insert_one(reservation_dict)
        reservation_dict["_id"] = str(result.inserted_id)
        return reservation_dict

    @staticmethod
    async def get_client_reservations(client_id: str) -> List[dict]:
        cursor = database.db.reservations.find({"client_id": client_id}).sort("created_at", -1)
        reservations = await cursor.to_list(length=100)
        for reservation in reservations:
            reservation["_id"] = str(reservation["_id"])
        return reservations
