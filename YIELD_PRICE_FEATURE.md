# 🌾 Yield Prediction & Price Forecasting Feature
## Comprehensive Implementation Guide for SoilSage

---

## 📋 Overview

The **Yield Prediction & Price Forecasting** feature provides farmers with AI-powered predictions about:
- **Crop Yield** - Expected production in kg based on soil conditions, weather, and crop health
- **Market Prices** - 30-day price forecasts with trend analysis
- **Financial Projections** - Potential revenue ranges and farming profitability estimates

This helps farmers make data-driven decisions about:
- When to plant and harvest
- When to sell their produce
- How to optimize their operations

---

## 🏗️ Architecture

### Components

```
├── Frontend (React/Next.js)
│   ├── components/pages/YieldPricePrediction.jsx    [UI Component]
│   ├── components/Layout.jsx                        [Navigation Integration]
│   └── lib/yield-price-service.js                  [API Client]
│
├── Backend
│   ├── app/api/predict/yield-price/route.js        [REST API]
│   └── ml/yield_price_predictor.py                 [ML Engine - Optional]
│
└── Database (Supabase PostgreSQL)
    ├── predictions                 [Current predictions]
    ├── prediction_history          [Historical records]
    ├── market_prices              [Price reference data]
    ├── yield_benchmarks           [Crop benchmarks]
    └── price_recommendations      [Smart recommendations]
```

---

## 🚀 Installation & Setup

### Step 1: Database Migration

Run this SQL in your Supabase Dashboard → SQL Editor:

```bash
# Copy content from:
supabase_migration_yield_price.sql
```

This creates all required tables and views.

### Step 2: Update Dependencies

The feature uses only built-in libraries. No new npm packages needed.

### Step 3: Restart Development Server

```bash
npm run dev
```

The new "Yield & Price" tab will appear in the navigation menu.

---

## 📊 How It Works

### Yield Prediction Algorithm

**Inputs:**
- Soil metrics: moisture %, pH, temperature, NPK levels
- Weather data: rainfall, temperature, humidity, wind
- Field info: crop type, area, growth stage progress

**Calculation:**
```
yield = base_yield × (
  moisture_factor × 0.25 +
  ph_factor × 0.15 +
  temperature_factor × 0.20 +
  nutrient_factor × 0.25 +
  water_factor × 0.15
) × stage_factor
```

**Example:**
- Base yield for Rice: 5,000 kg/hectare
- With 70% soil moisture: +10% efficiency
- With optimal pH: +5% efficiency
- Final: ~5,375 kg/hectare

### Price Forecasting Algorithm

**Method:** Trend Analysis + Seasonal Adjustment + Volatility

**Components:**
1. **Base Price** - Historical average for crop
2. **Seasonal Factor** - Kharif (1.0x), Rabi (1.15x), Summer (0.85x)
3. **Market Cycle** - 30-day oscillation pattern
4. **Random Walk** - Daily price volatility

**30-day Forecast:**
- Provides daily price predictions
- Includes confidence levels (higher early, lower later)
- Calculates trend direction and range

---

## 💾 Database Schema

### predictions table
```sql
- id: UUID (primary key)
- user_id: UUID (foreign key → auth.users)
- field_id: UUID (foreign key → fields)
- yield_per_hectare: numeric
- total_yield: numeric
- yield_confidence: numeric (0-100)
- yield_factors: jsonb {moisture, ph, temperature, nutrients, water, growth_stage}
- current_price: numeric
- expected_price: numeric
- price_forecasts: jsonb [array of daily forecasts]
- potential_revenue: numeric
- created_at, updated_at: timestamps
```

### prediction_history table
```sql
- id: UUID
- prediction_id: UUID (references predictions)
- yield_prediction: jsonb (snapshot of full prediction)
- price_prediction: jsonb
- actual_yield: numeric (filled when harvest happens)
- accuracy_score: numeric (calculated after verification)
```

### market_prices table
```sql
- id: UUID
- crop_type: text
- price: numeric
- market_location: text
- season: text
- recorded_at: timestamp
```

---

## 🔧 API Usage

### Generate Predictions

**Endpoint:** `POST /api/predict/yield-price`

**Request:**
```javascript
{
  "field": {
    "name": "North Field",
    "crop_type": "Rice",
    "area_hectares": 2.5,
    "soil_moisture": 70,
    "soil_ph": 6.8,
    "soil_temperature": 28,
    "nitrogen": 120,
    "phosphorus": 60,
    "potassium": 60
  },
  "weather": {
    "rainfall": 200,
    "avg_temp": 28,
    "humidity": 65,
    "wind_speed": 5
  },
  "growth_stage_progress": 50,
  "forecast_days": 30
}
```

**Response:**
```javascript
{
  "field": {...},
  "yield_prediction": {
    "yield_per_hectare": 5375,
    "total_yield": 13438,
    "confidence": 82,
    "factors": {
      "moisture": 95,
      "ph": 90,
      "temperature": 88,
      "nutrients": 80,
      "water": 85,
      "growth_stage": 50
    }
  },
  "price_forecast": {
    "current_price": 20,
    "forecasts": [
      {"day": 1, "date": "2026-03-27", "price": 20.5, "trend": "up", "confidence": 99},
      ...
    ],
    "statistics": {
      "expected_price": 21.2,
      "min_price": 18.5,
      "max_price": 23.8,
      "trend": "upward"
    }
  },
  "financial_projection": {
    "estimated_production_kg": 13438,
    "expected_price_per_kg": 21.2,
    "potential_revenue": 284887,
    "revenue_range": {
      "low": 233432,
      "high": 328736
    }
  }
}
```

