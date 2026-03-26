-- Yield & Price Predictions Database Schema
-- Run this SQL in Supabase Dashboard → SQL Editor

-- 1. Predictions table
CREATE TABLE IF NOT EXISTS predictions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE DEFAULT auth.uid(),
  field_id uuid REFERENCES fields ON DELETE CASCADE,
  prediction_type text NOT NULL DEFAULT 'combined', -- 'yield', 'price', 'combined'
  
  -- Yield Data
  yield_per_hectare numeric,
  total_yield numeric,
  yield_confidence numeric,
  yield_factors jsonb, -- {moisture, ph, temperature, nutrients, water, growth_stage}
  
  -- Price Data
  current_price numeric,
  expected_price numeric,
  min_price numeric,
  max_price numeric,
  price_trend text, -- 'upward', 'downward'
  price_forecasts jsonb, -- array of {day, date, price, trend, confidence}
  
  -- Financial Projection
  estimated_production numeric,
  potential_revenue numeric,
  revenue_low numeric,
  revenue_high numeric,
  
  -- Metadata
  growth_stage_progress numeric DEFAULT 50, -- 0-100
  forecast_period_days integer DEFAULT 30,
  season text DEFAULT 'kharif', -- 'kharif', 'rabi', 'summer'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own predictions" ON predictions
  FOR ALL USING (auth.uid() = user_id);

-- 2. Historical Predictions (audit trail)
CREATE TABLE IF NOT EXISTS prediction_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  prediction_id uuid REFERENCES predictions ON DELETE CASCADE,
  field_id uuid REFERENCES fields ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE DEFAULT auth.uid(),
  
  -- Stored prediction snapshot
  yield_prediction jsonb,
  price_prediction jsonb,
  financial_projection jsonb,
  
  -- Actual Results (filled later)
  actual_yield numeric,
  actual_revenue numeric,
  accuracy_score numeric, -- prediction accuracy percentage
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  verified_at TIMESTAMPTZ,
  notes text
);

ALTER TABLE prediction_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own history" ON prediction_history
  FOR ALL USING (auth.uid() = user_id);

-- 3. Market Price Data (for training and reference)
CREATE TABLE IF NOT EXISTS market_prices (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  crop_type text NOT NULL,
  market_location text,
  price numeric NOT NULL,
  unit text DEFAULT 'kg', -- 'kg', 'quintal', 'ton'
  season text, -- 'kharif', 'rabi', 'summer'
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  source text DEFAULT 'farmer_input' -- 'farmer_input', 'mandi_data', 'market_api'
);

CREATE INDEX idx_market_prices_crop ON market_prices(crop_type);
CREATE INDEX idx_market_prices_date ON market_prices(recorded_at);

-- 4. Yield Benchmarks (reference data)
CREATE TABLE IF NOT EXISTS yield_benchmarks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  crop_type text NOT NULL,
  soil_type text,
  region text,
  average_yield numeric, -- kg per hectare
  high_yield numeric,
  low_yield numeric,
  year integer,
  data_source text
);

CREATE INDEX idx_benchmarks_crop ON yield_benchmarks(crop_type);
CREATE INDEX idx_benchmarks_region ON yield_benchmarks(region);

-- 5. Price Recommendations
CREATE TABLE IF NOT EXISTS price_recommendations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE DEFAULT auth.uid(),
  field_id uuid REFERENCES fields ON DELETE CASCADE,
  crop_type text NOT NULL,
  
  recommended_selling_price numeric,
  recommendation_reason text,
  confidence_level numeric,
  
  market_trend text, -- 'upward', 'downward', 'stable'
  suggested_action text, -- 'hold', 'sell_now', 'sell_gradually'
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ
);

ALTER TABLE price_recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own recommendations" ON price_recommendations
  FOR ALL USING (auth.uid() = user_id);

-- 6. Create updated_at trigger for predictions
CREATE OR REPLACE FUNCTION update_predictions_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_predictions_timestamp
BEFORE UPDATE ON predictions
FOR EACH ROW
EXECUTE FUNCTION update_predictions_timestamp();

-- 7. Create view for latest predictions
CREATE OR REPLACE VIEW latest_predictions AS
SELECT 
  p.*,
  f.name as field_name,
  f.crop_type,
  f.area_hectares,
  (f.soil_moisture + f.soil_ph + f.soil_temperature) / 3 as avg_soil_health
FROM predictions p
JOIN fields f ON p.field_id = f.id
WHERE p.created_at = (
  SELECT MAX(p2.created_at) 
  FROM predictions p2 
  WHERE p2.field_id = p.field_id
)
ORDER BY p.created_at DESC;

-- 8. Create view for yield accuracy tracking
CREATE OR REPLACE VIEW yield_accuracy_stats AS
SELECT 
  user_id,
  crop_type,
  COUNT(*) as total_predictions,
  AVG(accuracy_score) as avg_accuracy,
  MAX(accuracy_score) as best_accuracy,
  MIN(accuracy_score) as worst_accuracy
FROM prediction_history
WHERE verified_at IS NOT NULL
GROUP BY user_id, crop_type;
