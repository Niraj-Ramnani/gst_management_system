"""
Seed MongoDB with demo users, business profiles, and synthetic invoices.
Run: python datasets/seed_data.py
"""
import asyncio
import random
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../backend"))

from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from backend.app.models.user import User, UserRole
from backend.app.models.business import BusinessProfile, FilingFrequency
from backend.app.models.invoice import Invoice, InvoiceStatus, InvoiceType
from backend.app.models.returns import MonthlyReturn
from backend.app.core.security import get_password_hash
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "../.env"))

MONGO_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DATABASE_NAME", "gst_management")
os.environ.setdefault("MAX_FILE_SIZE_MB", "10")

SUPPLIERS = [
    ("Tata Consultancy Services Ltd", "27AABCT3518Q1ZS"),
    ("Infosys BPM Limited", "29AABCI4501L1ZO"),
    ("Reliance Industries Ltd", "27AAACR5055K1Z5"),
    ("Wipro Limited", "29AAACW0469R1ZP"),
    ("HDFC Bank Ltd", "24AAACH2702H1ZC"),
    ("Mahindra & Mahindra Ltd", "27AABCM6903C1ZY"),
    ("Zomato Ltd", "03AABCZ0947E1Z5"),
    ("Flipkart Internet Pvt Ltd", "29AABCF8078H1Z1"),
]


async def seed():
    client = AsyncIOMotorClient(MONGO_URL)
    await init_beanie(
        database=client[DB_NAME],
        document_models=[User, BusinessProfile, Invoice, MonthlyReturn],
    )

    # Clear existing
    await User.delete_all()
    await BusinessProfile.delete_all()
    await Invoice.delete_all()
    await MonthlyReturn.delete_all()

    # Create demo users
    users = [
        User(name="Admin User", email="admin@gst.demo", password_hash=get_password_hash("admin123"), role=UserRole.admin),
        User(name="Raj Sharma", email="raj@business.demo", password_hash=get_password_hash("demo1234"), role=UserRole.business_owner),
        User(name="Priya Accountant", email="priya@accounts.demo", password_hash=get_password_hash("demo1234"), role=UserRole.accountant),
    ]
    for u in users:
        await u.insert()
    print(f"✅ Created {len(users)} users")

    # Business profile for raj
    raj = users[1]
    profile = BusinessProfile(
        user_id=str(raj.id),
        business_name="Raj Electronics & Trading Co.",
        gstin="29AABCR1234A1Z5",
        state="Karnataka",
        state_code="29",
        contact_email="raj@business.demo",
        contact_phone="+91-9876543210",
        address="MG Road, Bengaluru, Karnataka 560001",
        filing_frequency=FilingFrequency.monthly,
        pan="AABCR1234A",
    )
    await profile.insert()
    print(f"✅ Created business profile")

    # Generate 6 months of invoices
    all_invoices = []
    monthly_data = {}

    for months_ago in range(6, 0, -1):
        now = datetime.utcnow()
        inv_month = (now.month - months_ago) % 12 + 1
        inv_year = now.year if now.month > months_ago else now.year - 1

        for _ in range(random.randint(8, 15)):
            supplier = random.choice(SUPPLIERS)
            taxable = round(random.uniform(5000, 150000), 2)
            gst_rate = random.choice([0.05, 0.12, 0.18, 0.28])
            total_tax = round(taxable * gst_rate, 2)
            is_interstate = random.choice([True, False, False])  # More intra
            day = random.randint(1, 28)

            is_fraudulent = random.random() < 0.08  # 8% fraud rate

            inv = Invoice(
                user_id=str(raj.id),
                business_id=str(profile.id),
                file_path=f"uploads/demo_{random.randint(1000,9999)}.pdf",
                original_filename=f"invoice_{random.randint(1000,9999)}.pdf",
                invoice_type=random.choice([InvoiceType.purchase, InvoiceType.purchase, InvoiceType.sale]),
                invoice_number=f"INV-{random.randint(1000,9999)}/{inv_year}",
                invoice_date=f"{inv_year}-{inv_month:02d}-{day:02d}",
                supplier_name=supplier[0],
                supplier_gstin=supplier[1],
                buyer_name="Raj Electronics & Trading Co.",
                buyer_gstin="29AABCR1234A1Z5",
                taxable_amount=taxable,
                cgst=0 if is_interstate else round(total_tax / 2, 2),
                sgst=0 if is_interstate else round(total_tax / 2, 2),
                igst=total_tax if is_interstate else 0,
                total_amount=round(taxable + total_tax, 2),
                is_interstate=is_interstate,
                parser_confidence=round(random.uniform(0.72, 0.96), 2),
                fraud_score=round(random.uniform(0.6, 0.9) if is_fraudulent else random.uniform(0, 0.3), 3),
                fraud_flags=["DUPLICATE_INVOICE_NUMBER", "ABNORMAL_TAX_RATIO"] if is_fraudulent else [],
                is_fraudulent=is_fraudulent,
                status=InvoiceStatus.flagged if is_fraudulent else random.choice([
                    InvoiceStatus.verified, InvoiceStatus.parsed, InvoiceStatus.included_in_return
                ]),
            )
            await inv.insert()
            all_invoices.append(inv)

            key = (inv_month, inv_year)
            if key not in monthly_data:
                monthly_data[key] = {"sales_tax": 0, "purchase_tax": 0, "taxable": 0, "count": 0}
            tax = total_tax
            if inv.invoice_type == InvoiceType.sale:
                monthly_data[key]["sales_tax"] += tax
            else:
                monthly_data[key]["purchase_tax"] += tax
            monthly_data[key]["taxable"] += taxable
            monthly_data[key]["count"] += 1

    # Generate monthly returns
    for (month, year), data in monthly_data.items():
        net = max(0, data["sales_tax"] - data["purchase_tax"])
        ret = MonthlyReturn(
            user_id=str(raj.id),
            business_id=str(profile.id),
            month=month,
            year=year,
            total_invoices=data["count"],
            total_taxable_value=round(data["taxable"], 2),
            total_sales_tax=round(data["sales_tax"], 2),
            total_purchase_tax=round(data["purchase_tax"], 2),
            input_tax_credit=round(data["purchase_tax"], 2),
            net_gst_payable=round(net, 2),
        )
        await ret.insert()

    print(f"✅ Created {len(all_invoices)} invoices across 6 months")
    print(f"✅ Created {len(monthly_data)} monthly returns")
    print()
    print("Demo credentials:")
    print("  Admin:   admin@gst.demo / admin123")
    print("  Owner:   raj@business.demo / demo1234")
    print("  Account: priya@accounts.demo / demo1234")
    client.close()


if __name__ == "__main__":
    try:
        asyncio.run(seed())
    except Exception as e:
        import traceback
        traceback.print_exc()
        if "ValidationError" in str(type(e)):
            print("\nDetailed Pydantic Error:")
            print(e)
