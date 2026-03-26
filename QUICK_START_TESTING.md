# 🚀 WORKING LINKS & QUICK START GUIDE
## Yield Price Prediction - Indian Market Version

---

## 📍 Quick Navigation Links

### Documentation
- **Complete Fixes** → [`YIELD_PRICE_FIXES_COMPLETE.md`](./YIELD_PRICE_FIXES_COMPLETE.md) ⭐ **READ THIS FIRST**
- **Testing Guide** → [`YIELD_PRICE_TEST_API.md`](./YIELD_PRICE_TEST_API.md)
- **Feature Docs** → [`YIELD_PRICE_FEATURE.md`](./YIELD_PRICE_FEATURE.md)
- **Quick Start** → [`YIELD_PRICE_QUICKSTART.md`](./YIELD_PRICE_QUICKSTART.md)

### API Endpoints
- **Local Dev**: `http://localhost:3000/api/predict/yield-price`
- **Method**: POST
- **Content-Type**: `application/json`

### Source Code Files Modified
- Backend: `/app/api/predict/yield-price/route.js`
- Frontend: `/components/pages/YieldPricePrediction.jsx`
- Python ML: `/ml/yield_price_predictor.py`

---

## ⚡ 5-MINUTE QUICK START

### Step 1: Start the Development Server
```bash
cd /Users/tanush.s.vashisht/Desktop/Tanush/work/hackathon/SoilSage
npm install  # if needed
npm run dev
```

**Expected output:**
```
> next dev
> ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

### Step 2: Test the API Directly

**Option A: Using curl**
```bash
curl -X POST http://localhost:3000/api/predict/yield-price \
  -H "Content-Type: application/json" \
  -d '{
    "field": {
      "name": "Test Field",
      "crop_type": "Rice",
      "area_hectares": 1,
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

**Option B: Using a file (easier)**
```bash
# Create file: test-payload.json
cat > test-payload.json << 'EOF'
{
  "field": {
    "name": "Test Field",
    "crop_type": "Rice",
    "area_hectares": 1,
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
}
EOF

# Then run:
curl -X POST http://localhost:3000/api/predict/yield-price \
  -H "Content-Type: application/json" \
  -d @test-payload.json | jq '.'  # jq formats JSON nicely
```

### Step 3: Visit the UI

1. Open browser: `http://localhost:3000`
2. Navigate to **Yield & Price Prediction** page
3. Enter field data (same as above)
4. Click **Generate Prediction**
5. Verify values match API response

### Step 4: Verify the Corrections

**Check these key values in the response:**

✅ **Rice Prices Must Show:**
- MSP: ₹105/kg (NOT ₹24/kg ❌)
- Min: ₹73.50/kg (MSP - 30%)
- Max: ₹136.50/kg (MSP + 30%)

✅ **Costs Must Include:**
- Fixed: ₹32,000/ha
- Variable: ₹5.8/kg × yield
- Total: ~₹63,900 for 1ha (NOT ₹30,000 ❌)

✅ **Break-even Price Must Show:**
- Example: ₹11.62/kg (NOT missing ❌)

✅ **Currency Must Be:**
- All prices in **₹ per kg** (NOT mixed $ ❌)

---

## 🧪 TESTING SCENARIOS

### Scenario 1: Rice (Base Perfect Conditions)
**Input:**
```json
{
  "field": {
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
    "avg_temp": 28
  },
  "growth_stage_progress": 60
}
```

**Expected Output:**
- Yield: ~9,000-10,000 kg (2 hectares)
- Price: ~₹95-105/kg range
- Profit: ~700,000-800,000 ₹ (high profitability)
- ✅ MSP Coverage: ~90-100%

---

### Scenario 2: Potato (High Volatility)
**Input:**
```json
{
  "field": {
    "crop_type": "Potato",
    "area_hectares": 1,
    "soil_moisture": 75,
    "soil_ph": 6.0,
    "nitrogen": 100
  },
  "growth_stage_progress": 80
}
```

**Expected Output:**
- Yield: ~18,000-22,000 kg
- Price: ₹15-28/kg (high volatility range)
- MSP: ₹22/kg
- Check: Prices stay within ±30% of MSP
- ✅ Volatility more severe than Rice

---

### Scenario 3: Wheat (Rabi Season)
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
  "growth_stage_progress": 70
}
```

**Expected Output:**
- Yield: ~10,000-12,000 kg
- MSP: ₹120.5/kg
- Seasonal: Rabi (should show higher prices)
- Break-even: ~₹5-6/kg
- ✅ ROI >600% likely

---

## 📊 API RESPONSE ANALYSIS

### Key Fields to Check

```json
{
  "field": {...},
  "yield_prediction": {
    "yield_per_hectare": 4800,           // kg/ha
    "total_yield": 4800,                 // total kg
    "factors": {
      "moisture": 95,                    // % of optimal
      "nutrients": 92,                   // % of optimal
      ...
    }
  },
  "price_forecast": {
    "msp_price_per_kg": 105,            // ✅ Should be 105 for Rice
    "statistics": {
      "avg_price_30days": 97.50,
      "min_price": 73.50,                // ✅ Should be MSP × 0.70
      "max_price": 136.50,               // ✅ Should be MSP × 1.30
      "msp_coverage": 92.86              // ✅ NEW! % above/below MSP
    }
  },
  "financial": {
    "total_production_cost": 63905,      // ✅ Fixed + Variable
    "break_even_price_per_kg": 13.31,   // ✅ NEW! Total Cost ÷ Yield
    "revenue": {
      "optimistic": 656880,
      "expected": 468000,
      "conservative": 352560
    },
    "profit": {
      "optimistic": 592975,
      "expected": 404095,
      "conservative": 288655
    },
    "profitability_analysis": {
      "is_profitable": true,            // ✅ NEW!
      "profit_margin_percent": 86.34,   // ✅ NEW!
      "price_above_msp": -7.50,         // ✅ NEW!
      "msp_coverage_percent": 92.86     // ✅ NEW!
    }
  }
}
```

### What Changed?
| Field | Before | After | Status |
|-------|--------|-------|--------|
| `msp_price_per_kg` | 24 | 105 | ✅ Fixed |
| `break_even_price_per_kg` | missing | 13.31 | ✅ Added |
| `variable_cost_per_kg` | missing | 5.8 | ✅ Added |
| `total_production_cost` | 30,000 | 63,905 | ✅ Fixed |
| `profitability_analysis` | missing | {...} | ✅ Added |

---

## 🔗 PRODUCTION URL (When Deployed)

**Will be available at:**
- Frontend: `https://your-domain.com/yield-prediction`
- API: `https://your-domain.com/api/predict/yield-price`

