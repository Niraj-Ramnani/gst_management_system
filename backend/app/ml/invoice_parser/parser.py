"""
Invoice Parser - Hybrid Text + OCR extraction pipeline.

Priority for PDFs:
  1. pypdf   (pure Python, works for digital PDFs)
  2. pdf2image + OCR (for scanned/image PDFs)

Priority for images:
  1. EasyOCR (cached reader, GPU off)
  2. pytesseract (if tesseract binary is installed)
"""
import os
import re
from typing import Dict, Any, Tuple, Optional

# ── Global cached EasyOCR reader (loaded once) ───────────────────────────────
_easyocr_reader = None

def _get_easyocr_reader():
    global _easyocr_reader
    if _easyocr_reader is None:
        try:
            import easyocr
            print("[OCR] Loading EasyOCR model (first time, please wait)...")
            _easyocr_reader = easyocr.Reader(["en"], gpu=False, verbose=False)
            print("[OCR] EasyOCR model loaded.")
        except Exception as e:
            print(f"[OCR] EasyOCR load failed: {e}")
    return _easyocr_reader


def _preprocess_image(image):
    """Improve image quality for better OCR accuracy."""
    try:
        from PIL import Image, ImageFilter, ImageEnhance
        # Convert to RGB if needed
        if image.mode not in ("RGB", "L"):
            image = image.convert("RGB")
        # Upscale small images (OCR works best at 300dpi+)
        w, h = image.size
        if w < 1200 or h < 1200:
            scale = max(1200 / w, 1200 / h)
            image = image.resize((int(w * scale), int(h * scale)), Image.LANCZOS)
        # Sharpen + contrast boost
        image = ImageEnhance.Contrast(image).enhance(1.5)
        image = ImageEnhance.Sharpness(image).enhance(2.0)
        return image
    except Exception as e:
        print(f"[OCR] Image preprocessing failed (using original): {e}")
        return image


def _ocr_with_easyocr(image) -> str:
    """Run EasyOCR on a PIL image. Returns joined text."""
    try:
        import numpy as np
        reader = _get_easyocr_reader()
        if reader is None:
            return ""
        # Convert PIL image to numpy array for EasyOCR
        img_arr = np.array(image)
        results = reader.readtext(
            img_arr,
            detail=1,
            paragraph=True,
        )
        # Sort by vertical position (top to bottom)
        results_sorted = sorted(results, key=lambda r: float(r[0][0][1]))
        lines = [str(item[1]) for item in results_sorted]
        return "\n".join(lines)
    except Exception as e:
        print(f"[OCR] EasyOCR inference failed: {e}")
        return ""


def _ocr_with_tesseract(image) -> str:
    """Fallback to pytesseract if tesseract binary is installed."""
    try:
        import pytesseract
        # Common Tesseract installation paths on Windows
        tesseract_paths = [
            r"C:\Program Files\Tesseract-OCR\tesseract.exe",
            r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
            r"C:\Users\HP\AppData\Local\Tesseract-OCR\tesseract.exe",
        ]
        for path in tesseract_paths:
            if os.path.exists(path):
                pytesseract.pytesseract.tesseract_cmd = path
                break
        cfg = "--psm 6 --oem 1"
        return pytesseract.image_to_string(image, config=cfg)
    except Exception as e:
        print(f"[OCR] pytesseract failed: {e}")
        return ""


def _run_ocr(image) -> Tuple[str, str]:
    """Try both OCR engines on a preprocessed image."""
    from PIL import Image as PILImage
    # Ensure it's a PIL image
    if not hasattr(image, 'size'):
        try:
            image = PILImage.fromarray(image)
        except Exception:
            pass

    preprocessed = _preprocess_image(image)

    text = _ocr_with_easyocr(preprocessed)
    if text.strip():
        print(f"[OCR] EasyOCR succeeded: {len(text)} chars")
        return text, "easyocr"

    text = _ocr_with_tesseract(preprocessed)
    if text.strip():
        print(f"[OCR] pytesseract succeeded: {len(text)} chars")
        return text, "pytesseract"

    print("[OCR] All OCR methods returned empty text.")
    return "", "none"


async def _extract_text_from_pdf(file_path: str) -> Tuple[str, str]:
    """Step 1: pypdf for digital PDFs. Step 2: OCR for scanned PDFs."""
    # pypdf for text-layer PDFs
    text = ""
    try:
        from pypdf import PdfReader
        reader = PdfReader(file_path)
        for page in reader.pages:
            page_text = page.extract_text() or ""
            if page_text.strip():
                text = text + page_text + "\n"
        if text.strip() and len(text.strip()) >= 50:
            print(f"[PDF] pypdf: {len(text)} chars extracted.")
            return text, "pypdf"
        else:
            print(f"[PDF] pypdf: only {len(text)} chars — falling back to OCR.")
    except Exception as e:
        print(f"[PDF] pypdf error: {e}")

    # OCR fallback for scanned/image PDFs
    try:
        from pdf2image import convert_from_path
        print("[PDF] Converting PDF to images for OCR...")
        images = convert_from_path(file_path, dpi=250, first_page=1, last_page=2)
        combined = ""
        for img in images:
            t, _ = _run_ocr(img)
            combined = combined + t + "\n"
        if combined.strip():
            print(f"[PDF] PDF OCR: {len(combined)} chars extracted.")
            return combined, "pdf_ocr"
    except Exception as e:
        print(f"[PDF] pdf2image OCR error: {e}")

    return "", "none"


async def _extract_text_from_image(file_path: str) -> Tuple[str, str]:
    """OCR directly on image files (jpg, png, etc.)"""
    try:
        from PIL import Image
        img = Image.open(file_path)
        print(f"[IMG] Loaded image: {img.size} {img.mode}")
        text, method = _run_ocr(img)
        return text, f"image_{method}"
    except Exception as e:
        print(f"[IMG] Image OCR error: {e}")
        return "", "error"


def _extract_fields_from_text(text: str) -> Dict[str, Any]:
    """Rule-based field extraction."""
    from app.ml.invoice_parser.extractor import extract_fields_from_text as ext
    return ext(text)


async def parse_invoice(file_path: str) -> Dict[str, Any]:
    """Main entry point — hybrid text + OCR pipeline."""
    ext_type = file_path.rsplit(".", 1)[-1].lower()

    raw_text = ""
    extraction_method = "none"

    try:
        if ext_type == "pdf":
            raw_text, extraction_method = await _extract_text_from_pdf(file_path)
        else:
            raw_text, extraction_method = await _extract_text_from_image(file_path)
    except Exception as e:
        print(f"[PARSE] Extraction top-level error: {e}")

    # Debug output
    print("=" * 60)
    print(f"Method: {extraction_method} | Chars: {len(raw_text)}")
    if raw_text.strip():
        print("TEXT PREVIEW:\n" + raw_text[:1000])
    else:
        print(">>> NO TEXT EXTRACTED — fields will all be null <<<")
    print("=" * 60)

    result = _extract_fields_from_text(raw_text)
    result["extraction_method"] = extraction_method
    return result
