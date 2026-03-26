# 🌱 SoilSage — AI Precision Agriculture Platform

> **Hackathon Project** | Next.js · Flask ML · Supabase · Open-Meteo · AGMARKNET

SoilSage is a full-stack precision agriculture platform that gives Indian farmers real-time, science-backed insights across **irrigation, soil health, crop market prices, and pest risk** — all derived from live data, not hardcoded values.

---

## 🏗️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 14 (App Router) | SPA with server components |
| **Styling** | Vanilla CSS (Glassmorphism) | Premium dark-mode UI |
| **ML Backend** | Python / Flask (Render) | Irrigation ML model inference |
| **Database** | Supabase (PostgreSQL) | Fields, recommendations, history |
| **Weather API** | Open-Meteo (free, no key) | Real-time + 7-day forecast |
| **Market API** | AGMARKNET / data.gov.in | Live mandi commodity prices |
| **Auth** | Supabase Auth | Email/password auth with input validation |
| **ML Library** | scikit-learn (Random Forest) | Irrigation prediction model |
| **ML Dataset** | dynamically generated | 12k+ synthetic Indian farming samples |
| **Deployment** | Vercel (FE) + Render (ML) | Cloud hosting |
| **i18n** | Custom React context | English ↔ ಕನ್ನಡ |

---

## 🧠 Core Features & How Each Works

### 1. 💧 Irrigation Advisor (AI-Powered)

**File:** `lib/irrigation-engine.js`, `ml/api.py`

#### How it calculates:

**Step 1 — ET₀ (Reference Evapotranspiration)**
Uses FAO-56 Penman-Monteith simplified formula:
```
ET₀ = 0.0023 × (T + 17.8) × √(Tmax - Tmin) × Ra + 0.35 × VPD + 0.1 × u2
```
- `T` = mean temperature from **live Open-Meteo weather**
- `VPD` = Vapour Pressure Deficit (calculated from real-time humidity)
- `u2` = wind speed at 2m
- If Open-Meteo provides `evapotranspiration` directly, that's used instead

**Step 2 — Crop ET (ETc)**
```
ETc = Kc × ET₀
```
- `Kc` = crop coefficient from FAO-56 Irrigation Paper No.56 database
- Different for each crop + growth stage (Germination → Harvest)
- Database covers 35+ crops (wheat, rice, cotton, vegetables, fruits, etc.)

**Step 3 — Net Irrigation Requirement (NIR)**
```
NIR (mm/week) = ETc_week - (Rain_7day × 0.75)
```
- Rain data from **live 7-day Open-Meteo forecast**
- 75% rain effectiveness factor (FAO standard)
- Converts to litres: `NIR_litres = NIR_mm × 10,000 × fieldArea_ha`

**Step 4 — Python ML Model**
- Random Forest trained on 12,000 synthetic crop-weather samples (generated natively via `generate_dataset.py`).
- Features: soil moisture, pH, NPK, crop type, growth stage, temperature, humidity
- Output: urgency classification + water amount refinement
- API endpoint on Render, falls back to rule-based engine if offline

**Step 5 — Schedule Generation**
- Iterates 7-day weather forecast
- Triggers irrigation when accumulated depletion > 15mm
- Skips days with >5mm rain forecast
- Best time = 5:30 AM if temp > 30°C, else 6:00 AM

---

### 2. 📊 Market & Yield (Real-Time Prices)

**Files:** `lib/crop-market-data.js`, `app/api/crop-prices/route.js`, `lib/yield-calculator.js`

#### Live Price Fetching:
```
GET /api/crop-prices?crop=Wheat
→ Queries AGMARKNET (data.gov.in) API in real-time
→ Averages modal price across multiple mandi markets
→ Returns: modalPrice, minPrice, maxPrice, date, markets[]
→ Falls back to MSP database if API unavailable
```

#### Yield Estimation:
```
yieldTonnes = baseYieldPerHa × fieldArea × efficiencyFactor
efficiencyFactor = 0.65 (fallback) to 0.95 (optimal irrigation)
marketValue = yieldTonnes × 10 (quintals) × pricePerQuintal
```
- MSP/APMC 2024-25 rates sourced from Agriculture Ministry data
- Yield benchmarks from ICAR (Indian Council of Agricultural Research)

