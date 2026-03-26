-- NO-SENSOR BASED AGRICULTURE SYSTEM DATABASE SCHEMA
-- Tables to support farmers without IoT sensors

-- 1. FIELD OBSERVATIONS TABLE (replaces real-time sensor readings)
-- Stores manual observations by farmers for soil health assessment
CREATE TABLE IF NOT EXISTS field_observations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  field_id UUID NOT NULL REFERENCES fields(id) ON DELETE CASCADE,
  observation_date TIMESTAMP DEFAULT NOW(),
  observation_type VARCHAR(50), -- 'soil_health', 'crop_health', 'pest_check'
  
  -- Soil Health Observations (visual checks)
  color VARCHAR(50),             -- 'very_dark_brown', 'dark_brown', 'brown', 'light_brown', 'light'
  texture VARCHAR(50),           -- 'loamy', 'clay_loam', 'sandy_loam', 'clayey', 'sandy'
  drainage VARCHAR(50),          -- 'excellent', 'good', 'moderate', 'poor'
  organic_matter VARCHAR(50),    -- 'high', 'moderate', 'low'
  compaction VARCHAR(50),        -- 'loose', 'medium', 'hard'
  earthworm_level VARCHAR(50),   -- 'many', 'moderate', 'few', 'none'
  surface_crust BOOLEAN,         -- true if hard crust after rain
  
  -- Crop Health Observations
  crop_health_status VARCHAR(50), -- 'excellent', 'good', 'fair', 'poor'
  leaf_color VARCHAR(50),         -- 'normal', 'yellow', 'purple', 'brown'
  growth_stage VARCHAR(50),       -- 'germination', 'vegetative', 'flowering', 'maturity'
  pest_presence TEXT,             -- List of observed pests
  disease_symptoms TEXT,          -- Observed diseases
  
  -- Calculated Values (AI-generated from observations)
  calculated_score INT,          -- Soil health score 0-100
  estimated_nitrogen INT,        -- PPM estimate from observations + region
  estimated_phosphorus INT,      -- PPM estimate
  estimated_potassium INT,       -- PPM estimate
  
  -- Metadata
  data_source VARCHAR(50),       -- 'manual_observation', 'sensor', 'ai_estimate'
  notes TEXT,
  
  CREATED_AT TIMESTAMP DEFAULT NOW(),
  UPDATED_AT TIMESTAMP DEFAULT NOW()
);

-- 2. IRRIGATION LOG TABLE (manual farmer tracking instead of continuous sensor data)
-- Stores when and how much water was applied
CREATE TABLE IF NOT EXISTS irrigation_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  field_id UUID NOT NULL REFERENCES fields(id) ON DELETE CASCADE,
  irrigated_date TIMESTAMP DEFAULT NOW(),
  water_used_liters INTEGER,     -- liters applied
  method VARCHAR(50),            -- 'flood', 'drip', 'sprinkler', 'manual_logged'
  duration_hours DECIMAL(5,2),   -- how long irrigation ran
  pressure_bar DECIMAL(5,2),     -- for drip/sprinkler
  notes TEXT,                    -- "Logged manually", "After heavy rain", etc
  
  CREATED_AT TIMESTAMP DEFAULT NOW()
);

-- 3. WEATHER CACHE TABLE (since we're using API, not sensors)
-- Stores weather data for reference and historical analysis
CREATE TABLE IF NOT EXISTS weather_cache (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  field_id UUID REFERENCES fields(id) ON DELETE CASCADE,
  city VARCHAR(100),
  forecast_date DATE,
  temp_max DECIMAL(5,2),
  temp_min DECIMAL(5,2),
  rainfall_mm DECIMAL(6,2),
  humidity_percent INT,
  wind_speed_kmh DECIMAL(6,2),
  weather_condition VARCHAR(100),
  
  CREATED_AT TIMESTAMP DEFAULT NOW()
);

-- 4. FARMER INPUTS TABLE (manual field conditions not captured by sensors)
-- Stores farmer-provided information
CREATE TABLE IF NOT EXISTS farmer_inputs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  field_id UUID NOT NULL REFERENCES fields(id) ON DELETE CASCADE,
  input_date TIMESTAMP DEFAULT NOW(),
  input_type VARCHAR(50),        -- 'crop_info', 'soil_info', 'water_info', 'fertilizer_info'
  
  -- Generic key-value for flexibility
  input_key VARCHAR(100),        -- 'soil_type', 'crop_variety', 'last_harvest', etc
  input_value TEXT,             -- the value
  input_unit VARCHAR(50),       -- 'kg', 'ha', 'days', etc
  
  -- Pre-defined farmer inputs
  irrigation_method VARCHAR(50), -- 'flood', 'drip', 'sprinkler'
  available_water_source VARCHAR(100), -- 'borewell', 'canal', 'lake', 'rain_fed'
  labor_availability VARCHAR(50), -- 'high', 'medium', 'low'
  fertilizer_budget DECIMAL(10,2),
  
  notes TEXT,
  data_source VARCHAR(50),       -- 'mobile_app', 'sms', 'web', 'farmer_visit'
  
  CREATED_AT TIMESTAMP DEFAULT NOW()
);

