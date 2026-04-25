from motor.motor_asyncio import AsyncIOMotorClient
from src.config.settings import settings

client = None
db = None

async def connect_to_mongo():
    global client, db
    client = AsyncIOMotorClient(settings.MONGODB_URI)
    db = client[settings.MONGODB_DB_NAME]
    print(f"Connected to MongoDB at {settings.MONGODB_URI}")

async def close_mongo_connection():
    global client
    if client:
        client.close()
        print("Closed MongoDB connection")
def get_db():
    global db
    return db