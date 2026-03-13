# GSTSmart — System Architecture

## Overview

GSTSmart is a full-stack AI-powered GST compliance platform built as a monorepo with a React frontend, FastAPI backend, and MongoDB database.

```
┌─────────────────────────────────────────────────────────────────┐
│                         BROWSER (React SPA)                     │
│  Login → Dashboard → Upload → Invoices → Reports → Forecast     │
└───────────────────────────┬─────────────────────────────────────┘
                            │ REST API (JWT Auth)
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FastAPI Backend                             │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │  Auth    │  │ Invoice  │  │  Returns │  │   Forecast   │   │
│  │  Routes  │  │  Routes  │  │  Routes  │  │   Routes     │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬───────┘   │
│       │             │              │                │           │
│  ┌────▼─────────────▼──────────────▼────────────────▼───────┐  │
│  │                    Service Layer                           │  │
│  │  gst_service  │  fraud_service  │  forecast_service       │  │
│  └──────────────────────┬──────────────────────────────────┘  │
│                         │                                       │
│  ┌──────────────────────▼──────────────────────────────────┐   │
│  │                    ML Pipeline                           │   │
│  │  invoice_parser │ fraud_detection │ forecasting          │   │
│  │  (OCR+regex)    │ (IsolationForest│ (Prophet/ARIMA)      │   │
│  └──────────────────────┬──────────────────────────────────┘   │
└───────────────────────── │──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                       MongoDB                                    │
│  users │ business_profiles │ invoices │ monthly_returns          │
│  forecasts │ audit_logs                                          │
└─────────────────────────────────────────────────────────────────┘
```

## Invoice Processing Pipeline

```
Upload → Store File → Background Task:
  1. OCR / Text Extraction (EasyOCR → pytesseract → demo fallback)
  2. Field Extraction (regex pattern matching on raw text)
  3. GST Calculation (intra/inter-state classification)
  4. Fraud Detection (rule-based + Isolation Forest)
  5. Status Update → Notify frontend
```

## Authentication Flow

```
POST /auth/login → Verify credentials → Issue JWT (24h)
All protected routes: Bearer <token> → decode → get user
Role check: admin > accountant > business_owner
```

## Key Design Decisions

- **Beanie ODM** over raw pymongo for clean async MongoDB models
- **Background tasks** (FastAPI native) over Celery for simplicity
- **Fallback-first ML** — every ML model has a rule-based fallback so the app runs on any hardware
- **Isolation Forest** trained on synthetic normal data at startup (no separate training step)
- **Prophet with ARIMA fallback** for time-series forecasting
- **Demo data** — seeded on first run so judges see real data immediately
