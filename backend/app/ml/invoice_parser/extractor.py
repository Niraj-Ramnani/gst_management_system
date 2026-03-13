"""
Invoice field extractor.
Strictly extracts from OCR text — no fabricated values.
"""
import re
from typing import Optional, Dict, Any

# ── GSTIN regex ──────────────────────────────────────────────────────────────
GSTIN_PATTERN = re.compile(r"\b\d{2}[A-Z]{5}\d{4}[A-Z][A-Z\d]Z[A-Z\d]\b")

# ── Date support ─────────────────────────────────────────────────────────────
# Numeric formats
_DATE_NUMERIC = [
    re.compile(r"\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})\b"),    # DD/MM/YYYY
    re.compile(r"\b(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})\b"),    # YYYY-MM-DD
]
# Text month formats: 26-Mar-24, 26-Mar-2024, 26 March 2024
_DATE_TEXT = re.compile(
    r"\b(\d{1,2})[\s\-\/]"
    r"(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*"
    r"[\s\-\/](\d{2,4})\b",
    re.IGNORECASE,
)
_MONTH_MAP = {
    "jan": "01", "feb": "02", "mar": "03", "apr": "04",
    "may": "05", "jun": "06", "jul": "07", "aug": "08",
    "sep": "09", "oct": "10", "nov": "11", "dec": "12",
}
DATE_KEYWORDS = [
    r"invoice\s*date", r"bill\s*date", r"date\s*of\s*issue",
    r"date\s*issued", r"dt\.?", r"date",
]

# ── Invoice number keywords ──────────────────────────────────────────────────
INV_NO_PATTERNS = [
    r"invoice\s*no\.?", r"invoice\s*number", r"invoice\s*#",
    r"bill\s*no\.?", r"bill\s*number", r"inv\.?\s*no\.?",
    r"voucher\s*no\.?", r"ref\.?\s*no\.?",
]

# ── Amount keywords ──────────────────────────────────────────────────────────
TAXABLE_KEYWORDS = [
    r"taxable\s*(?:value|amount)", r"subtotal", r"amount\s*before\s*tax",
    r"net\s*amount", r"assessable\s*value",
]
TOTAL_KEYWORDS = [
    r"total\s*amount", r"grand\s*total", r"net\s*payable",
    r"invoice\s*total", r"total\s*(?:rs\.?|inr|₹)?",
    r"round\s*off.*total", r"^total",
]
TAX_KEYWORDS = {
    "cgst": [r"cgst"],
    "sgst": [r"sgst"],
    "igst": [r"igst"],
}
AMOUNT_REGEX = r"(?:rs\.?|inr|₹)?\s*([\d,]+\.?\d*)"

# ── Entity keywords ──────────────────────────────────────────────────────────
SUPPLIER_KEYWORDS = ["sold by", "supplier", "seller", "vendor", "billed by", "manufacturer:", "tax invoice issued by"]
BUYER_KEYWORDS = ["bill to", "billed to", "buyer:", "sold to", "customer:", "recipient:", "consignee:"]


# ────────────────────────────────────────────────────────────────────────────
#  Helpers
# ────────────────────────────────────────────────────────────────────────────

def _clean_amount(text: str) -> Optional[float]:
    if not text:
        return None
    cleaned = text.replace(",", "").strip()
    try:
        val = float(cleaned)
        # Reject implausibly small or obviously wrong matches
        if val < 0:
            return None
        return val
    except Exception:
        return None


def _parse_date_numeric(s: str) -> Optional[str]:
    for pat in _DATE_NUMERIC:
        m = pat.search(s)
        if m:
            g = m.groups()
            if len(g[0]) == 4:  # YYYY-MM-DD
                return f"{g[0]}-{g[1].zfill(2)}-{g[2].zfill(2)}"
            else:               # DD/MM/YYYY
                return f"{g[2]}-{g[1].zfill(2)}-{g[0].zfill(2)}"
    return None


def _parse_date_text(s: str) -> Optional[str]:
    m = _DATE_TEXT.search(s)
    if m:
        day = m.group(1).zfill(2)
        mon = _MONTH_MAP.get(m.group(2).lower()[:3])
        yr = m.group(3)
        if len(yr) == 2:
            yr = "20" + yr
        if mon:
            return f"{yr}-{mon}-{day}"
    return None


