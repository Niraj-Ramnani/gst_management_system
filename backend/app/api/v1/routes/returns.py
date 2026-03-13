from fastapi import APIRouter, Depends, Query
from app.models.user import User
from app.models.returns import MonthlyReturn
from app.core.dependencies import get_current_user
from app.services.gst_service import generate_monthly_return

router = APIRouter()


@router.get("/monthly-summary")
async def get_monthly_summary(
    month: int = Query(..., ge=1, le=12),
    year: int = Query(..., ge=2020),
    current_user: User = Depends(get_current_user),
):
    existing = await MonthlyReturn.find_one(
        MonthlyReturn.user_id == str(current_user.id),
        MonthlyReturn.month == month,
        MonthlyReturn.year == year,
    )
    if existing:
        return existing.dict()
    return {"message": "No return generated yet for this period", "month": month, "year": year}


@router.post("/generate")
async def generate_return(
    month: int = Query(..., ge=1, le=12),
    year: int = Query(..., ge=2020),
    current_user: User = Depends(get_current_user),
):
    result = await generate_monthly_return(str(current_user.id), month, year)
    return result
