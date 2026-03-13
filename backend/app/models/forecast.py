from beanie import Document
from typing import Optional
from datetime import datetime
from pydantic import ConfigDict


class Forecast(Document):
    model_config = ConfigDict(protected_namespaces=())

    business_id: str
    month: int
    year: int
    predicted_liability: float
    lower_bound: float
    upper_bound: float
    model_type: str = "prophet"
    trend: str = "stable"
    explanation: str = ""
    historical_data: Optional[list] = []
    forecast_data: Optional[list] = []
    created_at: datetime = datetime.utcnow()

    class Settings:
        name = "forecasts"
    month: int
    year: int
    predicted_liability: float
    lower_bound: float
    upper_bound: float
    model_type: str = "prophet"
    trend: str = "stable"
    explanation: str = ""
    historical_data: Optional[list] = []
    forecast_data: Optional[list] = []
    created_at: datetime = datetime.utcnow()

    class Settings:
        name = "forecasts"
