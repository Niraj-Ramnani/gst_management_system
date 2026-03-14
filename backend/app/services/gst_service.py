"""
GST Calculation Engine
- Intra-state: CGST + SGST
- Inter-state: IGST
- Monthly aggregation
- Input tax credit
"""
from datetime import datetime
from app.models.invoice import Invoice, InvoiceStatus, InvoiceType
from app.models.returns import MonthlyReturn
from app.models.business import BusinessProfile
from beanie.operators import In

# Indian GST rate slabs
GST_SLABS = [0, 5, 12, 18, 28]

INDIAN_STATES = {
    "01": "Jammu and Kashmir", "02": "Himachal Pradesh", "03": "Punjab",
    "04": "Chandigarh", "05": "Uttarakhand", "06": "Haryana",
    "07": "Delhi", "08": "Rajasthan", "09": "Uttar Pradesh",
    "10": "Bihar", "11": "Sikkim", "12": "Arunachal Pradesh",
    "13": "Nagaland", "14": "Manipur", "15": "Mizoram",
    "16": "Tripura", "17": "Meghalaya", "18": "Assam",
    "19": "West Bengal", "20": "Jharkhand", "21": "Odisha",
    "22": "Chhattisgarh", "23": "Madhya Pradesh", "24": "Gujarat",
    "27": "Maharashtra", "29": "Karnataka", "32": "Kerala",
    "33": "Tamil Nadu", "36": "Telangana", "37": "Andhra Pradesh",
}


def determine_interstate(supplier_gstin: str, buyer_gstin: str, business_state_code: str) -> bool:
    """Check if transaction is inter-state based on GSTINs."""
    if supplier_gstin and len(supplier_gstin) >= 2:
        supplier_state = supplier_gstin[:2]
    else:
        return False
    if buyer_gstin and len(buyer_gstin) >= 2:
        buyer_state = buyer_gstin[:2]
    else:
        buyer_state = business_state_code
    return supplier_state != buyer_state


def calculate_tax_components(taxable_amount: float, total_tax: float, is_interstate: bool):
    """Split total tax into CGST/SGST or IGST."""
    if is_interstate:
        return {"cgst": 0.0, "sgst": 0.0, "igst": round(total_tax, 2)}
    else:
        half = round(total_tax / 2, 2)
        return {"cgst": half, "sgst": half, "igst": 0.0}


async def calculate_gst_for_invoice(invoice: Invoice) -> Invoice:
    """Recalculate GST fields after parsing."""
    profile = await BusinessProfile.find_one(BusinessProfile.id == invoice.business_id)
    state_code = profile.state_code if profile else "29"

    is_interstate = determine_interstate(
        invoice.supplier_gstin or "",
        invoice.buyer_gstin or "",
        state_code,
    )

    taxable = invoice.taxable_amount or 0
    existing_cgst = invoice.cgst or 0
    existing_sgst = invoice.sgst or 0
    existing_igst = invoice.igst or 0
    total_tax = existing_cgst + existing_sgst + existing_igst

    # If no tax was extracted, estimate at 18%
    if total_tax == 0 and taxable > 0:
        total_tax = round(taxable * 0.18, 2)

    tax_components = calculate_tax_components(taxable, total_tax, is_interstate)

    await invoice.update({"$set": {
        "is_interstate": is_interstate,
        "cgst": tax_components["cgst"],
        "sgst": tax_components["sgst"],
        "igst": tax_components["igst"],
        "total_amount": round(taxable + total_tax, 2),
        "updated_at": datetime.utcnow(),
    }})
    await invoice.sync()
    return invoice


async def generate_monthly_return(user_id: str, month: int, year: int) -> dict:
    """Aggregate all verified invoices for the month into a GST return."""
    invoices = await Invoice.find(
        Invoice.user_id == user_id,
        In(Invoice.status, [InvoiceStatus.verified, InvoiceStatus.parsed]),
    ).to_list()

    # Filter by month/year
    monthly = []
    for inv in invoices:
        if inv.invoice_date:
            try:
                parts = inv.invoice_date.replace("/", "-").split("-")
                if len(parts) == 3:
                    inv_year = int(parts[0]) if len(parts[0]) == 4 else int(parts[2])
                    inv_month = int(parts[1])
                    if inv_month == month and inv_year == year:
                        monthly.append(inv)
            except Exception:
                pass

    sales = [i for i in monthly if i.invoice_type == InvoiceType.sale]
    purchases = [i for i in monthly if i.invoice_type == InvoiceType.purchase]

    total_sales_tax = sum((i.cgst or 0) + (i.sgst or 0) + (i.igst or 0) for i in sales)
    total_purchase_tax = sum((i.cgst or 0) + (i.sgst or 0) + (i.igst or 0) for i in purchases)
    input_tax_credit = total_purchase_tax
    net_gst_payable = max(0, total_sales_tax - input_tax_credit)

    # Sales CGSTl/SGST/IGST breakdown
    cgst_payable = sum((i.cgst or 0) for i in sales)
    sgst_payable = sum((i.sgst or 0) for i in sales)
    igst_payable = sum((i.igst or 0) for i in sales)

    # Upsert monthly return
    existing = await MonthlyReturn.find_one(
        MonthlyReturn.user_id == user_id,
        MonthlyReturn.month == month,
        MonthlyReturn.year == year,
    )

    # Get business_id from the first invoice, or use a default
    business_id = monthly[0].business_id if monthly and monthly[0].business_id else "default"

    data = {
        "user_id": user_id,
        "business_id": business_id,
        "month": month,
        "year": year,
        "total_invoices": len(monthly),
        "total_taxable_value": sum(i.taxable_amount or 0 for i in monthly),
        "total_sales_tax": round(total_sales_tax, 2),
        "total_purchase_tax": round(total_purchase_tax, 2),
        "input_tax_credit": round(input_tax_credit, 2),
        "net_gst_payable": round(net_gst_payable, 2),
        "cgst_payable": round(cgst_payable, 2),
        "sgst_payable": round(sgst_payable, 2),
        "igst_payable": round(igst_payable, 2),
        "flagged_invoices": 0,
        "generated_at": datetime.utcnow(),
    }

    if existing:
        await existing.update({"$set": data})
    else:
        ret = MonthlyReturn(**data)
        await ret.insert()

    # Mark invoices as included
    for inv in monthly:
        await inv.update({"$set": {"status": InvoiceStatus.included_in_return}})

    return data
