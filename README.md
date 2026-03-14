# 🧾 GSTSmart — AI-Powered GST Return Management System

> A production-grade, full-stack SaaS platform for automated GST compliance, invoice parsing, and tax forecasting for Indian small businesses.

![Dashboard Preview](docs/screenshots/dashboard.png)

---

## 🚀 Features

| Feature | Description |
|---------|-------------|
| 📄 **AI Invoice Parsing** | Extract invoice fields from PDF/images using OCR + regex pipeline |
| 📊 **GST Calculation** | Auto CGST/SGST/IGST split, intra/inter-state detection, ITC calculation |
| 📈 **Forecasting** | Prophet/ARIMA-based next-month GST liability prediction |
| 📋 **Return Generation** | One-click GSTR-style monthly summary |
| 🔐 **JWT Auth** | Role-based access: Admin, Accountant, Business Owner |
| 💎 **Premium UI/UX** | Next-gen dark mode with glassmorphism, micro-animations, and 60 FPS transitions |
| 📱 **Mobile Optimized** | Fully responsive design with sliding sidebar drawer for field use |

---

## 🛠 Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS, Recharts, React Hook Form, React Router  
**Backend:** FastAPI, Beanie ODM, Pydantic v2, Python 3.11+  
**Database:** MongoDB 7.0  
**ML/AI:** Prophet/ARIMA (forecast), EasyOCR/Tesseract (parsing)  
**DevOps:** Docker, Docker Compose  

---

## ⚡ Quick Start (Local)

### Prerequisites
- Python 3.11+
- Node.js 20+
- MongoDB (local or Atlas)

### 1. Clone & Setup

```bash
git clone <repo-url>
cd gst-management-system
cp .env.example .env
```

### 2. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Start MongoDB locally (or update MONGODB_URL in .env)
uvicorn main:app --reload --port 8000
```

### 3. Seed Demo Data

```bash
# From project root
cd datasets
python seed_data.py
```

This creates:
- 3 demo users (admin, business owner, accountant)
- Business profile for Raj Electronics
- 60–90 synthetic invoices across 6 months
- Monthly return records

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
# Open http://localhost:5173
```

---

## 🐳 Docker (Full Stack)

```bash
cp .env.example .env
docker-compose up --build
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

---

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Business Owner | raj@business.demo | demo1234 |
| Admin | admin@gst.demo | admin123 |
| Accountant | priya@accounts.demo | demo1234 |

---

## 📁 Project Structure

```
gst-management-system/
├── frontend/                 # React + Vite SPA
│   └── PI clients
│       ├── context/          # Auth contextsrc/
│       ├── pages/            # Route pages
│       ├── components/       # Reusable UI components
│       ├── services/         # Axios A
│       └── utils/            # Formatters, helpers
├── backend/
│   ├── main.py               # FastAPI app entry
│   └── app/
│       ├── api/v1/routes/    # REST endpoints
│       ├── models/           # Beanie MongoDB models
│       ├── schemas/          # Pydantic request/response schemas
│       ├── services/         # Business logic layer
│       ├── ml/
│       │   ├── invoice_parser/   # OCR + field extraction
│       │   └── forecasting/      # Prophet/ARIMA model
│       └── core/             # Config, security, deps
├── datasets/
│   └── seed_data.py          # MongoDB seed script
├── docs/
│   ├── architecture.md
│   └── ml-pipeline.md
├── docker-compose.yml
└── .env.example
```

---

## 🔌 API Summary

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login, returns JWT |
| GET | `/api/v1/auth/me` | Current user info |
| GET/POST/PUT | `/api/v1/business/profile` | Business GST profile |
| POST | `/api/v1/invoices/upload` | Upload + parse invoice |
| GET | `/api/v1/invoices` | List with pagination/filter |
| GET | `/api/v1/invoices/{id}` | Invoice detail |
| PUT | `/api/v1/invoices/{id}/review` | Review & verify invoice |
| GET | `/api/v1/returns/monthly-summary` | Monthly GST summary |
| POST | `/api/v1/returns/generate` | Generate return |
| GET | `/api/v1/forecast/next-month` | Next month prediction |
| GET | `/api/v1/reports/tax-summary` | Tax summary report |

Full interactive docs at: `http://localhost:8000/docs`

---

## 🤖 ML Pipeline

### Invoice Parser
OCR extracts raw text → Regex rules extract fields → Confidence score assigned  
**Fallback:** Demo mode generates realistic synthetic data when OCR unavailable

### GST Forecasting
Prophet time-series on monthly returns → confidence interval  
**Fallback:** ARIMA → Weighted moving average

---

## 🏆 Why This Project Stands Out in a Hackathon

1. **Real Problem, Real Solution** — Millions of Indian SMBs struggle with GST compliance. This is practical fintech.
2. **Full-Stack AI Integration** — Not just a demo; real ML models (Prophet) are actually running.
3. **Production Architecture** — Service layers, JWT auth, RBAC, async background tasks, Docker-ready.
4. **Graceful Fallbacks** — Every AI model has a fallback, so it demos reliably on any hardware.
5. **Next-Gen Premium UI** — A high-end dark-theme dashboard with glassmorphism, fluid micro-animations, real-time charts, and a fully mobile-first responsive engine.
6. **End-to-End Workflow** — Upload → Parse → Review → Return → Forecast. Full lifecycle.
7. **Seed Data Ready** — One script gives judges 6 months of realistic invoices to explore.
8. **Extensible** — Clean service layer; swap OCR model, add cloud storage, or plug in Donut transformer later.

---

## 🔮 Future Improvements

- [ ] Donut/LayoutLM transformer for higher OCR accuracy
- [ ] WhatsApp/email alerts for status notifications
- [ ] CSV/PDF export for all reports
- [ ] GST portal direct filing integration (GSP API)
- [ ] Multi-business support per account
- [ ] Model retraining from verified/corrected invoices
- [ ] Invoice confidence heatmap visualization
- [ ] GST AI chatbot assistant
- [ ] Bulk invoice import via ZIP
- [ ] Audit trail with full changelog view
