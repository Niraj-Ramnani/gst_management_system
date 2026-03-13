# ML Pipeline Documentation

## 1. Invoice Parser

**File:** `backend/app/ml/invoice_parser/parser.py`

### Pipeline
1. Receive file path (PDF or image)
2. If PDF: convert first page to image using `pdf2image`
3. OCR the image: EasyOCR (preferred) → pytesseract → demo fallback
4. Apply regex rules to extract structured fields
5. Return JSON with confidence score

### Fields Extracted
| Field | Extraction Method |
|-------|-------------------|
| Invoice Number | Regex: `INVOICE NO[:\s]*([\w\-/]+)` |
| Date | Regex: `\d{1,2}[/-]\d{1,2}[/-]\d{2,4}` |
| GSTIN | Regex: 15-char GSTIN pattern |
| Amounts | Regex: `RS\.?\s*([\d,]+\.?\d*)` |
| Tax (CGST/SGST/IGST) | Regex: labeled amounts |
| HSN/SAC | Regex: `HSN[:\s]*(\d{4,8})` |

### Confidence Score
Calculated as `0.50 + 0.05 * fields_found` — higher when more fields are extracted.

### Demo Mode
When OCR fails (e.g., no tesseract installed), a deterministic demo invoice is generated based on the file hash, ensuring consistent results for the same file.

---

## 2. Fraud Detection

**File:** `backend/app/ml/fraud_detection/model.py`

### Approach: Hybrid (Rules + ML)

#### Rule-Based Checks
| Rule | Score Impact |
|------|-------------|
| Invalid GSTIN format | +0.25 |
| Duplicate invoice number | +0.40 |
| Tax ratio > 50% | +0.20 |
| Zero tax on high-value invoice | +0.15 |
| Round number anomaly (>5L, divisible by 1L) | +0.10 |
| Tax type mismatch (inter-state but no IGST) | +0.20 |

#### ML-Based (Isolation Forest)
- Trained at startup on 500 synthetic "normal" invoice records
- Features: total_amount, taxable_amount, tax_ratio, cgst, sgst, igst
- If ML anomaly score > 0.5: adds +0.30 and flags `ML_ANOMALY_DETECTED`

**Threshold:** Score ≥ 0.40 OR `DUPLICATE_INVOICE_NUMBER` → flagged as fraudulent

---

## 3. GST Forecasting

**File:** `backend/app/ml/forecasting/model.py`

### Prophet (Primary)
- Trained on `monthly_returns` collection (monthly GST payables)
- Config: additive seasonality, low changepoint sensitivity
- Outputs: predicted value + 95% confidence interval + full forecast series

### ARIMA (Fallback)
- Used when Prophet unavailable
- Order: (1, 1, 1)
- Provides prediction + simple confidence interval

### Weighted Moving Average (Last Resort)
- Simple weighted average of historical values
- Used when neither Prophet nor statsmodels is available

### Trend Detection
Compares last 3 months average vs all prior months:
- `recent > prior * 1.1` → **increasing**
- `recent < prior * 0.9` → **decreasing**
- Otherwise → **stable**
