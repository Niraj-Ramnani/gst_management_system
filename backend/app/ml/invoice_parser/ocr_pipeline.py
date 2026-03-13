"""
OCR pipeline: PDF → image → text extraction via EasyOCR or pytesseract.
Falls back gracefully when heavy deps aren't installed.
"""
import os
from typing import Optional


def _pdf_to_images(pdf_path: str) -> list:
    """Convert PDF pages to PIL images."""
    try:
        from pdf2image import convert_from_path
        return convert_from_path(pdf_path, dpi=200)
    except Exception as e:
        print(f"[OCR] pdf2image failed: {e}")
        return []


def _ocr_with_easyocr(image) -> str:
    """Use EasyOCR for text extraction."""
    try:
        import easyocr
        import numpy as np
        reader = easyocr.Reader(["en"], gpu=False, verbose=False)
        result = reader.readtext(np.array(image), detail=0)
        return "\n".join(result)
    except Exception as e:
        print(f"[OCR] EasyOCR failed: {e}")
        return ""


def _ocr_with_tesseract(image) -> str:
    """Fallback: pytesseract."""
    try:
        import pytesseract
        return pytesseract.image_to_string(image)
    except Exception as e:
        print(f"[OCR] Tesseract failed: {e}")
        return ""


def _open_image(path: str):
    from PIL import Image
    return Image.open(path)


def extract_text_from_file(file_path: str) -> str:
    """
    Main entry point. Supports PDF, JPG, PNG.
    Returns extracted raw text string.
    """
    ext = file_path.rsplit(".", 1)[-1].lower()

    images = []
    if ext == "pdf":
        images = _pdf_to_images(file_path)
        if not images:
            return ""
    elif ext in ("jpg", "jpeg", "png"):
        try:
            images = [_open_image(file_path)]
        except Exception as e:
            print(f"[OCR] Image open failed: {e}")
            return ""
    else:
        return ""

    all_text = []
    for img in images:
        text = _ocr_with_easyocr(img)
        if not text.strip():
            text = _ocr_with_tesseract(img)
        all_text.append(text)

    return "\n".join(all_text)


def extract_text_mock(file_path: str) -> str:
    """
    Returns a realistic mock OCR output for demo/testing
    when real OCR is unavailable.
    """
    import random, hashlib

    seed = int(hashlib.md5(file_path.encode()).hexdigest()[:8], 16)
    rng = random.Random(seed)

    suppliers = [
        "Tata Consultancy Services Ltd", "Infosys Technologies Ltd",
        "Wipro Technologies", "HCL Technologies Ltd", "Tech Mahindra Ltd",
    ]
    buyers = [
        "Reliance Industries Ltd", "HDFC Bank Ltd", "ICICI Enterprises",
        "Bajaj Auto Ltd", "Mahindra and Mahindra Ltd",
    ]

    states = ["07", "27", "29", "33", "09"]
    s_state = rng.choice(states)
    b_state = rng.choice(states)
    is_interstate = s_state != b_state

    taxable = round(rng.uniform(10000, 500000), 2)
    gst_rate = rng.choice([0.05, 0.12, 0.18, 0.28])

    if is_interstate:
        igst = round(taxable * gst_rate, 2)
        cgst = sgst = 0
    else:
        cgst = sgst = round(taxable * gst_rate / 2, 2)
        igst = 0

    total = round(taxable + cgst + sgst + igst, 2)
    inv_num = f"INV-{rng.randint(1000, 9999)}/{rng.randint(2023, 2025)}"

    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    year = rng.choice([2024, 2025])
    month_idx = rng.randint(1, 12)
    day = rng.randint(1, 28)
    date_str = f"{day:02d}/{month_idx:02d}/{year}"

    def make_gstin(state_code):
        chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        digits = "0123456789"
        pan = "".join(rng.choice(chars) for _ in range(5)) + \
              "".join(rng.choice(digits) for _ in range(4)) + \
              rng.choice(chars)
        return f"{state_code}{pan}1Z{rng.choice(chars + digits)}"

    sup = rng.choice(suppliers)
    buy = rng.choice(buyers)
    s_gstin = make_gstin(s_state)
    b_gstin = make_gstin(b_state)
    hsn = rng.choice(["9983", "8471", "3004", "7208", "8517"])

    return f"""
TAX INVOICE

Invoice No: {inv_num}
Invoice Date: {date_str}

From: {sup}
GSTIN/UIN: {s_gstin}
Address: 123 Tech Park, Bangalore - 560001

To: {buy}
GSTIN/UIN: {b_gstin}
Address: 456 Business Centre, Mumbai - 400001

HSN/SAC: {hsn}
Description: Professional Services / Goods Supply

Taxable Value: {taxable:,.2f}
CGST @ {int(gst_rate*50)}%: {cgst:,.2f}
SGST @ {int(gst_rate*50)}%: {sgst:,.2f}
IGST @ {int(gst_rate*100)}%: {igst:,.2f}

Total Amount: {total:,.2f}

Amount in Words: Rupees {int(total)} only

Place of Supply: {b_state}
"""
