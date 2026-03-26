/**
 * NON-SENSOR BASED FARM ADVISOR
 * 
 * LOGIC: Instead of real-time sensor data, we use:
 * 1. Manual farmer inputs (observations, last irrigation, etc.)
 * 2. Regional soil/weather data (static database)
 * 3. AI predictions (based on crop type, location, history)
 * 4. Weather forecasts (from API, not sensors)
 */

// INDIAN REGIONS - Default soil properties by region
const REGIONAL_SOIL_DATA = {
  'Maharashtra': { soilType: 'Laterite', pH: 6.2, nitrogen: 200, phosphorus: 25, potassium: 150 },
  'Punjab': { soilType: 'Alluvial', pH: 7.8, nitrogen: 280, phosphorus: 30, potassium: 200 },
  'Haryana': { soilType: 'Alluvial', pH: 7.5, nitrogen: 250, phosphorus: 28, potassium: 180 },
  'Uttar Pradesh': { soilType: 'Alluvial', pH: 7.6, nitrogen: 240, phosphorus: 27, potassium: 170 },
  'Rajasthan': { soilType: 'Sandy', pH: 8.2, nitrogen: 150, phosphorus: 20, potassium: 120 },
  'Gujarat': { soilType: 'Black', pH: 7.9, nitrogen: 220, phosphorus: 32, potassium: 200 },
  'Tamil Nadu': { soilType: 'Red', pH: 6.5, nitrogen: 210, phosphorus: 26, potassium: 140 },
  'Madhya Pradesh': { soilType: 'Black', pH: 7.7, nitrogen: 230, phosphorus: 31, potassium: 190 },
  'Karnataka': { soilType: 'Red/Black', pH: 6.8, nitrogen: 200, phosphorus: 24, potassium: 150 },
  'Andhra Pradesh': { soilType: 'Black', pH: 7.4, nitrogen: 220, phosphorus: 29, potassium: 180 },
  'default': { soilType: 'Alluvial', pH: 7.0, nitrogen: 220, phosphorus: 28, potassium: 170 }
}

// CROP IRRIGATION SCHEDULES (days between irrigations)
const CROP_IRRIGATION_SCHEDULE = {
  'Rice': { daysInterval: 7, waterNeeded: 50, season: 'monsoon' },
  'Wheat': { daysInterval: 14, waterNeeded: 40, season: 'winter' },
  'Cotton': { daysInterval: 10, waterNeeded: 35, season: 'summer' },
  'Sugarcane': { daysInterval: 10, waterNeeded: 45, season: 'yearround' },
  'Corn': { daysInterval: 12, waterNeeded: 38, season: 'summer' },
  'Potato': { daysInterval: 8, waterNeeded: 30, season: 'winter' },
  'Tomato': { daysInterval: 5, waterNeeded: 25, season: 'yearround' },
  'Onion': { daysInterval: 10, waterNeeded: 28, season: 'winter' },
  'Groundnut': { daysInterval: 14, waterNeeded: 32, season: 'summer' },
  'default': { daysInterval: 10, waterNeeded: 35, season: 'yearround' }
}

// SOIL HEALTH SCORES FROM FARMER OBSERVATIONS (NO SENSORS)
const OBSERVATION_SCORING = {
  color: {
    'very_dark_brown': 30,      // Excellent OM
    'dark_brown': 25,
    'brown': 20,
    'light_brown': 10,
    'light': 5
  },
  texture: {
    'loamy': 30,                // Ideal
    'clay_loam': 25,
    'sandy_loam': 20,
    'clayey': 15,
    'sandy': 10
  },
  drainage: {
    'excellent': 25,
    'good': 20,
    'moderate': 15,
    'poor': 5
  },
  organic_matter: {
    'high': 20,
    'moderate': 15,
    'low': 5
  },
  compaction: {
    'loose': 15,
    'medium': 10,
    'hard': 0
  },
  earthworms: {
    'many': 15,                 // >20 per sqft = biodiversity
    'moderate': 10,
    'few': 5,
    'none': 0
  }
}

/**
 * LOGIC 1: Calculate soil health from OBSERVATIONS (no sensors needed)
 * Instead of: reading soil_moisture, pH from sensors
 * We use: farmer observations + regional baseline
 */