-- 5. AI RECOMMENDATIONS TABLE (instead of direct sensor-based alerts)
-- Stores system-generated recommendations based on available data
CREATE TABLE IF NOT EXISTS ai_recommendations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  field_id UUID NOT NULL REFERENCES fields(id) ON DELETE CASCADE,
  recommendation_type VARCHAR(50), -- 'irrigation', 'fertilizer', 'pest_control', 'soil_health'
  
  title VARCHAR(200),            -- "Irrigate now - weather forecast shows 3 dry days"
  description TEXT,              -- Detailed reason
  urgency VARCHAR(20),           -- 'critical', 'high', 'medium', 'low'
  action_required TEXT,          -- What farmer should do
  estimated_cost DECIMAL(10,2),
  expected_benefit TEXT,         -- Expected improvement
  
  -- Data used to generate this
  based_on_observations BOOLEAN, -- true if based on manual observations
  based_on_weather BOOLEAN,      -- true if based on weather forecast
  based_on_history BOOLEAN,      -- true if based on field history
  
  recommended_date DATE,         -- When recommended
  action_taken BOOLEAN DEFAULT FALSE,
  completed_date TIMESTAMP,
  
  CREATED_AT TIMESTAMP DEFAULT NOW()
);

-- 6. REGIONAL DEFAULTS TABLE (for farmers without sensors, use regional soil/weather baselines)
CREATE TABLE IF NOT EXISTS regional_defaults (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  region_name VARCHAR(100) UNIQUE,
  state VARCHAR(100),
  country VARCHAR(100),
  
  -- Soil baselines
  default_soil_type VARCHAR(50),
  default_ph DECIMAL(4,2),
  default_nitrogen INT,
  default_phosphorus INT,
  default_potassium INT,
  default_organic_matter DECIMAL(4,2),
  
  -- Crop recommendations
  primary_crops TEXT,            -- JSON array of popular crops
  
  -- Irrigation  
  avg_rainfall_mm INT,
  irrigation_frequency_days INT,
  water_sources TEXT,            -- JSON array
  
  CREATED_AT TIMESTAMP DEFAULT NOW(),
  UPDATED_AT TIMESTAMP DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_field_observations_field_id ON field_observations(field_id);
CREATE INDEX idx_field_observations_date ON field_observations(observation_date);
CREATE INDEX idx_irrigation_log_field_id ON irrigation_log(field_id);
CREATE INDEX idx_irrigation_log_date ON irrigation_log(irrigated_date);
CREATE INDEX idx_ai_recommendations_field_id ON ai_recommendations(field_id);
CREATE INDEX idx_farmer_inputs_field_id ON farmer_inputs(field_id);
CREATE INDEX idx_weather_cache_field_id ON weather_cache(field_id);

-- Pre-populate regional defaults for major Indian regions
INSERT INTO regional_defaults (region_name, state, country, default_soil_type, default_ph, default_nitrogen, default_phosphorus, default_potassium, default_organic_matter, avg_rainfall_mm, irrigation_frequency_days) VALUES
('Punjab', 'Punjab', 'India', 'Alluvial', 7.8, 280, 30, 200, 0.8, 800, 14),
('Haryana', 'Haryana', 'India', 'Alluvial', 7.5, 250, 28, 180, 0.7, 650, 14),
('Uttar Pradesh', 'Uttar Pradesh', 'India', 'Alluvial', 7.6, 240, 27, 170, 0.7, 700, 12),
('Maharashtra', 'Maharashtra', 'India', 'Laterite', 6.2, 200, 25, 150, 1.2, 1200, 10),
('Rajasthan', 'Rajasthan', 'India', 'Sandy', 8.2, 150, 20, 120, 0.5, 300, 21),
('Gujarat', 'Gujarat', 'India', 'Black Soil', 7.9, 220, 32, 200, 1.1, 600, 14),
('Tamil Nadu', 'Tamil Nadu', 'India', 'Red Soil', 6.5, 210, 26, 140, 1.0, 1000, 12),
('Madhya Pradesh', 'Madhya Pradesh', 'India', 'Black Soil', 7.7, 230, 31, 190, 1.0, 1100, 12),
('Karnataka', 'Karnataka', 'India', 'Red/Black', 6.8, 200, 24, 150, 0.9, 900, 12),
('Andhra Pradesh', 'Andhra Pradesh', 'India', 'Black Soil', 7.4, 220, 29, 180, 0.9, 800, 10);

-- DESCRIPTION OF NO-SENSOR SYSTEM:
-- 
-- INSTEAD OF: Real-time sensor data (soil moisture, pH, EC, temperature)
-- WE USE:
--   1. field_observations - Farmer manual checks (color, texture, drainage, compaction, earthworms)
--   2. irrigation_log - Manual tracking of when water was applied
--   3. weather_cache - Public weather API data (not from sensors)
--   4. farmer_inputs - User-provided field conditions
--   5. ai_recommendations - ML-generated recommendations based on above
--   6. regional_defaults - Soil/crop baselines for the region
--
-- HOW IT WORKS:
--   1. Farmer enters visual soil observations (quick checklist)
--   2. System calculates soil health score based on observations
--   3. Weather API gives forecast for irrigation planning
--   4. Farmer logs when irrigation was done
--   5. AI combines all data to make recommendations
--   6. Regional defaults fill gaps where farmer data is missing
--
-- NO SENSORS REQUIRED!