#### Price Forecast:
- Seasonal high/low windows based on crop harvest calendars
- Directional forecast (↑/↓/stable) from supply/demand analysis
- Best selling window recommendation per crop

---

### 3. 🌱 Soil Health Dashboard

**Files:** `components/pages/SoilHealthPage.jsx`

#### Health Score Calculation (0–100):
```
score = (pHScore × 0.25) + (NScore × 0.20) + (PScore × 0.15) + (KScore × 0.15) + (moistureScore × 0.25)
```

| Parameter | Ideal Range | Weight |
|-----------|-------------|--------|
| pH | 6.0 – 7.5 | 25% |
| Nitrogen (N) | > 40 ppm | 20% |
| Phosphorus (P) | > 25 ppm | 15% |
| Potassium (K) | > 30 ppm | 15% |
| Moisture | 55 – 75% | 25% |

- Scores below 40 = 🔴 Critical
- 40–70 = 🟡 Moderate
- 70+ = 🟢 Healthy
- Recommendations auto-generated per parameter deficit

---

### 4. 🐛 Pest Risk Monitor

**Files:** `lib/pest-database.js`, `components/pages/PestControlPage.jsx`, `lib/ml-client.js`

#### Risk Score Calculation (0–10):
Uses `getPestPrediction()` based on **live weather conditions**:
```
humidityRisk = humidity > 80 ? high : humidity > 65 ? medium : low
tempRisk = 20°C < temp < 32°C ? elevated : normal
rainRisk = rain > 5mm ? reduced : elevated
growthStageRisk = Flowering/Fruiting > Vegetative
```

- Combines all factors into a 0–10 risk score
- Score ≥ 7 → Critical alert
- Score ≥ 4 → High risk monitoring
- Scouting frequency: Daily (high) / 3-day (medium) / Weekly (low)

#### Pest Database:
- **12 common Indian agricultural pests** (Armyworm, Bollworm, Whitefly, Aphids, Thrips, Leaf Folder, Mealybug, Spider Mite, Scale Insect, Stem Borer, Fruit Fly, Grasshopper)
- Each pest entry includes:
  - Scientific name, severity classification
  - Affected crops, weather-based risk conditions
  - 3 treatment types: **Organic, Chemical, Bioagent**
  - Steps, cost range (₹), treatment duration
  - Preventive measures, pest indicators

---

### 5. 🗓️ 7-Day Irrigation Schedule

**File:** `lib/irrigation-engine.js` → `generateWeeklyPlan()`

- Fetches real-time 7-day Open-Meteo forecast
- Calculates daily ET₀ and ETc per day
- Accumulates soil moisture depletion
- Triggers irrigation when depletion > threshold or mid/end-week cleanup needed
- Adjusts for forecast rain days automatically
- Output: table with date, ET₀, ETc, rain, net irrigation, litres, irrigate/hold

---

### 6. 🌐 Multi-Language (EN / ಕನ್ನಡ)

**File:** `lib/i18n.js`

- Custom React `I18nContext` with `useTranslation()` hook
- 120+ translation keys covering all pages and UI elements
- Language persisted in `localStorage`
- Government-style dropdown in top-right header
- All navigation, labels, buttons, and card headers translate

---

## 📁 Project Structure

