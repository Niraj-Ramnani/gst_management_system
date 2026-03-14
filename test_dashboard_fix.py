
import asyncio
import os
import sys

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), "backend"))

async def test_summary():
    from app.db.database import init_db
    from app.services.report_service import generate_tax_summary
    from app.models.invoice import Invoice
    
    await init_db()
    
    user_id = "69b511b745d532a9d65b53a5" # Hariom Dhakar
    
    print(f"Testing dynamic aggregation for user: {user_id}")
    
    # Check invoices count first
    count = await Invoice.find(Invoice.user_id == user_id).count()
    print(f"Invoice count in DB: {count}")
    
    summary = await generate_tax_summary(user_id)
    
    print("\nSummary Results:")
    print(f"Total Sales Tax: {summary['total_sales_tax']}")
    print(f"Total Purchase Tax: {summary['total_purchase_tax']}")
    print(f"Net GST Payable: {summary['total_net_gst_payable']}")
    print(f"Periods found/simulated: {summary['periods']}")
    print(f"Monthly data points: {len(summary['monthly'])}")

if __name__ == "__main__":
    asyncio.run(test_summary())
