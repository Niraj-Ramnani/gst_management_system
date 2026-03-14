import asyncio
from dotenv import load_dotenv

load_dotenv()

from app.ml.invoice_parser.extractor import extract_fields_from_text_async
import json

async def run_test():
    ocr_text = """
Supplier: ABC Traders
GSTIN: 27AAACR5055K1Z5
Invoice No: INV-102
Date: 12-03-2024
Total Amount: 153526.62
    """
    
    print("Running quick test with hardcoded OCR text...")
    result = await extract_fields_from_text_async(ocr_text)
    
    print("\n========== FINAL PARSED JSON ==========")
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    asyncio.run(run_test())
