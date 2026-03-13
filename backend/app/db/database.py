from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie

from app.core.config import settings
from app.models.user import User
from app.models.business import BusinessProfile
from app.models.invoice import Invoice
from app.models.returns import MonthlyReturn
from app.models.forecast import Forecast
from app.models.audit import AuditLog

client: AsyncIOMotorClient = None

async def init_db():
    global client
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    await init_beanie(
        database=client[settings.DATABASE_NAME],
        document_models=[User, BusinessProfile, Invoice, MonthlyReturn, Forecast, AuditLog],
    )
    print(f"✅ Connected to MongoDB: {settings.DATABASE_NAME}")


async def get_db():
    return client[settings.DATABASE_NAME]
