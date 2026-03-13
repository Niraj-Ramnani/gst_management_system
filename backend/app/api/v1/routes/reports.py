from fastapi import APIRouter, Depends, Query
from app.models.user import User
from app.core.dependencies import get_current_user
from app.services.report_service import generate_invoice_summary, generate_tax_summary

router = APIRouter()


@router.get("/invoice-summary")
async def invoice_summary(
    month: int = Query(None, ge=1, le=12),
    year: int = Query(None),
    current_user: User = Depends(get_current_user),
):
    return await generate_invoice_summary(str(current_user.id), month, year)


@router.get("/tax-summary")
async def tax_summary(
    month: int = Query(None, ge=1, le=12),
    year: int = Query(None),
    current_user: User = Depends(get_current_user),
):
    return await generate_tax_summary(str(current_user.id), month, year)
