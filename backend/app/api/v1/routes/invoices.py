from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Query, BackgroundTasks
from typing import Optional
import os, shutil, uuid
from datetime import datetime

from app.models.invoice import Invoice, InvoiceStatus, InvoiceType
from app.models.business import BusinessProfile
from app.models.user import User
from app.schemas.invoice import InvoiceResponse, InvoiceReview, InvoiceListResponse
from app.core.dependencies import get_current_user
from app.core.config import settings
from app.services.invoice_service import process_invoice_pipeline

router = APIRouter()

ALLOWED_TYPES = {"application/pdf", "image/jpeg", "image/png", "image/jpg"}


@router.post("/debug-ocr")
async def debug_ocr(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    """Debug endpoint: returns the raw OCR/text extracted from an uploaded invoice."""
    import tempfile, os
    from app.ml.invoice_parser.parser import _extract_text_from_pdf, _extract_text_from_image

    content = await file.read()
    ext = (file.filename or "file.pdf").rsplit(".", 1)[-1].lower()

    with tempfile.NamedTemporaryFile(delete=False, suffix=f".{ext}") as tmp:
        tmp.write(content)
        tmp_path = tmp.name

    try:
        if ext == "pdf":
            text, method = await _extract_text_from_pdf(tmp_path)
        else:
            text, method = await _extract_text_from_image(tmp_path)
    finally:
        os.unlink(tmp_path)

    import re
    gstin_pattern = r"\d{2}[A-Z]{5}\d{4}[A-Z][A-Z\d]Z[A-Z\d]"
    gstins = re.findall(gstin_pattern, text.upper())

    return {
        "extraction_method": method,
        "char_count": len(text),
        "gstins_found": gstins,
        "ocr_text": text
    }




@router.post("/upload", response_model=InvoiceResponse, status_code=201)
async def upload_invoice(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    invoice_type: InvoiceType = InvoiceType.purchase,
    current_user: User = Depends(get_current_user),
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Only PDF, JPG, PNG files are allowed")

    content = await file.read()
    if len(content) > settings.MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=400, detail=f"File too large. Max {settings.MAX_FILE_SIZE_MB}MB")

    profile = await BusinessProfile.find_one(BusinessProfile.user_id == str(current_user.id))
    if not profile:
        raise HTTPException(status_code=400, detail="Please create a business profile first")

    ext = file.filename.rsplit(".", 1)[-1].lower()
    filename = f"{uuid.uuid4()}.{ext}"
    file_path = os.path.join(settings.UPLOAD_DIR, filename)
    with open(file_path, "wb") as f:
        f.write(content)

    invoice = Invoice(
        user_id=str(current_user.id),
        business_id=str(profile.id),
        file_path=file_path,
        original_filename=file.filename,
        invoice_type=invoice_type,
        status=InvoiceStatus.uploaded,
    )
    await invoice.insert()

    # Run parsing pipeline in background
    background_tasks.add_task(process_invoice_pipeline, str(invoice.id))

    return _to_response(invoice)


@router.get("", response_model=InvoiceListResponse)
async def list_invoices(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[InvoiceStatus] = None,
    invoice_type: Optional[InvoiceType] = None,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_user),
):
    query = Invoice.find(Invoice.user_id == str(current_user.id))
    if status:
        query = Invoice.find(Invoice.user_id == str(current_user.id), Invoice.status == status)
    if invoice_type:
        query = Invoice.find(Invoice.user_id == str(current_user.id), Invoice.invoice_type == invoice_type)

    total = await query.count()
    invoices = await query.skip((page - 1) * page_size).limit(page_size).to_list()

    return InvoiceListResponse(
        invoices=[_to_response(inv) for inv in invoices],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size,
    )


@router.get("/{invoice_id}", response_model=InvoiceResponse)
async def get_invoice(invoice_id: str, current_user: User = Depends(get_current_user)):
    invoice = await Invoice.get(invoice_id)
    if not invoice or invoice.user_id != str(current_user.id):
        raise HTTPException(status_code=404, detail="Invoice not found")
    return _to_response(invoice)


@router.put("/{invoice_id}/review", response_model=InvoiceResponse)
async def review_invoice(
    invoice_id: str,
    data: InvoiceReview,
    current_user: User = Depends(get_current_user),
):
    invoice = await Invoice.get(invoice_id)
    if not invoice or invoice.user_id != str(current_user.id):
        raise HTTPException(status_code=404, detail="Invoice not found")

    update = data.dict(exclude_unset=True)
    update["corrected_data"] = update.copy()
    update["status"] = InvoiceStatus.verified
    update["updated_at"] = datetime.utcnow()
    await invoice.update({"$set": update})
    await invoice.sync()
    return _to_response(invoice)


@router.post("/{invoice_id}/reparse", response_model=InvoiceResponse)
async def reparse_invoice(
    invoice_id: str,
    current_user: User = Depends(get_current_user),
):
    invoice = await Invoice.get(invoice_id)
    if not invoice or invoice.user_id != str(current_user.id):
        raise HTTPException(status_code=404, detail="Invoice not found")
        
    # Run synchronously so frontend waits for LLM to finish
    await process_invoice_pipeline(invoice_id)
    
    # Refetch the newly parsed invoice to return the updated data
    updated_invoice = await Invoice.get(invoice_id)
    return _to_response(updated_invoice)




def _to_response(inv: Invoice) -> InvoiceResponse:
    return InvoiceResponse(
        id=str(inv.id),
        user_id=inv.user_id,
        business_id=inv.business_id,
        original_filename=inv.original_filename,
        invoice_type=inv.invoice_type,
        invoice_number=inv.invoice_number,
        invoice_date=inv.invoice_date,
        supplier_name=inv.supplier_name,
        supplier_gstin=inv.supplier_gstin,
        buyer_name=inv.buyer_name,
        buyer_gstin=inv.buyer_gstin,
        hsn_sac_code=inv.hsn_sac_code,
        taxable_amount=inv.taxable_amount,
        cgst=inv.cgst,
        sgst=inv.sgst,
        igst=inv.igst,
        total_amount=inv.total_amount,
        parser_confidence=inv.parser_confidence,
        status=inv.status,
        is_interstate=inv.is_interstate,
        created_at=inv.created_at,
    )
