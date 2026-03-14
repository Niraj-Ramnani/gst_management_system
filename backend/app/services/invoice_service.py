"""
Invoice processing pipeline: parse → fraud check → GST calculate
"""
import asyncio
from datetime import datetime
from app.models.invoice import Invoice, InvoiceStatus
from app.ml.invoice_parser.parser import parse_invoice
from app.services.gst_service import calculate_gst_for_invoice


async def process_invoice_pipeline(invoice_id: str):
    """Full pipeline run as background task."""
    try:
        invoice = await Invoice.get(invoice_id)
        if not invoice:
            return

        # Step 1: Parse
        parsed = await parse_invoice(invoice.file_path)
        has_extracted_fields = any(
            parsed.get(field) is not None
            for field in (
                "invoice_number",
                "invoice_date",
                "supplier_name",
                "supplier_gstin",
                "buyer_name",
                "buyer_gstin",
                "taxable_amount",
                "cgst",
                "sgst",
                "igst",
                "total_amount",
            )
        )
        update = {
            "invoice_number": parsed.get("invoice_number"),
            "invoice_date": parsed.get("invoice_date"),
            "supplier_name": parsed.get("supplier_name"),
            "supplier_gstin": parsed.get("supplier_gstin"),
            "buyer_name": parsed.get("buyer_name"),
            "buyer_gstin": parsed.get("buyer_gstin"),
            "taxable_amount": parsed.get("taxable_amount", 0),
            "cgst": parsed.get("cgst", 0),
            "sgst": parsed.get("sgst", 0),
            "igst": parsed.get("igst", 0),
            "total_amount": parsed.get("total_amount", 0),
            "hsn_sac_code": parsed.get("hsn_sac_code"),
            "parser_confidence": parsed.get("confidence", 0.75),
            "parsed_data": parsed,
            "status": InvoiceStatus.parsed if has_extracted_fields else InvoiceStatus.uploaded,
            "updated_at": datetime.utcnow(),
        }
        await invoice.update({"$set": update})
        await invoice.sync()

        # Step 2: GST calculation
        invoice = await calculate_gst_for_invoice(invoice)

    except Exception as e:
        print(f"Pipeline error for invoice {invoice_id}: {e}")
        await Invoice.find_one(Invoice.id == invoice_id).update(
            {"$set": {"status": InvoiceStatus.uploaded, "updated_at": datetime.utcnow()}}
        )
