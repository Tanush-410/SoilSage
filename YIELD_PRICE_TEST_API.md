# 🧪 Yield Price Prediction API - Testing Guide
## Indian Market Corrected Version (March 2025)

### ✅ Math Corrections Applied

#### 1. **Currency Fix: INR (₹) Only**
- **Before**: Mixed USD ($) and INR (₹) inconsistently
- **After**: All prices in ₹ (Indian Rupees) per kg
- **Reference**: CACP (Commission on Agricultural Costs and Prices)

#### 2. **MSP Values - 2024-25 (Corrected)**
| Crop | Old Value | New Value | Unit | Basis |
|------|-----------|-----------|------|-------|
| Rice | ₹24/kg | ₹105/kg | ₹/kg | ₹2100/20kg quintal |
| Wheat | ₹24.25/kg | ₹120.5/kg | ₹/kg | ₹2410/20kg quintal |
| Corn | ₹18.5/kg | ₹53.5/kg | ₹/kg | ₹1070/20kg |
| Potato | ₹9/kg | ₹22/kg | ₹/kg | ₹440/20kg |
| Tomato | ₹5/kg | ₹8.5/kg | ₹/kg | Reference (non-MSP) |

#### 3. **Cost Calculation Fix**
- **Before**: Fixed cost only (`₹30,000/ha × area`)
- **After**: Fixed + Variable costs
  ```
  Total Cost = (Fixed Cost per ha × area) + (Cost per kg × total yield)
  ```
  Example (Rice, 1 hectare):
  - Fixed: ₹32,000
  - Variable: ₹5.8/kg × 5,500 kg = ₹31,900
  - **Total: ₹63,900**

#### 4. **Price Volatility Adjustments**
- **High volatility crops** (Potato, Tomato): ±12-15% daily
- **Moderate crops** (Rice, Wheat, Corn): ±6% daily
- **Bounds**: MSP ±30% (prevents unrealistic extremes)

#### 5. **Break-even Price Calculation**
```math
Break-even Price = Total Production Cost / Total Yield
```
Example: ₹63,900 / 5,500 kg = **₹11.62/kg**

---

## 🔗 API Testing Links

### 1. **Test API Endpoint Locally**
```bash
# Using curl
curl -X POST http://localhost:3000/api/predict/yield-price \
  -H "Content-Type: application/json" \
  -d '{
    "field": {
      "name": "Field 1",
      "crop_type": "Rice",
      "area_hectares": 2,
      "soil_moisture": 70,
      "soil_ph": 6.8,
      "nitrogen": 120,
      "phosphorus": 60,
      "potassium": 60
    },
    "weather": {
      "rainfall": 1200,
      "avg_temp": 28,
      "humidity": 75,
      "wind_speed": 5
    },
    "growth_stage_progress": 50,
    "forecast_days": 30
  }'
```

### 2. **Test with Node.js**
```javascript
// test-yield-price-api.js
const testData = {
  field: {
    name: "Testing Field", 
    crop_type: "Rice",
    area_hectares: 1,
    soil_moisture: 70,
    soil_ph: 6.8,
    nitrogen: 120,
    phosphorus: 60,
    potassium: 60
  },
  weather: {
    rainfall: 1200,
    avg_temp: 28,
    humidity: 75
  },
  growth_stage_progress: 50,
  forecast_days: 30
};

fetch('http://localhost:3000/api/predict/yield-price', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(testData)
})
.then(r => r.json())
.then(data => console.log(JSON.stringify(data, null, 2)))
.catch(e => console.error(e));
```

### 3. **Expected Response Structure**
```json
{
  "field": {
    "name": "Field 1",
    "crop": "Rice",
    "area": 1
  },
  "yield_prediction": {
    "crop_type": "Rice",
    "yield_per_hectare": 4675,
    "total_yield": 4675,
    "confidence": 70,
    "factors": {
      "moisture": 95,
      "ph": 85,
      "temperature": 82,
      "nutrients": 92,
      "water": 80,
      "growth_stage": 100
    }
  },
  "price_forecast": {
    "base_price_per_kg": 95,
    "msp_price_per_kg": 105,
    "forecast_period_days": 30,
    "statistics": {
      "current_price": 95,
      "avg_price_30days": 97.50,
      "min_price": 73.50,
      "max_price": 136.50,
      "std_dev": 12.45,
      "forecast_trend": "bullish",
      "msp_coverage": 92.86
    },
    "forecasts": [
      {
        "day": 1,
        "date": "2025-03-27",
        "price": 98.50,
        "trend": "upward",
        "confidence": 98
      }
    ]
  },
  "financial": {
    "estimated_production_kg": 4675,
    "production_cost_per_hectare": 32000,
    "variable_cost_per_kg": 5.8,
    "total_production_cost": 63105,
    "break_even_price_per_kg": 13.49,
    "revenue": {
      "optimistic": 637762.50,
      "expected": 455625,
      "conservative": 344362.50
    },
    "profit": {
      "optimistic": 574656.50,
      "expected": 392520,
      "conservative": 281257.50
    },
    "roi_percent": {
      "optimistic": 910.62,
      "expected": 621.87,
      "conservative": 445.84
    },
    "profitability_analysis": {
      "is_profitable": true,
      "profit_margin_percent": 13.62,
      "price_above_msp": -7.50,
      "msp_coverage_percent": 92.86
    }
  }
}
```

