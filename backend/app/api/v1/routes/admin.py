from fastapi import APIRouter, Depends, Query
from app.models.user import User
from app.models.audit import AuditLog
from app.core.dependencies import get_current_admin

router = APIRouter()


@router.get("/audit-logs")
async def get_audit_logs(
    page: int = Query(1, ge=1),
    page_size: int = Query(50),
    current_user: User = Depends(get_current_admin),
):
    logs = await AuditLog.find().sort(-AuditLog.timestamp).skip((page - 1) * page_size).limit(page_size).to_list()
    total = await AuditLog.count()
    return {"logs": [l.dict() for l in logs], "total": total}


@router.get("/users")
async def list_users(current_user: User = Depends(get_current_admin)):
    users = await User.find().to_list()
    return [{"id": str(u.id), "name": u.name, "email": u.email, "role": u.role, "is_active": u.is_active} for u in users]


@router.get("/stats")
async def admin_stats(current_user: User = Depends(get_current_admin)):
    from app.models.invoice import Invoice
    from app.models.business import BusinessProfile
    return {
        "total_users": await User.count(),
        "total_businesses": await BusinessProfile.count(),
        "total_invoices": await Invoice.count(),
        "flagged_invoices": await Invoice.find(Invoice.is_fraudulent == True).count(),
    }
