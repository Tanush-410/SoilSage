# 🚀 Quick Start: Yield Prediction & Price Forecasting

## Installation (5 minutes)

### Step 1: Database Setup
1. Go to **Supabase Dashboard** → **SQL Editor**
2. Create new query
3. Copy & paste the entire content from: `supabase_migration_yield_price.sql`
4. Click **RUN**

Expected output: All tables and views created successfully ✅

### Step 2: Restart Development Server
```bash
# If still running, stop with Ctrl+C, then:
npm run dev
```

### Step 3: Verify Installation
1. Open **http://localhost:3000**
2. Login to your account
3. Look for **"Yield & Price"** menu item in the sidebar
4. Click it

You should see the prediction page (empty initially - that's normal!)

---

## First Use: Generate a Prediction

### Option 1: Using Demo Field
If you already have a field:
1. Click "Yield & Price" in navigation
2. Select a field from dropdown (if available)
3. The component will auto-generate predictions

### Option 2: Create a Test Field First
1. Go to **My Fields** page
2. Click **"Add Field"** button
3. Fill in details:
   - **Name**: "Test Field"
   - **Crop Type**: "Rice"
   - **Area**: 2.5 hectares
   - **Soil Moisture**: 70%
   - **pH**: 6.8
   - **Temperature**: 28°C
   - **Nitrogen**: 120 ppm
   - **Phosphorus**: 60 ppm
   - **Potassium**: 60 ppm
4. Save field
5. Go to "Yield & Price" tab
6. Predictions should appear!

---

## Understanding the Predictions

### Yield Tab
**What you see:**
- **Total Predicted Yield**: Expected harvest in kg
- **Per Hectare Yield**: Standardized kg/hectare
- **Confidence**: How reliable the prediction is (%)

**Factor Breakdown:**
- Green bar = Good (>80%)
- Yellow bar = Monitor (60-80%)
- Red bar = Needs attention (<60%)

**Tips if confidence is low:**
- Ensure soil metrics are accurate
- Update weather data
- Wait for crop to mature (early stage = lower confidence)

### Price Tab
**What you see:**
- **Current/Expected/Min/Max Prices**: What the market offers
- **30-Day Forecast**: Daily price predictions
- **Trend**: Is price going up (good) or down (sell now)?

**Strategy:**
- 🟢 **Upward trend**: Hold produce, prices will improve
- 🔴 **Downward trend**: Consider selling soon
- Chart shows volatility - plan accordingly

### Financial Tab
**What you see:**
- **Expected Revenue**: Most likely income
- **Revenue Range**: Best-case and worst-case scenarios
- **Profitability**: Estimated profit after costs

---

## Sample Predictions

### Example 1: Rice in June (Optimal Conditions)
```
Yield: 5,375 kg/hectare (above average!)
Price: $21-24 per kg
Revenue: $290,000 (2.5 ha field)
Confidence: 82%
→ Action: Maintain current practices, good performance
```

### Example 2: Wheat in March (Cold conditions)
```
Yield: 3,800 kg/hectare (below average)
Price: $28 per kg (rabi season premium)
Revenue: $228,000 (2 ha field)
Confidence: 75%
→ Action: Monitor temperature stress, increase irrigation
```

### Example 3: Tomato in Summer (Hot stress)
```
Yield: 45,000 kg/hectare (heat stress impact)
Price: $5.5 per kg (low - peak supply)
Revenue: $247,500 (1 ha field)
Confidence: 68%
→ Action: Provide shade, prices expected to rise in 2 weeks
```

---

## Advanced: Calibrating for Your Region

### Improve Accuracy Over Time
1. After harvest, record actual yield
2. Go to Database → `prediction_history` table
3. Update `actual_yield` column
4. System calculates accuracy score
5. Models improve with more data!

### Add Real Market Data
1. After selling, record actual price received
2. Go to Database → `market_prices` table
3. Add entry with crop type, price, location
4. System learns your local market patterns

### Adjust Crop Parameters
If predictions consistently off by 20%+:
1. Edit `CROP_YIELD_FACTORS` in:
   - `app/api/predict/yield-price/route.js`
   - `ml/yield_price_predictor.py` (if running locally)
2. Update base_yield for your crop
3. Adjust optimal values for your soil
4. Re-test with new field data

---

## Troubleshooting

### 🔴 "No predictions available"
- **Cause**: Field data not loaded
- **Fix**: Refresh page, select a field from dropdown

### 🔴 "Predictions show unrealistic values"
- **Cause**: Weather data is mock/default
- **Fix**: Normal! Values are simulated. Connect to real weather API for accuracy
- **For now**: Enter realistic weather manually in the form

### 🔴 "Confidence score always low"
- **Cause**: Growth stage still early
- **Fix**: Confidence increases as crop grows (0-100%)

### 🔴 "Price chart not showing"
- **Cause**: Browser zoom or viewport too small
- **Fix**: Try full-screen mode or desktop view

---

## Tips for Best Results

### For Yield Predictions
✅ **DO:**
- Keep soil sensor data updated
- Enter realistic growth stage (0-100%)
- Monitor field condition weekly

❌ **DON'T:**
- Use old soil data (>1 month)
- Ignore pest or disease issues
- Guess on NPK values

### For Price Forecasts
✅ **DO:**
- Check prices from multiple markets
- Record actual prices you receive
- Adjust for seasonal patterns

❌ **DON'T:**
- Trade based solely on forecast (use with caution!)
- Expect accuracy >90 days ahead
- Ignore global commodity prices

---

## Accessing Advanced Features

### Market Price Database
Go to Supabase Dashboard → Browser → `market_prices` table
- View historical pricing
- Add your own price records
- Analyze trends by crop/season

### Prediction History
Database table: `prediction_history`
- Track all past predictions
- Compare predicted vs actual
- Calculate accuracy metrics

### Accuracy Statistics
Database view: `yield_accuracy_stats`
- See prediction accuracy by crop
- Identify which crops you're best at
- Focus improvement efforts

---

## Support & Resources

### Documentation
- Full feature guide: `YIELD_PRICE_FEATURE.md`
- API reference: Check `app/api/predict/yield-price/route.js`
- Database schema: `supabase_migration_yield_price.sql`

### Common Questions

**Q: How far ahead can I predict?**
A: Yield predictions are better before harvest (growth stage >70%), price forecasts are reliable for 30 days, accuracy decreases after 60 days.

**Q: Why are all crops showing same price?**
A: You need real market data. Start recording prices you see in your local market, and the system will learn your region's patterns.

**Q: Can I compare my yield to other farmers?**
A: Yes! Use the `yield_benchmarks` table to see regional averages and compare your performance.

**Q: Will predictions improve over time?**
A: Absolutely! Every actual yield you record improves the model. After 10-20 records per crop, you'll see significant improvement in accuracy.

---

**Start making data-driven farming decisions today! 🌾**

Questions? Check the full documentation in YIELD_PRICE_FEATURE.md
