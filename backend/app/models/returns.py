from beanie import Document
from typing import Optional, List
from datetime import datetime


class MonthlyReturn(Document):
    user_id: str
    business_id: str
    month: int  # 1-12
    year: int
    total_invoices: int = 0
    total_taxable_value: float = 0.0
    total_sales_tax: float = 0.0
    total_purchase_tax: float = 0.0
    input_tax_credit: float = 0.0
    net_gst_payable: float = 0.0
    cgst_payable: float = 0.0
    sgst_payable: float = 0.0
    igst_payable: float = 0.0
    flagged_invoices: int = 0
    status: str = "draft"  # draft, filed
    generated_at: datetime = datetime.utcnow()

    class Settings:
        name = "monthly_returns"


class Forecast(Document):
    business_id: str
    month: int
    year: int
    predicted_liability: float
    lower_bound: float
    upper_bound: float
    model_type: str = "prophet"
    trend: str = "stable"  # increasing, decreasing, stable
    explanation: str = ""
    created_at: datetime = datetime.utcnow()

    class Settings:
        name = "forecasts"