*(Currently: Local only at `http://localhost:3000`)*

---

## 💡 COMMON ISSUES & FIXES

### Issue 1: Port Already in Use
```bash
# Error: listen EADDRINUSE: address already in use :::3000

# Solution: Kill the process on port 3000
lsof -i :3000
kill -9 <PID>

# Or use different port:
PORT=3001 npm run dev
```

### Issue 2: Wrong Prices Showing
```
Expected: ₹105/kg for Rice MSP
Getting: ₹24/kg

→ Solution: Restart dev server (npm run dev)
           Clear browser cache (Ctrl+Shift+Delete)
           Check /app/api/predict/yield-price/route.js was updated
```

### Issue 3: Prices Don't Stay in Bounds
```
Expected: ₹73.50 - ₹136.50 (Rice, ±30% of MSP)
Getting: Outside these bounds

→ Solution: Check the forecastPrice() function
           Ensure MSP bounds are applied:
           Math.max(mspPrice * 0.70, Math.min(mspPrice * 1.30, price))
```

### Issue 4: Break-even Price Showing 0 or Negative
```
Expected: ₹11.62/kg (positive value)
Getting: 0 or negative

→ Solution: Verify totalYield > 0
           Check total_production_cost calculation
           Ensure variable costs included
```

---

## 📱 TESTING TOOLS

### Browser DevTools Method
1. Open `http://localhost:3000/yield-prediction`
2. Press `F12` → **Network** tab
3. Click "Generate Prediction"
4. Look for `yield-price` request in Network tab
5. Click → **Response** tab
6. Check JSON output

### cURL with Pretty Output
```bash
# Install jq for JSON formatting (optional)
brew install jq

# Test with pretty output
curl -X POST http://localhost:3000/api/predict/yield-price \
  -H "Content-Type: application/json" \
  -d @test-payload.json | jq '.price_forecast'
```

### JavaScript Console Method
```javascript
// In browser console (F12):
fetch('http://localhost:3000/api/predict/yield-price', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    field: {
      crop_type: 'Rice',
      area_hectares: 1,
      soil_moisture: 70,
      soil_ph: 6.8,
      nitrogen: 120
    },
    weather: { rainfall: 1200, avg_temp: 28 },
    growth_stage_progress: 50
  })
})
.then(r => r.json())
.then(data => {
  console.log('MSP:', data.price_forecast.msp_price_per_kg);
  console.log('Break-even:', data.financial.break_even_price_per_kg);
  console.log('Total Cost:', data.financial.total_production_cost);
  console.log('Profit Margin:', data.financial.profitability_analysis.profit_margin_percent);
})
```

---

## ✅ VERIFICATION CHECKLIST

Before claiming "fixes complete":

- [ ] Rice MSP = ₹105/kg (not ₹24/kg)
- [ ] Wheat MSP = ₹120.5/kg (not ₹24.25/kg)
- [ ] All prices in ₹ (not mixed $)
- [ ] Break-even price calculated (not missing)
- [ ] Total cost ~₹64k for 1ha rice (not ₹30k)
- [ ] Prices keep within MSP ±30%
- [ ] Variable costs included in total
- [ ] Profit margin shows (NEW field)
- [ ] MSP coverage shows (NEW field)
- [ ] API returns 200 OK (no errors)

---

## 📞 SUPPORT

**Files with fixes:**
- ✅ `/app/api/predict/yield-price/route.js` (Backend)
- ✅ `/components/pages/YieldPricePrediction.jsx` (Frontend)
- ✅ `/ml/yield_price_predictor.py` (Python ML)

**Documentation to read:**
1. `YIELD_PRICE_FIXES_COMPLETE.md` ← **START HERE**
2. `YIELD_PRICE_TEST_API.md`
3. `YIELD_PRICE_FEATURE.md`

**To report issues:**
- Check actual vs expected in response
- Compare with values in this guide
- See "Common Issues" section above

---

**Version**: 2.0 - Indian Market Corrected  
**Status**: ✅ Ready to Test  
**Date**: March 26, 2025

---

## 🎉 YOU'RE ALL SET!

1. **Run**: `npm run dev`
2. **Test**: Use curl command above
3. **Verify**: Check MSP = ₹105/kg for Rice
4. **Success**: All prices in ₹, break-even calculated ✅