export function calculateSoilHealthFromObservations(observations, region) {
  // Get regional baseline
  const baseline = REGIONAL_SOIL_DATA[region] || REGIONAL_SOIL_DATA.default
  
  // Score each observation
  const scores = {
    color: OBSERVATION_SCORING.color[observations.color] || 0,
    texture: OBSERVATION_SCORING.texture[observations.texture] || 0,
    drainage: OBSERVATION_SCORING.drainage[observations.drainage] || 0,
    organicMatter: OBSERVATION_SCORING.organic_matter[observations.organic_matter] || 0,
    compaction: OBSERVATION_SCORING.compaction[observations.compaction] || 0,
    earthworms: OBSERVATION_SCORING.earthworms[observations.earthworm_level] || 0,
  }

  // Calculate weighted score (100 total)
  const totalScore = Math.round(
    scores.color * 0.20 +        // 20% - color indicates organic matter
    scores.texture * 0.20 +      // 20% - texture affects water holding
    scores.drainage * 0.15 +     // 15% - drainage prevents waterlogging
    scores.organicMatter * 0.20 +// 20% - direct OM assessment
    scores.compaction * 0.15 +   // 15% - compaction blocks roots
    scores.earthworms * 0.10     // 10% - earthworms = soil life
  )

  // Estimate NPK based on region + observations
  const estimatedNutrients = {
    nitrogen: baseline.nitrogen + (scores.organicMatter > 10 ? 30 : 0),
    phosphorus: baseline.phosphorus + (scores.color > 20 ? 5 : 0),
    potassium: baseline.potassium + (scores.texture === 30 ? 20 : 0),
    pH: baseline.pH
  }

  return {
    overallScore: totalScore,
    health: totalScore >= 80 ? 'Excellent' : totalScore >= 60 ? 'Good' : totalScore >= 40 ? 'Fair' : 'Poor',
    scores,
    estimatedNutrients,
    baseline
  }
}

/**
 * LOGIC 2: Irrigation recommendation from WEATHER + CROP TYPE (no sensors)
 * Instead of: reading soil_moisture % from sensor
 * We use: weather forecast + crop schedule + last irrigation date
 */
export function getIrrigationRecommendation(weather, crop, lastIrrigationDate, region) {
  const schedule = CROP_IRRIGATION_SCHEDULE[crop] || CROP_IRRIGATION_SCHEDULE.default
  
  // Calculate days since last irrigation
  const daysSinceIrrigation = Math.floor(
    (new Date() - new Date(lastIrrigationDate)) / (1000 * 60 * 60 * 24)
  )

  // Weather factor (reduce irrigation if rain expected)
  const rainfallNext7Days = weather?.daily?.slice(0, 7).reduce((sum, d) => sum + (d.rainSum || 0), 0) || 0
  const weatherFactor = rainfallNext7Days > 20 ? 0.5 : rainfallNext7Days > 5 ? 0.7 : 1.0

  // Temperature factor (increase if very hot)
  const avgTemp = weather?.current?.temperature || 25
  const tempFactor = avgTemp > 35 ? 1.3 : avgTemp > 30 ? 1.1 : 1.0

  // Adjusted irrigation interval
  const adjustedInterval = Math.round(schedule.daysInterval * weatherFactor / tempFactor)
  
  // Determine urgency
  let urgency = 'low'
  if (daysSinceIrrigation >= adjustedInterval + 2) urgency = 'critical'
  else if (daysSinceIrrigation >= adjustedInterval) urgency = 'high'
  else if (daysSinceIrrigation >= adjustedInterval - 1) urgency = 'medium'

  return {
    recommendedIntervalDays: adjustedInterval,
    daysSinceLastIrrigation: daysSinceIrrigation,
    nextIrrigationDate: new Date(new Date(lastIrrigationDate).getTime() + adjustedInterval * 24 * 60 * 60 * 1000),
    waterNeededLiters: (schedule.waterNeeded * 10000) / 2, // per hectare, simplified
    urgency,
    reason: rainfallNext7Days > 20 ? `Rain expected (${rainfallNext7Days}mm) - delay irrigation` : 
            avgTemp > 35 ? 'Hot weather - increase irrigation frequency' :
            daysSinceIrrigation >= adjustedInterval ? 'Irrigation due based on schedule' :
            'Continue monitoring'
  }
}

/**
 * LOGIC 3: Nutrient deficiency detection from VISUAL SYMPTOMS (no lab tests)
 * Instead of: reading PPM values from sensors
 * We use: crop appearance + crop history + soil age
 */