def _extract_date(text: str) -> Optional[str]:
    lines = text.split("\n")

    # 1. Look for keyword-labelled date lines
    for line in lines:
        lower = line.lower()
        if any(re.search(kw, lower) for kw in DATE_KEYWORDS):
            parsed = _parse_date_text(line) or _parse_date_numeric(line)
            if parsed:
                return parsed

    # 2. Scan whole text for text-month dates first (most reliable)
    m = _DATE_TEXT.search(text)
    if m:
        parsed = _parse_date_text(m.group(0))
        if parsed:
            return parsed

    # 3. Fallback: first numeric date in the text
    return _parse_date_numeric(text)


def _extract_invoice_number(text: str) -> Optional[str]:
    for kw in INV_NO_PATTERNS:
        m = re.search(kw + r"[\s:.\-#]*([A-Z0-9\/\-]{3,30})", text, re.IGNORECASE)
        if m:
            val = m.group(1).strip()
            # Don't return a GSTIN as an invoice number
            if not GSTIN_PATTERN.match(val):
                return val

    # Fallback: lines containing 'invoice'/'bill'/'voucher' with a code
    for line in text.split("\n"):
        lower = line.lower()
        if any(k in lower for k in ["invoice", "bill", "voucher"]):
            m = re.search(r"([A-Z0-9\/\-]{4,25})", line, re.IGNORECASE)
            if m:
                val = m.group(1).strip()
                if not GSTIN_PATTERN.match(val) and sum(c.isdigit() for c in val) > 0:
                    return val
    return None


def _extract_amount_by_keywords(text: str, keywords: list) -> Optional[float]:
    # 1. Direct pattern on text
    for kw in keywords:
        pat = kw + r"[^\d₹\n]*(?:rs\.?|inr|₹)?\s*([\d,]+\.?\d*)"
        m = re.search(pat, text, re.IGNORECASE)
        if m:
            val = _clean_amount(m.group(1))
            if val and val > 0:
                return val

    # 2. Line-by-line: keyword present → take the last number on that line
    for line in text.split("\n"):
        lower = line.lower()
        if any(re.search(kw, lower) for kw in keywords):
            nums = re.findall(AMOUNT_REGEX, line, re.IGNORECASE)
            if nums:
                val = _clean_amount(nums[-1])
                if val and val > 0:
                    return val
    return None


# All known section-header keywords — these should never be returned as entity names
_ALL_ENTITY_KEYWORDS = [
    "ship from", "ship to", "sold by", "supplier", "seller", "vendor",
    "from", "billed by", "manufacturer",
    "bill to", "billed to", "buyer", "sold to", "customer", "recipient",
    "consignee", "to", "shipped from", "shipped to", "billing address",
    "shipping address", "sold-from address", "ship to", "bill to",
    "order id", "invoice no", "invoice number", "invoice date",
]

_NAME_BLACKLIST = [
    "box for", "warranty purposes", "keep this invoice", "manufacturer box",
    "original brand box", "price tag", "original packing", "delivery perfectly",
    "return the item", "returns policy", "difficult for us", "act on your request",
    "help us in helping you", "terms and conditions apply", "computer generated",
    "no signature required", "e. & o.e.", "page 1 of 1", "page 1 of 2",
    "authorized signatory", "issuing signatory", "authenticated by",
]

def _is_section_label(line: str) -> bool:
    """Return True if this line is just a section label/keyword, not an actual name."""
    lower_line = line.strip().lower()
    
    # 1. Exact matches for section headers
    stripped = lower_line.strip(":/.-# ")
    if stripped in _ALL_ENTITY_KEYWORDS or len(stripped) <= 2:
        return True
        
    # 2. Check blacklist for instructional boilerplate
    if any(item in lower_line for item in _NAME_BLACKLIST):
        return True
        
    return False


def _extract_entity_name(text: str, keywords: list) -> Optional[str]:
    """Find section-label lines matching keywords, then return the real value that follows."""
    lines = text.split("\n")
    for i, line in enumerate(lines):
        lower = line.lower()
        for kw in keywords:
            if kw in lower:
                # Get text after the keyword on the same line
                rest = line[lower.find(kw) + len(kw):].strip(" :-#/")
                if len(rest) > 2 and not _is_section_label(rest):
                    return rest[:80]
                # Look ahead up to 4 lines for the actual value
                for j in range(i + 1, min(i + 5, len(lines))):
                    candidate = lines[j].strip()
                    if len(candidate) > 2 and not _is_section_label(candidate):
                        # Skip lines that look like numbers/pincodes/addresses only
                        if not re.match(r'^[\d\s,\-\/\(\)\\]{5,}$', candidate):
                            # Skip GSTIN lines
                            if not GSTIN_PATTERN.search(candidate.upper()):
                                # Clean up common terminal punctuation
                                return candidate.strip(",. ").strip()[:80]
    return None


