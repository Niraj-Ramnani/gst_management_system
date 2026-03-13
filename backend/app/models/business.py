from beanie import Document
from pydantic import Field
from typing import Optional
from datetime import datetime
from bson import ObjectId
from enum import Enum


class FilingFrequency(str, Enum):
    monthly = "monthly"
    quarterly = "quarterly"


class BusinessProfile(Document):
    user_id: str
    business_name: str
    gstin: str
    state: str
    state_code: str
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    address: Optional[str] = None
    filing_frequency: FilingFrequency = FilingFrequency.monthly
    pan: Optional[str] = None
    created_at: datetime = datetime.utcnow()
    updated_at: Optional[datetime] = None

    class Settings:
        name = "business_profiles"
