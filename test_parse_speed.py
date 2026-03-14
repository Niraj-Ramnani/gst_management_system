import asyncio
import time
import os
import sys

# Add backend directory to sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), "backend"))

from app.ml.invoice_parser.parser import parse_invoice

async def test_speed():
    test_file = "test_invoice.jpg"
    
    # Create a dummy image or PDF for testing
    from PIL import Image, ImageDraw, ImageFont
    img = Image.new('RGB', (800, 600), color = (255, 255, 255))
    d = ImageDraw.Draw(img)
    d.text((10,10), "Invoice Number: 12345\nDate: 2023-01-01\nTotal: 100.00", fill=(0,0,0))
    img.save(test_file)

    print("Starting parse...")
    start = time.time()
    try:
        res = await parse_invoice(test_file)
        print("Result:", res)
    finally:
        end = time.time()
        print(f"Time taken: {end - start:.2f} seconds")
        if os.path.exists(test_file):
            os.remove(test_file)

if __name__ == "__main__":
    asyncio.run(test_speed())
