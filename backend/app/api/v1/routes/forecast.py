from fastapi import APIRouter, Depends, Query
from app.models.user import User
from app.models.business import BusinessProfile
from app.core.dependencies import get_current_user
from app.services.forecast_service import get_next_month_forecast, train_forecast_model

router = APIRouter()


@router.get("/next-month")
async def next_month_forecast(current_user: User = Depends(get_current_user)):
    profile = await BusinessProfile.find_one(BusinessProfile.user_id == str(current_user.id))
    if not profile:
        return {"error": "No business profile found"}
    return await get_next_month_forecast(str(profile.id))


@router.post("/train")
async def train_model(current_user: User = Depends(get_current_user)):
    profile = await BusinessProfile.find_one(BusinessProfile.user_id == str(current_user.id))
    if not profile:
        return {"error": "No business profile found"}
    result = await train_forecast_model(str(profile.id))
    return result
