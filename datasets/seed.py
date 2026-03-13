#!/usr/bin/env python3
"""
Seed script: creates demo users, business profile, and 50+ synthetic invoices.
Run: python datasets/seed.py
"""
import asyncio
import random
import sys
import os
from datetime import datetime, timedelta

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "gst_management")

SUPPLIERS = [
    ("Tata Consultancy Services", "07AAACT2727Q1ZS"),
    ("Infosys Limited", "29AAACI1681G1ZK"),
    ("Wipro Technologies", "29AABCW0068N1ZG"),
    ("HCL Technologies", "09AAACH4449N1ZV"),
    ("Tech Mahindra", "27AABCT1915H1ZT"),
    ("Reliance Digital", "27AAACR5055K1Z5"),
    ("Amazon Seller Services", "29AABCA9803L1ZI"),
    ("Flipkart Internet", "29AABCF8078L2ZJ"),
]

BUYERS = [
    ("ABC Enterprises", "27AABCA1234B1ZP"),
    ("XYZ Solutions", "07AABCX5678C1ZQ"),
]

HSN_CODES = ["9983", "8471", "3004", "7208", "8517", "4901", "6201", "8443"]
GST_RATES = [0.05, 0.12, 0.18, 0.28]
STATES = [("07", "Delhi"), ("27", "Maharashtra"), ("29", "Karnataka"), ("33", "Tamil Nadu")]


def random_invoice(user_id: str, business_id: str, rng: random.Random, months_back: int = 6):
    supplier, s_gstin = rng.choice(SUPPLIERS)
    buyer, b_gstin = BUYERS[0]
    s_state = s_gstin[:2]
    b_state = b_gstin[:2]
    is_interstate = s_state != b_state

    taxable = round(rng.uniform(5000, 800000), 2)
    gst_rate = rng.choice(GST_RATES)

    # Inject some fraudulent samples
    is_suspicious = rng.random() < 0.15
    if is_suspicious:
        taxable = round(rng.choice([100000, 200000, 500000, 1000000]), 2)

    if is_interstate:
        igst = round(taxable * gst_rate, 2)
        cgst = sgst = 0.0
    else:
        if is_suspicious and rng.random() < 0.5:
            # GSTIN mismatch: intra-state invoice but buyer in different state
            igst = 0.0
            cgst = round(taxable * gst_rate / 2, 2)
            sgst = cgst
        else:
            cgst = sgst = round(taxable * gst_rate / 2, 2)
            igst = 0.0

    total = round(taxable + cgst + sgst + igst, 2)

    # Date: random within last N months
    base_date = datetime.now()
    days_back = rng.randint(0, months_back * 30)
    inv_date = base_date - timedelta(days=days_back)
    date_str = inv_date.strftime("%Y-%m-%d")

    inv_type = rng.choice(["purchase", "purchase", "purchase", "sale"])  # 75% purchases

    return {
        "user_id": user_id,
        "business_id": business_id,
        "file_path": f"uploads/demo/{rng.randint(1000,9999)}.pdf",
        "original_filename": f"invoice_{rng.randint(1000,9999)}.pdf",
        "invoice_type": inv_type,
        "invoice_number": f"INV-{rng.randint(1000,9999)}/{inv_date.year}",
        "invoice_date": date_str,
        "supplier_name": supplier if inv_type == "purchase" else "ABC Enterprises",
        "supplier_gstin": s_gstin if inv_type == "purchase" else b_gstin,
        "buyer_name": buyer if inv_type == "purchase" else rng.choice([s for s, _ in SUPPLIERS])[0],
        "buyer_gstin": b_gstin if inv_type == "purchase" else s_gstin,
        "taxable_amount": taxable,
        "cgst": cgst,
        "sgst": sgst,
        "igst": igst,
        "total_amount": total,
        "is_interstate": is_interstate,
        "hsn_sac_code": rng.choice(HSN_CODES),
        "parser_confidence": round(rng.uniform(0.7, 0.99), 2),
        "fraud_score": round(rng.uniform(0.6, 0.95), 2) if is_suspicious else round(rng.uniform(0.0, 0.3), 2),
        "fraud_flags": (
            rng.sample(["duplicate_invoice_number", "unusual_amount_spike", "gstin_state_mismatch"], k=rng.randint(1, 2))
            if is_suspicious else []
        ),
        "is_fraudulent": is_suspicious,
        "status": "verified" if rng.random() > 0.3 else "parsed",
        "created_at": datetime.utcnow(),
    }


async def seed():
    from passlib.context import CryptContext

    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]

    pwd = CryptContext(schemes=["bcrypt"]).hash("demo1234")

    # ── Users ──
    users_col = db["users"]
    await users_col.delete_many({})

    demo_users = [
        {"name": "Admin User", "email": "admin@gstdemo.com", "password_hash": pwd, "role": "admin", "is_active": True, "created_at": datetime.utcnow()},
        {"name": "Business Owner", "email": "owner@gstdemo.com", "password_hash": pwd, "role": "business_owner", "is_active": True, "created_at": datetime.utcnow()},
        {"name": "Accountant", "email": "accountant@gstdemo.com", "password_hash": pwd, "role": "accountant", "is_active": True, "created_at": datetime.utcnow()},
    ]

    result = await users_col.insert_many(demo_users)
    owner_id = str(result.inserted_ids[1])
    print(f"✅ Inserted {len(demo_users)} users")

    # ── Business Profile ──
    biz_col = db["business_profiles"]
    await biz_col.delete_many({})
    biz_result = await biz_col.insert_one({
        "user_id": owner_id,
        "business_name": "ABC Enterprises Pvt Ltd",
        "gstin": "27AABCA1234B1ZP",
        "state": "Maharashtra",
        "state_code": "27",
        "contact_email": "owner@gstdemo.com",
        "contact_phone": "+91-9876543210",
        "address": "456 Business Park, Mumbai - 400001",
        "filing_frequency": "monthly",
        "pan": "AABCA1234B",
        "created_at": datetime.utcnow(),
    })
    biz_id = str(biz_result.inserted_id)
    print(f"✅ Inserted business profile")

    # ── Invoices ──
    inv_col = db["invoices"]
    await inv_col.delete_many({})
    rng = random.Random(42)
    invoices = [random_invoice(owner_id, biz_id, rng, months_back=8) for _ in range(60)]
    await inv_col.insert_many(invoices)
    print(f"✅ Inserted {len(invoices)} synthetic invoices")

    print("\n🎉 Seed complete!")
    print("Demo credentials:")
    print("  Admin:     admin@gstdemo.com / demo1234")
    print("  Owner:     owner@gstdemo.com / demo1234")
    print("  Accountant: accountant@gstdemo.com / demo1234")

    client.close()


if __name__ == "__main__":
    asyncio.run(seed())
