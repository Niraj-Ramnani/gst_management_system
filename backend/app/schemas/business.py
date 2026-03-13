from pydantic import BaseModel
from typing import Optional
from app.models.business import FilingFrequency


class BusinessProfileCreate(BaseModel):
    business_name: str
    gstin: str
    state: str
    state_code: str
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    address: Optional[str] = None
    filing_frequency: FilingFrequency = FilingFrequency.monthly
    pan: Optional[str] = None


class BusinessProfileResponse(BaseModel):
    id: str
    user_id: str
    business_name: str
    gstin: str
    state: str
    state_code: str
    contact_email: Optional[str]
    contact_phone: Optional[str]
    address: Optional[str]
    filing_frequency: FilingFrequency
    pan: Optional[str]

    class Config:
        from_attributes = True