export const NUTRIENT_DEFICIENCY_GUIDE = {
  nitrogen: {
    symptoms: ['Yellowing lower leaves', 'Stunted growth', 'Poor tillering', 'Weak stems'],
    solution: 'Apply 50kg Urea/ha via spray or topsoil application',
    crops: ['Rice', 'Wheat', 'Corn', 'Cotton'],
    cost: '₹2,500-3,500/ha'
  },
  phosphorus: {
    symptoms: ['Purple/reddish leaves', 'Weak root development', 'Poor flowering', 'Dark green leaves'],
    solution: 'Apply 25kg DAP/ha or 50kg SSP/ha',
    crops: ['All cereals', 'Pulses', 'Oilseeds'],
    cost: '₹3,000-4,000/ha'
  },
  potassium: {
    symptoms: ['Brown leaf edges', 'Weak stems', 'Poor fruit filling', 'Scorching on leaf margins'],
    solution: 'Apply 30kg MOP/ha or 500L wood ash solution/ha',
    crops: ['Sugar crops', 'Potatoes', 'Fruits', 'All crops'],
    cost: '₹2,000-3,000/ha'
  },
  sulfur: {
    symptoms: ['Uniform yellowing of new leaves', 'Pale shoots', 'Stunted growth'],
    solution: 'Apply 15kg Gypsum/ha or 10kg Elemental Sulfur/ha',
    crops: ['Oilseeds', 'Legumes', 'Vegetables'],
    cost: '₹1,500-2,500/ha'
  },
  boron: {
    symptoms: ['Thick, brittle leaves', 'Hollow stems', 'Poor fruit set'],
    solution: 'Apply 1kg Borax/ha via foliar spray (0.2% solution)',
    crops: ['Vegetables', 'Fruits', 'Oilseeds'],
    cost: '₹500-1,000/ha'
  }
}

/**
 * LOGIC 4: 7-Day Farmer Action Plan (based on weather, not sensors)
 * Instead of: continuous sensor monitoring
 * We use: weather forecast + manual checks + crop stage
 */
export function generate7DayPlan(weather, field, crops) {
  const plan = []
  
  weather?.daily?.slice(0, 7).forEach((day, idx) => {
    const date = new Date(day.date)
    const action = {}
    
    // Rain-based actions
    if (day.rainSum > 15) {
      action.action = 'Skip irrigation'
      action.reason = `Heavy rain expected (${day.rainSum}mm)`
      action.icon = '🌧️'
    }
    // Temperature-based actions
    else if (day.tempMax > 38) {
      action.action = 'Increase watering, apply mulch'
      action.reason = `Extreme heat (${day.tempMax}°C)`
      action.icon = '🔥'
    }
    // Wind-based actions
    else if (day.windSpeed > 40) {
      action.action = 'Check stakes, inspect for wind damage'
      action.reason = `Strong winds (${day.windSpeed} km/h)`
      action.icon = '💨'
    }
    // Default maintenance
    else if (idx % 3 === 0) {
      action.action = 'Visual field inspection'
      action.reason = 'Routine check for pests, weeds, crop health'
      action.icon = '👀'
    }
    
    if (action.action) {
      plan.push({
        date: date.toISOString().split('T')[0],
        day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()],
        ...action
      })
    }
  })
  
  return plan
}

/**
 * LOGIC 5: COMPREHENSIVE SOIL HEALTH CALCULATION
 * Incorporates: observations + weather + rainfall + irrigation + region + climate
 */
export function calculateComprehensiveSoilHealth(observations, weather, irrigationHistory, region, recentRainfall) {
  // Base score from observations (0-100)
  const baseScore = calculateSoilHealthFromObservations(observations, region).overallScore

  // Weather impact on soil health
  const weatherImpact = calculateWeatherImpactOnSoil(weather, recentRainfall)

  // Irrigation consistency impact
  const irrigationImpact = calculateIrrigationHealthImpact(irrigationHistory)

  // Regional climate stress factors
  const climateImpact = calculateClimateStressFactors(region, weather, recentRainfall)

  // Combine all factors with weights
  const comprehensiveScore = Math.round(
    baseScore * 0.40 +              // 40% - Direct soil observations
    weatherImpact * 0.15 +          // 15% - Current weather conditions
    irrigationImpact * 0.25 +       // 25% - Irrigation management quality
    climateImpact * 0.20            // 20% - Regional climate factors
  )

  return {
    overallScore: Math.min(100, Math.max(0, comprehensiveScore)),
    baseObservationScore: baseScore,
    weatherImpactScore: weatherImpact,
    irrigationHealthScore: irrigationImpact,
    climateStressScore: climateImpact,
    details: {
      weather: getWeatherHealthDetails(weather, recentRainfall),
      irrigation: getIrrigationHealthDetails(irrigationHistory),
      climate: getClimateHealthDetails(region, weather)
    },
    recommendations: generateComprehensiveRecommendations(
      baseScore, 
      weatherImpact, 
      irrigationImpact, 
      climateImpact,
      region
    )
  }
}

