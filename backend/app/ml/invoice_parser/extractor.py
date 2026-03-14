"""
Invoice field extractor using DeepSeek LLM.
Replaces brittle Regex rules with a robust LLM JSON prompt.
"""
import os
import json
import re
import asyncio
from typing import Dict, Any, Optional
from openai import AsyncOpenAI
from app.core.config import settings

async def extract_fields_from_text_async(raw_text: str) -> Dict[str, Any]:
    """
    Extract robust fields using DeepSeek LLM structured JSON generation.
    """
    empty_result = {
        "invoice_number": None,
        "invoice_date": None,
        "supplier_name": None,
        "supplier_gstin": None,
        "buyer_name": None,
        "buyer_gstin": None,
        "taxable_amount": None,
        "cgst": None,
        "sgst": None,
        "igst": None,
        "total_amount": None,
        "gst_rate": None,
        "hsn_sac_code": None,
        "is_interstate": False,
        "confidence": 0.0,
        "raw_gstins": [],
    }

    if not raw_text.strip():
        return empty_result
        
    api_key = os.getenv("GROQ_API_KEY", getattr(settings, "GROQ_API_KEY", ""))
    
    if not api_key or api_key == "your-groq-api-key-here":
        print("[LLM ERROR] Missing GROQ_API_KEY in .env. Returning empty result.")
        return empty_result

    client = AsyncOpenAI(api_key=api_key, base_url="https://api.groq.com/openai/v1")

    print("\n========== OCR TEXT ==========")
    print(raw_text)
    print("========== END OCR TEXT ==========\n")

    # Manually extract GSTINs via Regex to ensure 100% accuracy for the strict DB constraints
    gstin_pattern = re.compile(r"\b\d{2}[A-Z]{5}\d{4}[A-Z][A-Z\d]Z[A-Z\d]\b")
    raw_gstins = gstin_pattern.findall(raw_text.upper())

    prompt = f"""You are an advanced Indian GST Invoice Data Extraction parsing system.
Analyze the following OCR text and extract all required fields. Ensure you accurately distinguish between the buyer and the supplier.
Return the exact output as a JSON object strictly matching this schema:
{{
  "invoice_number": "string or null",
  "invoice_date": "YYYY-MM-DD string or null",
  "supplier_name": "string or null",
  "supplier_gstin": "string or null",
  "buyer_name": "string or null",
  "buyer_gstin": "string or null",
  "taxable_amount": float or null,
  "cgst": float or null,
  "sgst": float or null,
  "igst": float or null,
  "total_amount": float or null,
  "gst_rate": float (e.g., 0.18 for 18%) or null
}}

Critical Guidelines:
- If a value is missing or cannot be confidently determined, output null.
- For dates, YOU MUST convert the text string to the ISO format: YYYY-MM-DD.
- Strip away currency symbols (rs, inr, ₹, $) from float amounts. Let them be purely numeric.
- DO NOT hallucinate or guess any data. Only extract information explicitly present in the text.

--- OCR TEXT START ---
{raw_text}
--- OCR TEXT END ---
"""

    try:
        response = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a precise JSON data extraction API. Output ONLY valid JSON containing the requested schema without markdown boxes."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.0
        )
        
        content = response.choices[0].message.content.strip()
        
        # Parse using the user's suggested method to avoid trailing markdown
        start = content.find("{")
        end = content.rfind("}") + 1
        
        if start != -1 and end != 0:
            extracted = json.loads(content[start:end])
        else:
            extracted = json.loads(content)
        
        # Merge into the typed dictionary explicitly mapping types
        result = empty_result.copy()
        for k, v in extracted.items():
            if k in result and v is not None:
                if k in ["taxable_amount", "cgst", "sgst", "igst", "total_amount", "gst_rate"]:
                    try:
                        result[k] = float(v)
                    except ValueError:
                        result[k] = None
                else:
                    result[k] = v
        
        # Post-Process exact flags natively
        result["raw_gstins"] = raw_gstins
        result["is_interstate"] = bool(result.get("igst") and result["igst"] > 0)
        
        # Calculate dynamic confidence
        required_fields = [
            "supplier_name", "supplier_gstin", "buyer_name", 
            "invoice_number", "invoice_date", "total_amount"
        ]
        filled = sum(1 for f in required_fields if result.get(f))
        result["confidence"] = round(filled / len(required_fields), 2)
        
        print(f"[LLM OK] Data extracted gracefully with {result['confidence']} confidence.")
        return result

    except Exception as e:
        import traceback
        print(f"[LLM ERROR] DeepSeek parsing failed: {e}")
        traceback.print_exc()
        if hasattr(e, 'response') and e.response:
            print("Response body:", e.response.text)
        return empty_result