def _extract_supplier_from_header(text: str) -> Optional[str]:
    """
    Fallback: Many Indian GST invoices put the company name in the first few lines,
    right after the 'GST TAX INVOICE' / 'TAX INVOICE' header title.
    Carefully skips section-label lines like 'Ship From'.
    """
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    # Header keywords should be the primary content of the line
    header_keywords = ["gst tax invoice", "tax invoice", "bill of supply", "cash memo"]
    for i, line in enumerate(lines[:15]): # Only check the very top
        line_lower = line.lower()
        if any(h == line_lower or line_lower.startswith(h + ":") for h in header_keywords):
            for candidate in lines[i + 1: i + 6]:
                if len(candidate) > 3 and not GSTIN_PATTERN.search(candidate.upper()):
                    if not re.match(r'^[\d\s,\-\/\(\)\\]{5,}$', candidate):
                        if not _is_section_label(candidate):
                            return candidate[:80]
    return None


def _extract_gst_rate(text: str) -> Optional[float]:
    """Try to find a GST rate percentage explicitly printed on the invoice."""
    matches = re.findall(
        r"(?:igst|cgst|sgst|gst|rate)\s*[@%\s]*\s*(5|12|18|28)(?:\.0+)?\s*%",
        text, re.IGNORECASE
    )
    if matches:
        return float(matches[0]) / 100.0
    matches = re.findall(r"\b(5|12|18|28)(?:\.0+)?\s*%", text)
    if matches:
        return float(matches[0]) / 100.0
    return None


# ────────────────────────────────────────────────────────────────────────────
#  Main extraction function
# ────────────────────────────────────────────────────────────────────────────

def extract_fields_from_text(raw_text: str) -> Dict[str, Any]:
    """
    Strictly extract fields from OCR text.
    Returns None for any field not found — never fabricates values.
    """
    text = raw_text

    # GSTIN — scan the uppercase version for reliable matching
    gstins = GSTIN_PATTERN.findall(text.upper())
    supplier_gstin = gstins[0] if len(gstins) > 0 else None
    buyer_gstin = gstins[1] if len(gstins) > 1 else None

    invoice_number = _extract_invoice_number(text)
    invoice_date = _extract_date(text)

    taxable_amount = _extract_amount_by_keywords(text, TAXABLE_KEYWORDS)
    total_amount = _extract_amount_by_keywords(text, TOTAL_KEYWORDS)
    cgst = _extract_amount_by_keywords(text, TAX_KEYWORDS["cgst"])
    sgst = _extract_amount_by_keywords(text, TAX_KEYWORDS["sgst"])
    igst = _extract_amount_by_keywords(text, TAX_KEYWORDS["igst"])

    gst_rate = _extract_gst_rate(text)

    # Entity names — keyword-based first, then header heuristic for supplier
    supplier_name = _extract_entity_name(text, SUPPLIER_KEYWORDS)
    if not supplier_name:
        supplier_name = _extract_supplier_from_header(text)

    buyer_name = _extract_entity_name(text, BUYER_KEYWORDS)

    is_interstate = bool(igst and igst > 0)

    # Confidence = extracted_fields / total_required_fields
    required_fields = [
        supplier_name, supplier_gstin, buyer_name, buyer_gstin,
        invoice_number, invoice_date, taxable_amount, gst_rate, total_amount,
    ]
    extracted_count = sum(1 for f in required_fields if f is not None)
    confidence = round(extracted_count / len(required_fields), 2)

    return {
        "invoice_number": invoice_number,
        "invoice_date": invoice_date,
        "supplier_name": supplier_name,
        "supplier_gstin": supplier_gstin,
        "buyer_name": buyer_name,
        "buyer_gstin": buyer_gstin,
        "taxable_amount": taxable_amount,
        "cgst": cgst,
        "sgst": sgst,
        "igst": igst,
        "total_amount": total_amount,
        "gst_rate": gst_rate,
        "hsn_sac_code": None,
        "is_interstate": is_interstate,
        "confidence": confidence,
        "raw_gstins": gstins,
    }
