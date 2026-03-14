from app.models.invoice import Invoice, InvoiceStatus, InvoiceType
from app.models.returns import MonthlyReturn
from app.services.gst_service import calculate_aggregates
from datetime import datetime

async def generate_invoice_summary(user_id: str, month=None, year=None) -> dict:
    query = Invoice.find(Invoice.user_id == user_id)
    invoices = await query.to_list()

    if month and year:
        invoices = [i for i in invoices if _matches_period(i.invoice_date, month, year)]

    by_status = _group_by(invoices, lambda i: i.status)
    # Ensure all statuses exist for consistency in frontend
    for status in [s.value for s in InvoiceStatus]:
        if status not in by_status:
            by_status[status] = 0

    return {
        "total": len(invoices),
        "by_status": by_status,
        "by_type": _group_by(invoices, lambda i: i.invoice_type),
        "total_value": sum(i.total_amount or 0 for i in invoices),
        "verified": sum(1 for i in invoices if i.status == InvoiceStatus.verified),
    }


async def generate_tax_summary(user_id: str, month=None, year=None) -> dict:
    """Provides a tax summary. If no returns exist, calculates dynamically from invoices."""
    returns = await MonthlyReturn.find(MonthlyReturn.user_id == user_id).sort("year", "month").to_list()
    
    # If no returns found, let's aggregate invoices to provide SOMETHING for the dashboard
    if not returns:
        invoices = await Invoice.find(
            Invoice.user_id == user_id,
            Invoice.status != InvoiceStatus.uploaded  # Only process parsed/verified
        ).to_list()
        
        # Group by month/year for the trend chart
        monthly_data = {}
        for inv in invoices:
            if not inv.invoice_date: continue
            try:
                parts = inv.invoice_date.replace("/", "-").split("-")
                y = int(parts[0]) if len(parts[0]) == 4 else int(parts[2])
                m = int(parts[1])
                key = f"{y}-{m}"
                if key not in monthly_data: monthly_data[key] = []
                monthly_data[key].append(inv)
            except: continue
        
        simulated_returns = []
        for key, invs in monthly_data.items():
            y, m = map(int, key.split("-"))
            agg = calculate_aggregates(invs)
            agg.update({"month": m, "year": y})
            simulated_returns.append(agg)
        
        # Sort by date
        simulated_returns.sort(key=lambda x: (x["year"], x["month"]))
        returns_to_use = simulated_returns
    else:
        returns_to_use = [r.dict() if hasattr(r, 'dict') else r for r in returns]

    if month and year:
        filtered = [r for r in returns_to_use if r.get("month") == month and r.get("year") == year]
    else:
        filtered = returns_to_use

    return {
        "periods": len(filtered),
        "total_sales_tax": round(sum(r.get("total_sales_tax", 0) for r in filtered), 2),
        "total_purchase_tax": round(sum(r.get("total_purchase_tax", 0) for r in filtered), 2),
        "total_input_tax_credit": round(sum(r.get("input_tax_credit", 0) for r in filtered), 2),
        "total_net_gst_payable": round(sum(r.get("net_gst_payable", 0) for r in filtered), 2),
        "monthly": returns_to_use,
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