```
hackathon/
├── app/
│   ├── api/
│   │   └── crop-prices/route.js    # Live AGMARKNET price API
│   ├── globals.css                 # Global styles + CSS variables
│   ├── layout.js                   # Root layout with I18nProvider
│   └── page.js                     # Entry point → Layout
├── components/
│   ├── AuthPage.jsx                # Login / Signup
│   ├── Layout.jsx                  # Sidebar nav + header + page router
│   └── pages/
│       ├── Dashboard.jsx           # Overview stats + charts
│       ├── Fields.jsx              # CRUD for farm fields
│       ├── Advisor.jsx             # AI irrigation advisor
│       ├── Schedule.jsx            # 7-day irrigation plan
│       ├── HistoryPage.jsx         # Recommendation + irrigation logs
│       ├── SettingsPage.jsx        # Farm profile settings
│       ├── YieldPricePage.jsx      # Market & Yield (4-tab)
│       ├── SoilHealthPage.jsx      # Soil Health Dashboard
│       └── PestControlPage.jsx     # Pest Risk Monitor (4-tab)
├── context/
│   └── AuthContext.jsx             # Supabase auth + user profile
├── lib/
│   ├── i18n.js                     # English + Kannada translations
│   ├── irrigation-engine.js        # FAO-56 ET₀/ETc/NIR calculator
│   ├── ml-client.js                # Flask ML API interface
│   ├── weather.js                  # Open-Meteo API fetcher
│   ├── crops.js                    # Crop database (35+ crops)
│   ├── yield-calculator.js         # Yield + market value estimator
│   ├── crop-market-data.js         # MSP/APMC + forecast database
│   └── pest-database.js            # 12 pests + treatment guides
├── ml/
│   ├── api.py                      # Flask REST API (deployed on Render)
│   ├── generate_dataset.py         # Generates 12k synthetic ML samples
│   ├── dataset.csv                 # Generated training dataset
│   ├── train_model.py              # scikit-learn Random Forest training
│   ├── requirements.txt            # Python dependencies
│   └── models/irrigation_model.pkl # Trained model artifact
└── supabase_schema.sql             # Database schema
```

---

## 🔑 Environment Variables

| Variable | Service | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase | Public anon key |
| `NEXT_PUBLIC_ML_API_URL` | Render | Flask ML API base URL |
| `DATA_GOV_API_KEY` | data.gov.in | AGMARKNET commodity prices API |

---

## 🌐 Data Sources & How We Fetch Them

| Data | Source URL / API | Fetch Mechanism | Update Frequency |
|------|------------------|----------------|-----------------|
| **Weather + 7-day forecast** | `https://api.open-meteo.com/v1/forecast` | Client-side `fetch()` directly in browser | Real-time |
| **Geocoding (city → lat/lon)** | `https://geocoding-api.open-meteo.com/v1/search` | Client-side `fetch()` during location setup | Per request |
| **Live Mandi Crop Prices** | `https://api.data.gov.in` (AGMARKNET Resource ID) | Server-side Next.js route `/api/crop-prices/route.js` | Daily |
| **Synthetic ML Dataset** | N/A (Locally generated) | Generated on-demand via `ml/generate_dataset.py` | Built at deploy |
| **MSP 2024-25 Fallback** | Min. of Agriculture India | Hardcoded in `lib/crop-market-data.js` | Annual |
| **Crop Kc values** | FAO-56 Irrigation Paper No.56 | Hardcoded JSON in `lib/crops.js` | Static (scientific) |
| **Yield benchmarks** | ICAR data | Constants in `lib/yield-calculator.js` | Static (scientific) |
| **Pest Logic** | ICAR Pest Management Info | Hardcoded rules in `lib/pest-database.js` | Static (scientific) |

---

## 🧮 Key Scientific References

1. **FAO-56 Penman-Monteith ET₀** — Allen et al. (1998), FAO Irrigation and Drainage Paper No. 56
2. **Crop Kc coefficients** — FAO-56 Table 12 (Kc ini, Kc mid, Kc end values)
3. **Root Zone Depletion Model** — FAO-56 Chapter 8 (Soil Water Balance)
4. **Pest Risk Thresholds** — ICAR Integrated Pest Management guidelines
5. **Soil Health Scoring** — NABARD soil health card methodology

---

## 🚀 Deployment

### Frontend (Vercel)
```bash
npm run build  # Build Next.js
# Deploy via Vercel Git integration
```

### ML Backend (Render)
```bash
cd ml
pip install -r requirements.txt
python train_model.py  # Train and save model
# Render auto-deploys from ml/api.py
```

---

## 👥 Team

**SoilSage** — Built for hackathon 2026
- Precision agriculture for Indian farmers
- Bilingual (English + Kannada) interface
- Zero hardcoded farmer-facing data — all real-time