---

## 📱 UI Features

### Yield Tab
- **Total Predicted Yield** - kg for entire field
- **Per Hectare Yield** - kg/hectare standardized
- **Confidence Score** - prediction reliability (0-100%)
- **Factor Breakdown** - Visual bars for each impact factor
- **Optimization Tips** - Contextual suggestions

### Price Tab
- **Current/Expected/Min/Max Prices** - Quick reference cards
- **30-Day Price Chart** - Interactive trend visualization
- **Market Trend** - Upward/Downward indicator
- **Market Strategy** - Actionable recommendations

### Financial Tab
- **Revenue Projections** - Expected, conservative, optimistic
- **Revenue Breakdown** - Production × Price calculation
- **Revenue Range Visualization** - Slider showing best/worst case
- **Financial Strategy** - Breakeven and profit targets

---

## 🌾 Crop Parameters

Currently supported crops with optimized parameters:

| Crop | Base Yield (kg/ha) | Base Price ($/kg) | Moisture Optimal | Temp Optimal |
|------|-------------------|------------------|-----------------|--------------|
| Rice | 5,000 | $20 | 70% | 28°C |
| Wheat | 4,500 | $25 | 65% | 20°C |
| Corn | 8,000 | $18 | 60% | 25°C |
| Potato | 20,000 | $12 | 75% | 18°C |
| Tomato | 60,000 | $8 | 65% | 22°C |
| Cotton | 2,500 | $80 | 60% | 26°C |

Add more crops by updating `CROP_YIELD_FACTORS` in both:
- `app/api/predict/yield-price/route.js`
- `ml/yield_price_predictor.py`

---

## 📈 Usage Scenarios

### Scenario 1: Farmer Wants to Know Best Harvest Time
1. Open "Yield & Price" tab
2. Check **Yield Tab** - Growth stage progress shows confidence increase as crop matures
3. Check **Price Tab** - See if market prices are trending up/down
4. **Decision:** Harvest when yield confidence is high AND prices are favorable

### Scenario 2: Farmer Planning to Sell
1. Check **Price Tab** - 30-day forecast shows expected prices
2. Check **Financial Tab** - See revenue potential
3. Strategy suggests holding if trend is upward, selling early if downward
4. **Decision:** Market when prices align with expectations

### Scenario 3: Farmer Optimizing Next Season
1. Check yield factors - Identify limiting factors (low nutrients, poor moisture, etc.)
2. Review past accuracy - From "Accuracy Stats"
3. Plan interventions for next season
4. **Decision:** Invest in irrigation/fertilizer for better yield

---

## 🔍 Advanced Features

### Accuracy Tracking
- Compare predicted vs actual yield after harvest
- Build crop-specific accuracy models over time
- Improve predictions based on historical performance

### Market Benchmarking
- Store market prices from multiple locations
- Compare your predictions to regional benchmarks
- Adjust strategies based on local market behavior

### Price Recommendation Engine
- Automatic alerts when market prices exceed recommendations
- Suggests optimal selling windows
- Tracks success rate of recommendations

---

## 🛠️ Extending the Feature

### Add a New Crop
1. Update `CROP_YIELD_FACTORS` in both component files
2. Run migration to update benchmarks table
3. Collect market price data for the crop

### Improve ML Models
1. Collect actual yield vs predicted yield data
2. Train regression model on historical data in Python
3. Export as JSON parameters or pickle model
4. Update prediction engine with new parameters

### Add Weather API Integration
1. Replace mock `weatherData` with real API call
2. Use Open-Meteo or Weather API
3. Provide automatic weather data to predictions

### Enable Mobile Notifications
1. Send push notifications when prices spike
2. Alert farmers about yield milestones
3. Notify about soil condition changes

---

## 💡 Key Performance Indicators

Track these metrics in your dashboard:

1. **Prediction Accuracy** - % difference between predicted and actual yield
2. **Financial Accuracy** - % difference between predicted and actual revenue
3. **Market Timing Success** - % of times recommendation proved profitable
4. **Farmer Adoption** - % of farmers using predictions regularly
5. **ROI** - Average revenue increase from better farming decisions

---

## 🚨 Troubleshooting

### Predictions Not Showing?
1. Check browser console for API errors
2. Verify Supabase connection: `echo $SUPABASE_URL`
3. Ensure field has valid crop_type

### Prices Seem Unrealistic?
1. Check seasonal factor is correct
2. Verify base prices in CROP_YIELD_FACTORS
3. Collect real market price data to improve calibration

### Accuracy Score is Low?
1. Ensure all soil metrics are filled in field form
2. Weather data is accurate (use real API)
3. Growth stage progress is realistic (0-100%)

---

## 📚 Related Documentation

- [Irrigation Engine Overview](../ml/README.md)
- [Database Schema](./supabase_schema.sql)
- [API Endpoints](./API_DOCS.md)
- [ML Models Training](./ml/train_model.py)

---

## 🎯 Next Steps

1. **Collect Real Data** - Record market prices and actual yields
2. **Calibrate Models** - Adjust crop parameters with local data
3. **Add Weather API** - Replace mock data with real weather
4. **Train ML Models** - Build specialized models for your region
5. **Deploy to Production** - Set up prediction cron jobs

---

**Built with ❤️ for Farmers | SoilSage © 2026**
