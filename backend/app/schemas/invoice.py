from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.models.invoice import InvoiceStatus, InvoiceType


class InvoiceResponse(BaseModel):
    id: str
    user_id: str
    business_id: str
    original_filename: str
    invoice_type: InvoiceType
    invoice_number: Optional[str]
    invoice_date: Optional[str]
    supplier_name: Optional[str]
    supplier_gstin: Optional[str]
    buyer_name: Optional[str]
    buyer_gstin: Optional[str]
    taxable_amount: Optional[float]
    cgst: Optional[float]
    sgst: Optional[float]
    igst: Optional[float]
    total_amount: Optional[float]
    parser_confidence: Optional[float]
    status: InvoiceStatus
    is_interstate: bool
    created_at: datetime

    class Config:
        from_attributes = True


class InvoiceReview(BaseModel):
    invoice_number: Optional[str] = None
    invoice_date: Optional[str] = None
    supplier_name: Optional[str] = None
    supplier_gstin: Optional[str] = None
    buyer_name: Optional[str] = None
    buyer_gstin: Optional[str] = None
    taxable_amount: Optional[float] = None
    cgst: Optional[float] = None
    sgst: Optional[float] = None
    igst: Optional[float] = None
    total_amount: Optional[float] = None
    invoice_type: Optional[InvoiceType] = None
    place_of_supply: Optional[str] = None
    is_interstate: Optional[bool] = None


class InvoiceListResponse(BaseModel):
    invoices: List[InvoiceResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
