import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    GEMINI_API_KEY: str = ""
    GEMINI_API_URL: str = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent"
    
    ENV: str = "development"
    DEBUG: bool = True
    
    ADMIN_EMAIL: str = ""
    ADMIN_PASSWORD: str = ""
    
    MONGODB_URI: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "skyblue_hotel"
    
    SECRET_KEY: str = "your-secret-key-here"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    class Config:
        # Resolve path relative to this file's directory
        # settings.py is in src/config/, so parent is src/
        _base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        env_file = os.path.join(_base_dir, ".env")
        extra = "ignore"

settings = Settings()

