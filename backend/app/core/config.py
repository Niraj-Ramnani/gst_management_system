from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    # App
    APP_NAME: str = "GST Management System"
    DEBUG: bool = False

    # Database
    MONGODB_URL: str
    DATABASE_NAME: str

    # JWT
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int

    # CORS
    ALLOWED_ORIGINS: List[str]

    # File Storage
    UPLOAD_DIR: str
    MAX_FILE_SIZE_MB: int
    ALLOWED_EXTENSIONS: List[str] = ["pdf", "jpg", "jpeg", "png"]

    # ML
    GROQ_API_KEY: str = ""
    FRAUD_THRESHOLD: float = 0.6
    MODEL_DIR: str = "app/ml/models"

    class Config:
        env_file = ".env"

settings = Settings()