/**
 * Weather impact on soil health
 * Good rainfall + moderate temp = healthy
 * Extreme heat/cold or dry = stress
 */
function calculateWeatherImpactOnSoil(weather, recentRainfall) {
  let score = 60 // Base score

  // Rainfall adequacy (50-100mm is ideal for most crops)
  if (recentRainfall && recentRainfall > 0) {
    if (recentRainfall >= 30 && recentRainfall <= 100) score += 30  // Ideal range
    else if (recentRainfall > 100) score += 15                      // Excess water stress
    else if (recentRainfall > 10) score += 20                       // Moderate
    else score += 5                                                  // Very low
  } else {
    score -= 20 // Dry conditions stress
  }

  // Temperature factors (affects soil biology + evaporation)
  const avgTemp = weather?.current?.temperature || 25
  if (avgTemp >= 20 && avgTemp <= 35) score += 15  // Optimal
  else if (avgTemp > 35) score -= 10               // Heat stress
  else if (avgTemp < 15) score -= 5                // Cold stress

  // Humidity affects microbial activity
  const humidity = weather?.current?.humidity || 60
  if (humidity >= 50 && humidity <= 80) score += 10  // Good for biology
  else if (humidity > 90) score -= 5                 // Waterlogging risk
  else if (humidity < 30) score -= 10                // Drought stress

  return Math.min(100, Math.max(20, score))
}

/**
 * Irrigation management quality score
 * Regular, appropriate irrigation = healthy soil
 */
function calculateIrrigationHealthImpact(irrigationHistory) {
  if (!irrigationHistory || irrigationHistory.length === 0) return 40  // No history = unknown risk

  // Check last 5 irrigations
  const recent = irrigationHistory.slice(0, 5)
  let score = 70

  // Consistency check (days between irrigations)
  const intervals = []
  for (let i = 1; i < recent.length; i++) {
    const date1 = new Date(recent[i].irrigated_date)
    const date2 = new Date(recent[i - 1].irrigated_date)
    intervals.push((date2 - date1) / (1000 * 60 * 60 * 24))
  }

  // Standard deviation of intervals (consistency)
  if (intervals.length > 0) {
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length
    const variance = intervals.reduce((sum, x) => sum + Math.pow(x - avgInterval, 2), 0) / intervals.length
    const stdDev = Math.sqrt(variance)

    if (stdDev < 3) score += 20  // Very consistent
    else if (stdDev < 7) score += 10  // Somewhat consistent
    else score -= 10  // Inconsistent = stress on soil
  }

  // Water amount check
  const avgWater = recent.reduce((sum, r) => sum + (r.water_used_liters || 0), 0) / recent.length
  if (avgWater > 3000 && avgWater < 6000) score += 10  // Reasonable amounts
  else if (avgWater > 8000) score -= 15  // Too much = waterlogging
  else if (avgWater < 1000) score -= 20  // Too little = drought

  return Math.min(100, Math.max(20, score))
}

/**
 * Climate stress factors based on region
 * Combines regional defaults with current conditions
 */
function calculateClimateStressFactors(region, weather, recentRainfall) {
  const baseline = REGIONAL_SOIL_DATA[region] || REGIONAL_SOIL_DATA.default
  let score = 70

  // Regional expectations
  const isDesert = region === 'Rajasthan'
  const isCoastal = region === 'Tamil Nadu'
  const isMonsoon = region === 'Maharashtra'

  // Rainfall vs region typical
  if (recentRainfall) {
    if (isDesert) {
      if (recentRainfall < 20) score += 15  // Expected low
      if (recentRainfall > 50) score -= 10  // Unusual
    } else if (isMonsoon) {
      if (recentRainfall >= 50) score += 15  // Expected
      if (recentRainfall > 150) score -= 10  // Too much
    } else {
      if (recentRainfall >= 30) score += 10
    }
  }

  // Soil pH stress in current season
  const temp = weather?.current?.temperature || 25
  if (baseline.pH < 6) {
    // Acidic soils - affected by heat/leaching
    if (temp > 30) score -= 5
  } else if (baseline.pH > 8) {
    // Alkaline soils - can lock nutrients
    if (recentRainfall && recentRainfall > 100) score += 10  // Leaching helps
  }

  return Math.min(100, Math.max(20, score))
}

