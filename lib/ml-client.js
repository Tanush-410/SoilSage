/**
 * ML API client — calls the Python Flask server at localhost:5000
 * Falls back to the built-in FAO-56 JS engine if the ML server is not running.
 */

import { computeIrrigationRecommendation } from './irrigation-engine'

const ML_API = process.env.NEXT_PUBLIC_ML_API_URL || 'http://localhost:5000'

/** Cross-browser fetch with timeout (replaces AbortSignal.timeout which fails on iOS Safari < 16.4) */
function fetchWithTimeout(url, options = {}, timeoutMs = 30000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  return fetch(url, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(timer))
}

export async function getMLPrediction({ crop, soilData, weather, fieldArea, location }) {
  try {
    // Prepare payload for Flask API
    const daily = weather.daily || []
    const rain3day = daily.slice(0, 3).reduce((s, d) => s + (d.rainSum || 0), 0)
    const avgDay = daily[0] || {}

    const payload = {
      // Soil
      soil_moisture: soilData.moisture,
      soil_ph: soilData.ph,
      soil_temperature: soilData.temperature,
      nitrogen: soilData.nitrogen,
      phosphorus: soilData.phosphorus,
      potassium: soilData.potassium,
      area_ha: fieldArea,
      // Crop
      crop_name: crop.name,
      water_need: crop.waterNeed || 'medium',
      growth_stage: soilData.growthStage || 'Vegetative',
      optimal_moisture: crop.optimalMoisture || 65,
      soil_type: soilData.soilType,
      // Weather
      temp_max: avgDay.tempMax || weather.current.temperature + 4,
      temp_min: avgDay.tempMin || weather.current.temperature - 6,
      humidity: weather.current.humidity,
      wind_speed: weather.current.windSpeed,
      rain_3day: rain3day,
      et0: avgDay.evapotranspiration || 0,
    }

    const res = await fetchWithTimeout(`${ML_API}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }, 20000)

    if (!res.ok) throw new Error('ML API error')
    const mlResult = await res.json()

    // Map ML API response to the same format the UI expects
    return {
      urgency: mlResult.urgency,
      urgencyReason: `ML Model (${mlResult.ml_model}) — ${mlResult.irrigate_confidence}% confidence`,
      shouldIrrigateNow: mlResult.should_irrigate,
      nextIrrigationTime: mlResult.next_irrigation,
      waterAmountLiters: mlResult.water_litres,
      waterAmountGallons: Math.round(mlResult.water_litres * 0.264172),
      durationMinutes: Math.round((mlResult.water_litres * 0.264172) / 200),
      schedule: mlResult.schedule || [],
      efficiencyScore: mlResult.efficiency_score,
      waterSaved: `${mlResult.water_saved_pct}% vs flood irrigation`,
      soilAnalysis: `ML confidence: ${mlResult.irrigate_confidence}%. Urgency probabilities → Low: ${mlResult.urgency_probabilities?.low}% / Medium: ${mlResult.urgency_probabilities?.medium}% / High: ${mlResult.urgency_probabilities?.high}% / Critical: ${mlResult.urgency_probabilities?.critical}%`,
      weatherImpact: `ET₀: ${mlResult.et0}mm/day — Crop demand (ETc): ${mlResult.etc_per_day}mm/day (Kc=${mlResult.kc}) — Net irrigation requirement: ${mlResult.nir_week_mm}mm/week`,
      cropSpecificAdvice: `${crop.name} at ${soilData.growthStage} stage. ${mlResult.method}. ${mlResult.best_time}.`,
      kc: mlResult.kc?.toString(),
      et0: mlResult.et0?.toString(),
      etcPerDay: mlResult.etc_per_day?.toString(),
      nirWeekMM: mlResult.nir_week_mm?.toString(),
      rootZoneTAW: mlResult.root_zone_taw?.toString(),
      rootZoneDepletion: mlResult.depletion_mm?.toString(),
      alerts: mlResult.alerts,
      method: mlResult.method,
      bestTimeToIrrigate: mlResult.best_time,
      weeklyPlan: `Apply ${mlResult.nir_week_mm}mm net (${mlResult.water_litres?.toLocaleString()}L) — ML-optimised schedule`,
      fertigation: mlResult.fertigation,
      source: 'ml_api',
    }
  } catch (err) {
    console.warn('ML API unavailable, falling back to FAO-56 JS engine:', err.message)
    // Fallback to built-in engine
    const result = computeIrrigationRecommendation({ crop, soilData, weather, fieldArea, location })
    return { ...result, source: 'fao56_engine' }
  }
}

/**
 * Rule-based pest risk prediction. Runs entirely in the browser — no network call needed.
 * Returns same shape the Pest tab in Advisor.jsx expects.
 */
export function getPestPrediction({ crop, soilData, weather, fieldArea }) {
  const temp = weather?.current?.temperature || 25
  const humidity = weather?.current?.humidity || 60
  const moisture = soilData?.moisture || 60
  const growthStage = soilData?.growthStage || 'Vegetative'
  const cropName = crop?.name || 'Wheat'

  // Score 0-10 based on favourable pest conditions
  let score = 0
  if (humidity > 70) score += 2
  if (humidity > 85) score += 1
  if (temp > 25 && temp < 35) score += 2
  if (moisture > 70) score += 1
  if (['Flowering', 'Fruiting'].includes(growthStage)) score += 2
  if (['Rice / Paddy', 'Tomato', 'Cotton', 'Banana'].some(c => cropName.includes(c.split(' ')[0]))) score += 1
  score = Math.min(10, score)

  const alertCode = score >= 7 ? 3 : score >= 5 ? 2 : score >= 3 ? 1 : 0
  const levels = ['low', 'moderate', 'high', 'critical']
  const level = levels[alertCode]

  const recommendations = []
  if (humidity > 75) recommendations.push('🟠 High humidity — monitor for fungal diseases (blight, rust, powdery mildew)')
  if (temp >= 25 && temp <= 32) recommendations.push('🟡 Temperature optimal for aphids and whiteflies — scout regularly')
  if (moisture > 70) recommendations.push('🟠 Excess moisture — risk of root rot and soil-borne pathogens')
  if (['Flowering', 'Fruiting'].includes(growthStage)) recommendations.push('🔴 Critical growth stage — increase scouting frequency to every 3 days')
  if (recommendations.length === 0) recommendations.push('🟢 Conditions are within safe range — continue routine monitoring')

  const preventiveActions = [
    'Scout fields early morning when pests are most active',
    'Remove and destroy infected plant debris promptly',
    'Maintain field hygiene and proper plant spacing for airflow',
    'Use sticky traps to monitor flying insect populations',
    'Apply neem-based bio-pesticides as a first-line preventive measure',
  ]

  const alerts = []
  if (humidity > 85) alerts.push('⚠️ Very high humidity — fungal disease outbreak risk is elevated')
  if (temp > 38) alerts.push('⚠️ Heat stress may weaken plants and increase susceptibility to pests')

  return {
    pestRiskScore: score,
    pestRiskLevel: `${score}/10`,
    pestAlertLevel: level,
    pestAlertCode: alertCode,
    monitoringFrequency: alertCode >= 2 ? 'Every 2–3 days' : alertCode === 1 ? 'Weekly' : 'Bi-weekly',
    recommendations,
    preventiveActions,
    alerts,
    pestProbabilities: { low: alertCode === 0 ? 80 : 10, moderate: alertCode === 1 ? 70 : 10, high: alertCode === 2 ? 70 : 10, critical: alertCode === 3 ? 70 : 5 },
    source: 'rule_based',
  }
}
