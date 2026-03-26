# ✅ Yield Prediction & Price Forecasting - Setup Checklist

## Pre-Installation
- [ ] Backup your Supabase database (optional but recommended)
- [ ] Ensure npm packages are up to date: `npm install`
- [ ] Development server is running: `npm run dev`

## Step 1: Database Migration (2 minutes)
- [ ] Open Supabase Dashboard (https://app.supabase.com)
- [ ] Go to Your Project → SQL Editor
- [ ] Create new query
- [ ] Copy entire content of `supabase_migration_yield_price.sql`
- [ ] Paste into SQL Editor
- [ ] Click **RUN** button
- [ ] Wait for success notification (green checkmark)
- [ ] Verify all 5 tables created via "Browser" sidebar:
  - [ ] predictions table exists
  - [ ] prediction_history table exists
  - [ ] market_prices table exists
  - [ ] yield_benchmarks table exists
  - [ ] price_recommendations table exists

## Step 2: Verify Component Files
- [ ] File exists: `components/pages/YieldPricePrediction.jsx` ✓
- [ ] File exists: `app/api/predict/yield-price/route.js` ✓
- [ ] File exists: `lib/yield-price-service.js` ✓
- [ ] Layout.jsx has been updated with new import and navigation
- [ ] No TypeScript/syntax errors in console

## Step 3: Restart Application
- [ ] Stop development server (Ctrl+C)
- [ ] Run: `npm run dev`
- [ ] Wait for "ready - started server" message
- [ ] Open http://localhost:3000 in browser
- [ ] Login to your account

## Step 4: Verify Navigation
- [ ] Left sidebar visible
- [ ] Check for new menu item: **"Yield & Price"** (with trending up icon)
- [ ] Click on it - page loads without errors

## Step 5: Test Prediction Generation
- [ ] Go to "My Fields" page
- [ ] Create a test field OR select existing field:
  - [ ] Crop Type: "Rice"
  - [ ] Soil Moisture: 70%
  - [ ] pH: 6.8
  - [ ] Temperature: 28°C
  - [ ] Nitrogen: 120 ppm
  - [ ] Add other soil metrics
- [ ] Save field
- [ ] Go back to "Yield & Price" page
- [ ] Should see prediction cards loading
- [ ] Verify three tabs appear:
  - [ ] Yield Tab - shows kg/ha, total yield, confidence
  - [ ] Price Tab - shows current/expected/min/max prices
  - [ ] Financial Tab - shows revenue projections

## Step 6: Validate Predictions
### Yield Tab
- [ ] "Total Predicted Yield" card shows number (not 0 or error)
- [ ] "Per Hectare Yield" shows reasonable value for crop
- [ ] Confidence score is between 50-95%
- [ ] Factor breakdown shows colored bars
- [ ] Optimization tips appear

### Price Tab
- [ ] Current price shows ($X.XX format)
- [ ] Expected price is reasonable
- [ ] Min and max prices make sense
- [ ] 30-day chart shows bars
- [ ] Trend indicator shows "upward" or "downward"
- [ ] Market strategy section has recommendations

### Financial Tab
- [ ] Expected revenue shows dollar amount
- [ ] Conservative and optimistic values shown
- [ ] Revenue calculation breakdown visible
- [ ] Financial strategy tips appear

## Step 7: Database Verification
- [ ] Go to Supabase → Browser
- [ ] Check predictions table:
  - [ ] Can see new row was inserted
  - [ ] Field data populated correctly
  - [ ] Yield and price data saved
- [ ] Check views exist:
  - [ ] `latest_predictions` view accessible
  - [ ] `yield_accuracy_stats` view accessible

## Step 8: Documentation Review
- [ ] Read `YIELD_PRICE_QUICKSTART.md` (5 min read)
- [ ] Review `INSTALLATION_SUMMARY.md` for feature overview
- [ ] Skim `YIELD_PRICE_FEATURE.md` for advanced details
- [ ] Bookmark these files for reference

## Troubleshooting Checklist

### If database migration failed:
- [ ] Check for SQL syntax errors in migration file
- [ ] Verify you're using correct database
- [ ] Try running migration in smaller chunks
- [ ] Check Supabase quota limits

### If "Yield & Price" tab doesn't appear:
- [ ] Restart development server: `npm run dev`
- [ ] Clear browser cache: Ctrl+Shift+Delete
- [ ] Hard refresh page: Ctrl+Shift+R
- [ ] Check console for import errors

### If predictions show "No data":
- [ ] Select a field from dropdown
- [ ] Ensure field has crop_type filled
- [ ] Check API response in browser DevTools (F12)
- [ ] Verify API route file exists

### If predictions show 0 values:
- [ ] Ensure all soil metrics are filled (not null)
- [ ] Check crop_type is in CROP_YIELD_FACTORS list
- [ ] Verify weather data is being passed correctly

## Performance Checklist
- [ ] Page loads in <2 seconds
- [ ] Charts render smoothly
- [ ] No console errors (yellow warnings okay)
- [ ] Numbers format correctly (no NaN or Infinity)
- [ ] Tab switching is responsive

## Feature Validation Checklist
- [ ] Yield predictions vary based on soil metrics ✓
- [ ] Price trends show up/down correctly ✓
- [ ] Revenue range includes low/high scenarios ✓
- [ ] Growth stage affects confidence if <50% ✓
- [ ] Different crops show different base values ✓

## Optional: Advanced Setup
- [ ] Create 3-5 test fields with different crops
- [ ] Generate predictions for each
- [ ] Compare recommendations across crops
- [ ] Test accuracy tracking (after harvest)
- [ ] Add market price data to database

## Production Readiness
- [ ] All tests pass
- [ ] No console errors
- [ ] Database migration confirmed
- [ ] API endpoints responding
- [ ] Documentation reviewed
- [ ] Ready to demo to farmers

---

## 🎉 Success Criteria

You'll know installation is complete when:

1. ✅ "Yield & Price" appears in navigation sidebar
2. ✅ Can click and view prediction page
3. ✅ Predictions generate with realistic numbers
4. ✅ All three tabs (Yield, Price, Financial) work
5. ✅ Data saves to database
6. ✅ No errors in browser console

---

## 📝 Quick Reference

### Key Files
- Component: `components/pages/YieldPricePrediction.jsx`
- API: `app/api/predict/yield-price/route.js`
- Database: `supabase_migration_yield_price.sql`
- Docs: `YIELD_PRICE_QUICKSTART.md`

### Supported Crops
Rice, Wheat, Corn, Potato, Tomato, Cotton

### Default Parameters
- Yield Confidence: 60-95% (based on growth stage)
- Price Forecast: 30 days
- Currency: USD
- Weight Unit: kg

### Support
- Full documentation: `YIELD_PRICE_FEATURE.md`
- Quick start: `YIELD_PRICE_QUICKSTART.md`
- This checklist: `SETUP_CHECKLIST.md`

---

**Setup time: ~10-15 minutes**
**First prediction generation: ~30 seconds**
**Ready to demo: Now!** 🚀

Mark items complete as you go through the checklist!
