"""
Invoice Parser - Hybrid Text + OCR extraction pipeline.

Priority for PDFs & Images:
  1. Try PyMuPDF text extraction (text PDF)
  2. If no text -> Render pages via PyMuPDF + RapidOCR
  3. Parser
"""
import os
import re
import asyncio
import tempfile
from typing import Dict, Any, Tuple, Optional

# ── Global cached RapidOCR reader (loaded once) ──────────────────────────────
_rapid_ocr = None

def _get_rapid_ocr():
    global _rapid_ocr
    if _rapid_ocr is None:
        try:
            from rapidocr_onnxruntime import RapidOCR
            print("[OCR] Loading RapidOCR engine (first time, please wait)...")
            _rapid_ocr = RapidOCR()
            print("[OCR] RapidOCR engine loaded.")
        except Exception as e:
            print(f"[OCR] RapidOCR load failed: {e}")
    return _rapid_ocr


def _ocr_with_rapid(image_path: str) -> str:
    """Run RapidOCR on an image path. Returns joined text."""
    try:
        ocr = _get_rapid_ocr()
        if ocr is None:
            return ""
            
        result, elapse = ocr(image_path)
        if not result:
            return ""
            
        # result is a list of [box, text, score]
        # Group logic: sort by Y center, then cluster into lines, then sort by X
        boxes = []
        for item in result:
            if not item:
                continue
            box, text, score = item
            # box is [[x1, y1], [x2, y1], [x2, y2], [x1, y2]]
            y_center = (box[0][1] + box[2][1]) / 2.0
            x_center = (box[0][0] + box[1][0]) / 2.0
            boxes.append({'text': text, 'y': y_center, 'x': x_center})
            
        boxes.sort(key=lambda b: b['y'])
        
        lines = []
        current_line = []
        current_y = None
        # Max Y difference to be considered the same line
        line_tolerance = 15.0 

        for b in boxes:
            if current_y is None:
                current_y = b['y']
                current_line.append(b)
            elif abs(b['y'] - current_y) <= line_tolerance:
                current_line.append(b)
            else:
                current_line.sort(key=lambda x: x['x'])
                lines.append(u" ".join([str(x['text']) for x in current_line if x.get('text')]))
                current_y = b['y']
                current_line = [b]
                
        if current_line:
            current_line.sort(key=lambda x: x['x'])
            lines.append(u" ".join([str(x['text']) for x in current_line if x.get('text')]))
            
        return "\n".join(lines)
    except Exception as e:
        print(f"[OCR] RapidOCR inference failed: {e}")
        return ""


def _extract_text_from_pdf_sync(file_path: str) -> Tuple[str, str]:
    """Step 1: PyMuPDF text extraction. Step 2: PyMuPDF render + RapidOCR."""
    text = ""
    try:
        import fitz  # PyMuPDF
        doc = fitz.open(file_path)
        for page in doc:
            page_text = page.get_text() or ""
            if page_text.strip():
                text = text + page_text + "\n"
        doc.close()

        if text.strip() and len(text.strip()) >= 50:
            print(f"[PDF] PyMuPDF: {len(text)} chars extracted.")
            return text, "pymupdf"
        else:
            print(f"[PDF] PyMuPDF: only {len(text)} chars — falling back to OCR.")
    except Exception as e:
        print(f"[PDF] PyMuPDF text error: {e}")

    # OCR fallback — render pages to images via PyMuPDF, then run RapidOCR
    try:
        import fitz  # PyMuPDF
        print("[PDF] Rendering PDF pages to images for RapidOCR...")
        doc = fitz.open(file_path)
        combined = ""
        # Render first 2 pages max to keep it fast
        for page_num in range(min(2, len(doc))):
            page = doc[page_num]
            # Render at 250 DPI (scale factor = 250/72 ≈ 3.47)
            mat = fitz.Matrix(250 / 72, 250 / 72)
            pix = page.get_pixmap(matrix=mat)
            tmp_path = tempfile.mktemp(suffix=".png")
            pix.save(tmp_path)

            try:
                t = _ocr_with_rapid(tmp_path)
                combined = combined + t + "\n"
            finally:
                if os.path.exists(tmp_path):
                    os.unlink(tmp_path)
        doc.close()

        if combined.strip():
            print(f"[PDF] RapidOCR: {len(combined)} chars extracted.")
            return combined, "rapidocr"
    except Exception as e:
        print(f"[PDF] PyMuPDF render/RapidOCR error: {e}")

    return "", "none"


def _extract_text_from_image_sync(file_path: str) -> Tuple[str, str]:
    """RapidOCR directly on image files."""
    try:
        print(f"[IMG] Running RapidOCR on image...")
        text = _ocr_with_rapid(file_path)
        if text.strip():
            return text, "rapidocr"
    except Exception as e:
        print(f"[IMG] Image OCR error: {e}")
        
    return "", "none"


async def _extract_fields_from_text_async(text: str) -> Dict[str, Any]:
    """LLM-based field extraction."""
    from app.ml.invoice_parser.extractor import extract_fields_from_text_async as ext
    return await ext(text)


async def parse_invoice(file_path: str) -> Dict[str, Any]:
    """Main entry point — hybrid text + OCR pipeline."""
    ext_type = file_path.rsplit(".", 1)[-1].lower()

    raw_text = ""
    extraction_method = "none"

    try:
        if ext_type == "pdf":
            raw_text, extraction_method = await asyncio.to_thread(_extract_text_from_pdf_sync, file_path)
        else:
            raw_text, extraction_method = await asyncio.to_thread(_extract_text_from_image_sync, file_path)
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

    result = await _extract_fields_from_text_async(raw_text)
    result["extraction_method"] = extraction_method
    return result