---

## ▶️ How to Test

### Step 1: Start the Development Server
```bash
cd /Users/tanush.s.vashisht/Desktop/Tanush/work/hackathon/SoilSage
npm run dev
```

### Step 2: Test via Frontend
1. Navigate to `http://localhost:3000`
2. Go to **Yield & Price Prediction** page
3. Enter field data:
   - Crop: Rice
   - Area: 1 hectare
   - Soil Moisture: 70%
   - NPK values as optimal
4. Click "Generate Prediction"
5. Verify output matches expected values

### Step 3: Test via API
Run the curl command or JavaScript code above

### Step 4: Verify Calculations
Check these key metrics:
- ✅ Rice MSP = ₹105/kg (not ₹24/kg)
- ✅ Wheat MSP = ₹120.5/kg (not ₹24.25/kg)
- ✅ All prices in ₹ (not mixed USD/INR)
- ✅ Break-even price calculated
- ✅ Total cost includes variable costs
- ✅ Price bounds: MSP ±30%

---

## 📊 Test Cases

### Test Case 1: Rice (Base Conditions)
**Input:**
```json
{
  "field": {
    "crop_type": "Rice",
    "area_hectares": 1,
    "soil_moisture": 70,
    "soil_ph": 6.8,
    "nitrogen": 120
  },
  "weather": {
    "rainfall": 1200,
    "avg_temp": 28
  },
  "growth_stage_progress": 50
}
```

**Expected Output Range:**
- Yield: 4,500-5,500 kg
- Price MSP: ₹105/kg
- Break-even: ₹11-14/kg
- Expected Revenue: 450,000-550,000 ₹
- Profit: 380,000-450,000 ₹

---

### Test Case 2: Potato (Volatile) 
**Input:**
```json
{
  "field": {
    "crop_type": "Potato",
    "area_hectares": 2,
    "soil_moisture": 75,
    "soil_ph": 6.0,
    "nitrogen": 100
  },
  "weather": {
    "rainfall": 400,
    "avg_temp": 18
  },
  "growth_stage_progress": 75
}
```

**Expected Output Range:**
- Yield: 30,000-40,000 kg
- Price MSP: ₹22/kg
- Price volatility: ±12-15% (high)
- Break-even: ₹3-4/kg

---

### Test Case 3: Wheat (Rabi Season)
**Input:**
```json
{
  "field": {
    "crop_type": "Wheat",
    "area_hectares": 3,
    "soil_moisture": 65,
    "soil_ph": 7.0,
    "nitrogen": 100
  },
  "weather": {
    "rainfall": 500,
    "avg_temp": 20
  },
  "growth_stage_progress": 60
}
```

**Expected Output Range:**
- Yield: 13,000-16,000 kg
- Price MSP: ₹120.5/kg
- Seasonal: Rabi (higher prices)
- Break-even: ₹5-6/kg

---

## 🐛 Debugging

### Issue: Prices don't match MSP
**Solution**: Add `-30` to `-105` to debug forecasting formula

### Issue: Costs seem too high
**Check**: Variable cost = `cost_per_kg × total_yield`
- Rice: ₹5.8/kg
- Wheat: ₹5.6/kg
- Potato: ₹2.0/kg

### Issue: Yield seems unrealistic
**Check**: Growth stage factor should be 0.3-1.0
- At 10% growth: 30% of max yield
- At 100% growth: 100% of max yield

---

## 📚 References
- **MSP Data**: https://cacp.dacnet.nic.in/
- **Agricultural Statistics**: https://datagov.in/
- **Market Prices**: https://www.mandi-prices.in/

---

## 🎯 Summary of Fixes

| Fix | Before | After | Impact |
|-----|--------|-------|--------|
| Currency | USD+INR mix | INR only | Eliminates confusion |
| MSP Values | ₹24/kg (Rice) | ₹105/kg (Rice) | 4.4x more accurate |
| Cost Model | Fixed only | Fixed + Variable | More realistic profitability |
| Price Bounds | None | MSP ±30% | Prevents unrealistic values |
| Break-even | Missing | ₹11.62/kg | Better decision-making |

---

**Last Updated**: March 26, 2025
**Version**: 2.0 (Indian Market Corrected)
**Status**: ✅ Ready for Testing
