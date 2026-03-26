-- Pest Control & Management Schema Migration
-- Run this in Supabase SQL Editor

-- 1. Pests Table - Track detected pests per field
CREATE TABLE IF NOT EXISTS pests (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  field_id BIGINT NOT NULL,
  pest_name VARCHAR(100) NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
  zone_name VARCHAR(100),
  coverage_percentage DECIMAL(5,2),
  status VARCHAR(50) DEFAULT 'Active',
  detected_date TIMESTAMP DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, field_id, pest_name, zone_name, detected_date)
);

-- 2. Treatments Table - Track applied treatments
CREATE TABLE IF NOT EXISTS treatments (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  pest_id BIGINT NOT NULL REFERENCES pests(id) ON DELETE CASCADE,
  treatment_method VARCHAR(150) NOT NULL,
  treatment_type VARCHAR(20) NOT NULL CHECK (treatment_type IN ('organic', 'chemical')),
  applied_date TIMESTAMP DEFAULT NOW(),
  next_due_date TIMESTAMP,
  effectiveness_percentage SMALLINT CHECK (effectiveness_percentage >= 0 AND effectiveness_percentage <= 100),
  status VARCHAR(50) DEFAULT 'Applied',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Pest History - Historical tracking for analytics
CREATE TABLE IF NOT EXISTS pest_history (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  field_id BIGINT NOT NULL,
  pest_name VARCHAR(100) NOT NULL,
  recorded_date TIMESTAMP DEFAULT NOW(),
  population_estimate INT,
  control_status VARCHAR(50),
  weather_condition JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Weather-Pest Risk Matrix - Reference for climate-based predictions
CREATE TABLE IF NOT EXISTS pest_risk_profiles (
  id BIGSERIAL PRIMARY KEY,
  pest_name VARCHAR(100) UNIQUE NOT NULL,
  min_temperature DECIMAL(5,2),
  max_temperature DECIMAL(5,2),
  min_humidity DECIMAL(5,2),
  reproduction_rate DECIMAL(4,2),
  generation_days SMALLINT,
  high_risk_rainfall DECIMAL(6,2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. Pest Control Recommendations - AI-generated treatment plans
CREATE TABLE IF NOT EXISTS pest_recommendations (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  field_id BIGINT NOT NULL,
  pest_name VARCHAR(100) NOT NULL,
  recommendation_date TIMESTAMP DEFAULT NOW(),
  severity VARCHAR(20),
  recommended_treatment JSONB,
  preventive_measures JSONB,
  estimated_impact TEXT,
  priority SMALLINT,
  is_urgent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 6. View: Active Pest Detections
CREATE OR REPLACE VIEW active_pest_detections AS
SELECT
  p.id,
  p.user_id,
  p.field_id,
  p.pest_name,
  p.severity,
  p.zone_name,
  p.coverage_percentage,
  p.status,
  p.detected_date,
  COUNT(DISTINCT t.id) as total_treatments,
  AVG(t.effectiveness_percentage) as avg_treatment_effectiveness
FROM pests p
LEFT JOIN treatments t ON p.id = t.pest_id
WHERE p.status = 'Active'
GROUP BY p.id, p.user_id, p.field_id, p.pest_name, p.severity, p.zone_name, p.coverage_percentage, p.status, p.detected_date;

-- 7. View: Treatment Effectiveness Summary
CREATE OR REPLACE VIEW treatment_effectiveness_summary AS
SELECT
  user_id,
  field_id,
  treatment_method,
  COUNT(id) as times_applied,
  AVG(effectiveness_percentage) as average_effectiveness,
  MAX(effectiveness_percentage) as best_result,
  MIN(applied_date) as first_used,
  MAX(applied_date) as last_used
FROM treatments
GROUP BY user_id, field_id, treatment_method;

-- 8. RLS Policies for pests table
ALTER TABLE pests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own pests"
  ON pests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pests"
  ON pests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pests"
  ON pests FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pests"
  ON pests FOR DELETE
  USING (auth.uid() = user_id);

-- 9. RLS Policies for treatments table
ALTER TABLE treatments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own treatments"
  ON treatments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own treatments"
  ON treatments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own treatments"
  ON treatments FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own treatments"
  ON treatments FOR DELETE
  USING (auth.uid() = user_id);

-- 10. RLS Policies for pest_history table
ALTER TABLE pest_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own pest history"
  ON pest_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pest history"
  ON pest_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 11. RLS Policies for pest_recommendations table
ALTER TABLE pest_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own pest recommendations"
  ON pest_recommendations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pest recommendations"
  ON pest_recommendations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pest recommendations"
  ON pest_recommendations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 12. Insert default pest risk profiles
INSERT INTO pest_risk_profiles (pest_name, min_temperature, max_temperature, min_humidity, reproduction_rate, generation_days, high_risk_rainfall)
VALUES
  ('Armyworm', 25, 30, 70, 2.1, 7, 5),
  ('Bollworm', 20, 28, 65, 1.8, 12, 5),
  ('Whitefly', 18, 30, 70, 2.3, 5, 5),
  ('Aphids', 15, 20, 60, 1.5, 3, 3),
  ('Mites', 30, 40, 30, 2.5, 4, 1),
  ('Jassid', 25, 35, 40, 1.9, 6, 3)
ON CONFLICT (pest_name) DO NOTHING;

-- 13. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_pests_user_field ON pests(user_id, field_id);
CREATE INDEX IF NOT EXISTS idx_treatments_pest_id ON treatments(pest_id);
CREATE INDEX IF NOT EXISTS idx_pest_history_user_date ON pest_history(user_id, recorded_date);
CREATE INDEX IF NOT EXISTS idx_pest_recommendations_user ON pest_recommendations(user_id, field_id);

-- 14. Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_pests_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_pests_updated_at
BEFORE UPDATE ON pests
FOR EACH ROW
EXECUTE FUNCTION update_pests_timestamp();

CREATE OR REPLACE FUNCTION update_treatments_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_treatments_updated_at
BEFORE UPDATE ON treatments
FOR EACH ROW
EXECUTE FUNCTION update_treatments_timestamp();