function getWeatherHealthDetails(weather, recentRainfall) {
  return {
    temperature: weather?.current?.temperature || 'N/A',
    humidity: weather?.current?.humidity || 'N/A',
    recentRainfall: recentRainfall ? `${recentRainfall}mm` : 'No recent rain',
    assessment: recentRainfall > 50 ? 'Good moisture' : 
                 recentRainfall > 20 ? 'Moderate moisture' :
                 'Dry - consider irrigation'
  }
}

function getIrrigationHealthDetails(irrigationHistory) {
  if (!irrigationHistory || irrigationHistory.length === 0) {
    return { lastIrrigation: 'No record', frequency: 'Unknown', assessment: 'Add irrigation history' }
  }

  const last = irrigationHistory[0]
  const daysSince = Math.floor((new Date() - new Date(last.irrigated_date)) / (1000 * 60 * 60 * 24))
  const avgInterval = irrigationHistory.length > 1 
    ? Math.round((new Date(irrigationHistory[0].irrigated_date) - new Date(irrigationHistory[1].irrigated_date)) / (1000 * 60 * 60 * 24))
    : 'Unknown'

  return {
    lastIrrigation: `${daysSince} days ago`,
    frequency: avgInterval !== 'Unknown' ? `Every ${avgInterval} days` : 'Unknown',
    assessment: daysSince > 14 ? 'Long time since irrigation' : 
                 daysSince > 7 ? 'Regular irrigation' :
                 'Recent irrigation (good)'
  }
}

function getClimateHealthDetails(region, weather) {
  const baseline = REGIONAL_SOIL_DATA[region] || REGIONAL_SOIL_DATA.default
  const temp = weather?.current?.temperature || 25

  return {
    region: region,
    soilType: baseline.soilType,
    regionalPH: baseline.pH,
    currentTemperature: temp,
    assessment: temp > 35 ? 'Heat stress on soil biology' :
                 temp < 10 ? 'Cold stress - slow decomposition' :
                 'Optimal temperature range'
  }
}

function generateComprehensiveRecommendations(obsScore, weatherScore, irrigScore, climateScore, region) {
  const recommendations = []

  // Observation-based
  if (obsScore < 50) {
    recommendations.push('Priority: Improve soil with compost/FYM')
    recommendations.push('Action: Add 5-10 tons organic matter per hectare')
  }

  // Weather-based
  if (weatherScore < 50) {
    recommendations.push('Weather stress detected')
    if (weatherScore < 40) recommendations.push('Action: Mulch to retain moisture')
  }

  // Irrigation-based
  if (irrigScore < 50) {
    recommendations.push('Irrigation management needs attention')
    recommendations.push('Action: Establish regular irrigation schedule')
  }

  // Climate-based
  if (climateScore < 60) {
    recommendations.push(`Regional climate stress: Consider crop modifications for ${region}`)
  }

  // Overall positive
  if (obsScore + weatherScore + irrigScore + climateScore > 280) {
    recommendations.push('✓ Overall soil health is good - maintain current practices')
  }

  return recommendations
}

/**
 * LOGIC 5: Alternative actions when sensors fail
 * Shows what to do manually
 */
export const MANUAL_SOIL_CHECK = {
  moistureCheck: {
    method: 'Grab test',
    procedure: [
      'Dig 15cm into soil',
      'Squeeze soil in hand',
      'If ball forms & sticks: Too wet (>70%)',
      'If slightly crumbly: Ideal (45-60%)',
      'If very crumbly: Too dry (<30%)'
    ]
  },
  compactionCheck: {
    method: 'Spade penetration',
    procedure: [
      'Push spade into soil',
      'Easy entry (0-10cm): Good',
      'Difficult entry: Compacted',
      'Use deep plowing or subsoiler if compacted'
    ]
  },
  nutrientCheck: {
    method: 'Visual inspection + area history',
    procedure: [
      'Look for yellowing (N deficiency)',
      'Check for purple tints (P deficiency)',
      'Ask farmer about previous yields',
      'Review crop rotation history'
    ]
  }
}

export default {
  calculateSoilHealthFromObservations,
  calculateComprehensiveSoilHealth,
  getIrrigationRecommendation,
  generate7DayPlan,
  NUTRIENT_DEFICIENCY_GUIDE,
  MANUAL_SOIL_CHECK,
  REGIONAL_SOIL_DATA,
  CROP_IRRIGATION_SCHEDULE
}
