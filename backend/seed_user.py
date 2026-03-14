import asyncio
from app.db.database import init_db
from app.models.user import User
from app.core.security import get_password_hash

from app.models.business import BusinessProfile

async def seed_admin():
    await init_db()
    admin_email = "admin@gst.demo"
    admin_pass = "admin123"
    
    user = await User.find_one(User.email == admin_email)
    if not user:
        user = User(
            name="System Admin",
            email=admin_email,
            password_hash=get_password_hash(admin_pass),
            role="admin",
            is_active=True
        )
        await user.insert()
        print(f"✅ Admin user created: {admin_email} / {admin_pass}")
    else:
        print(f"ℹ️ Admin user already exists: {admin_email}")

    # Seed Business Profile for Admin
    existing_profile = await BusinessProfile.find_one(BusinessProfile.user_id == str(user.id))
    if not existing_profile:
        profile = BusinessProfile(
            user_id=str(user.id),
            business_name="Demo Enterprise Ltd",
            gstin="09AAACR1234A1Z5",
            state="Uttar Pradesh",
            state_code="09",
            filing_frequency="monthly"
        )
        await profile.insert()
        print(f"✅ Business profile created for admin")
    else:
        print(f"ℹ️ Admin business profile already exists")

if __name__ == "__main__":
    asyncio.run(seed_admin())
