from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from app.core.config import settings
from app.api.v1.routes import auth, business, invoices, returns, forecast, reports, admin, ai_chat
from app.db.database import init_db
import os
from app.db.database import init_db
from app.ml.invoice_parser.parser import _get_rapid_ocr

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    # Preload the RapidOCR engine to prevent a long delay on the first invoice upload
    _get_rapid_ocr()
    yield


app = FastAPI(
    title="GST Return Management System",
    description="AI-powered GST return management for small businesses",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(business.router, prefix="/api/v1/business", tags=["Business"])
app.include_router(invoices.router, prefix="/api/v1/invoices", tags=["Invoices"])
app.include_router(returns.router, prefix="/api/v1/returns", tags=["Returns"])
app.include_router(forecast.router, prefix="/api/v1/forecast", tags=["Forecast"])
app.include_router(reports.router, prefix="/api/v1/reports", tags=["Reports"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["Admin"])
app.include_router(ai_chat.router, prefix="/api/v1/ai", tags=["AI Chat"])


@app.get("/")
async def root():
    return {"message": "GST Management System API", "version": "1.0.0", "status": "running"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
