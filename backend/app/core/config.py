from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # App
    APP_NAME: str = "GST Management System"
    DEBUG: bool = False

    # Database
    MONGODB_URL: str = "mmongodb+srv://hariom:hariom007@cluster0.qtcwg.mongodb.net/gst_management"
    DATABASE_NAME: str = "gst_management"

    # JWT
    SECRET_KEY: str = "your-super-secret-key-change-in-production-min-32-chars"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # CORS
    ALLOWED_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]

    # File Storage
    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE_MB: int = 10
    ALLOWED_EXTENSIONS: List[str] = ["pdf", "jpg", "jpeg", "png"]

    # ML
    FRAUD_THRESHOLD: float = 0.6
    MODEL_DIR: str = "app/ml/models"

    class Config:
        env_file = ".env"


settings = Settings()
