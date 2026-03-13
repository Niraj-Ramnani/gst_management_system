from beanie import Document
from pydantic import Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class InvoiceStatus(str, Enum):
    uploaded = "uploaded"
    parsed = "parsed"
    verified = "verified"
    flagged = "flagged"
    included_in_return = "included_in_return"


class InvoiceType(str, Enum):
    purchase = "purchase"
    sale = "sale"


class LineItem(Document):
    description: Optional[str] = None
    hsn_sac: Optional[str] = None
    quantity: Optional[float] = None
    unit: Optional[str] = None
    rate: Optional[float] = None
    taxable_value: Optional[float] = None
    cgst_rate: Optional[float] = None
    sgst_rate: Optional[float] = None
    igst_rate: Optional[float] = None


class Invoice(Document):
    user_id: str
    business_id: str
    file_path: str
    original_filename: str
    invoice_type: InvoiceType = InvoiceType.purchase

    # Extracted fields
    invoice_number: Optional[str] = None
    invoice_date: Optional[str] = None
    supplier_name: Optional[str] = None
    supplier_gstin: Optional[str] = None
    buyer_name: Optional[str] = None
    buyer_gstin: Optional[str] = None
    place_of_supply: Optional[str] = None
    hsn_sac_code: Optional[str] = None

    # Amounts
    taxable_amount: Optional[float] = 0.0
    cgst: Optional[float] = 0.0
    sgst: Optional[float] = 0.0
    igst: Optional[float] = 0.0
    total_amount: Optional[float] = 0.0

    # Transaction type
    is_interstate: bool = False

    # ML outputs
    parser_confidence: Optional[float] = None
    parsed_data: Optional[Dict[str, Any]] = None
    corrected_data: Optional[Dict[str, Any]] = None
    line_items: Optional[List[Dict[str, Any]]] = []

    # Status
    status: InvoiceStatus = InvoiceStatus.uploaded
    created_at: datetime = datetime.utcnow()
    updated_at: Optional[datetime] = None

    class Settings:
        name = "invoices"
