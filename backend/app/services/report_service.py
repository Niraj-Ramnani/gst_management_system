from app.models.invoice import Invoice, InvoiceStatus, InvoiceType
from app.models.returns import MonthlyReturn


async def generate_invoice_summary(user_id: str, month=None, year=None) -> dict:
    query = Invoice.find(Invoice.user_id == user_id)
    invoices = await query.to_list()

    if month and year:
        invoices = [i for i in invoices if _matches_period(i.invoice_date, month, year)]

    return {
        "total": len(invoices),
        "by_status": _group_by(invoices, lambda i: i.status),
        "by_type": _group_by(invoices, lambda i: i.invoice_type),
        "total_value": sum(i.total_amount or 0 for i in invoices),
        "verified": sum(1 for i in invoices if i.status == InvoiceStatus.verified),
    }


async def generate_tax_summary(user_id: str, month=None, year=None) -> dict:
    returns = await MonthlyReturn.find(MonthlyReturn.user_id == user_id).to_list()
    if month and year:
        returns = [r for r in returns if r.month == month and r.year == year]
    return {
        "periods": len(returns),
        "total_sales_tax": sum(r.total_sales_tax for r in returns),
        "total_purchase_tax": sum(r.total_purchase_tax for r in returns),
        "total_input_tax_credit": sum(r.input_tax_credit for r in returns),
        "total_net_gst_payable": sum(r.net_gst_payable for r in returns),
        "monthly": [r.dict() for r in returns],
    }




def _matches_period(date_str, month, year):
    if not date_str:
        return False
    try:
        parts = date_str.replace("/", "-").split("-")
        if len(parts) == 3:
            y = int(parts[0]) if len(parts[0]) == 4 else int(parts[2])
            m = int(parts[1])
            return m == month and y == year
    except Exception:
        pass
    return False


def _group_by(items, key_fn):
    result = {}
    for item in items:
        k = str(key_fn(item))
        result[k] = result.get(k, 0) + 1
    return result
