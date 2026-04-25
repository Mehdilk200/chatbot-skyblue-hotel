from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from src.config.database import connect_to_mongo, close_mongo_connection
from src.routes import auth, conversation, reservations, rooms, services, complaints
from src.routes import admin

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()
    yield
    await close_mongo_connection()

from fastapi.staticfiles import StaticFiles
import os

app = FastAPI(
    title="SkyBlue Hotel Operations Assistant",
    description="Intelligent hotel operations backend with LangGraph integration",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Search for UI directory relative to this file
ui_path = os.path.join(os.path.dirname(__file__), "UI")
if os.path.exists(ui_path):
    app.mount("/ui", StaticFiles(directory=ui_path, html=True), name="ui")

uploads_path = os.path.join(os.path.dirname(__file__), "uploads")
if not os.path.exists(uploads_path):
    os.makedirs(uploads_path)
app.mount("/uploads", StaticFiles(directory=uploads_path), name="uploads")

app.include_router(auth.router)
app.include_router(conversation.router)
app.include_router(reservations.router)
app.include_router(rooms.router)
app.include_router(services.router)
app.include_router(complaints.router)
app.include_router(admin.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to SkyBlue Hotel Operations API"}
