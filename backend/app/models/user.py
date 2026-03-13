from beanie import Document, Indexed
from pydantic import EmailStr
from typing import Optional
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    admin = "admin"
    accountant = "accountant"
    business_owner = "business_owner"


class User(Document):
    name: str
    email: Indexed(EmailStr, unique=True)
    password_hash: str
    role: UserRole = UserRole.business_owner
    is_active: bool = True
    created_at: datetime = datetime.utcnow()
    updated_at: Optional[datetime] = None

    class Settings:
        name = "users"
