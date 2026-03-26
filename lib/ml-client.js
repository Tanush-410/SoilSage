/**
 * ML API client — calls the Python Flask server at localhost:5000
 * Falls back to the built-in FAO-56 JS engine if the ML server is not running.
 */

import { computeIrrigationRecommendation } from './irrigation-engine'

const ML_API = 'http://localhost:5000'

export async function getMLPrediction({ crop, soilData, weather, fieldArea, location }) {
  try {
    // Check if ML server is running
    const health = await fetch(`${ML_API}/health`, { signal: AbortSignal.timeout(2000) })
    if (!health.ok) throw new Error('ML server offline')

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

    const res = await fetch(`${ML_API}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
    })

    if (!res.ok) throw new Error('ML API error')
    const mlResult = await res.json()

    // Map ML API response to the same format the UI expects
    return {
      urgency: mlResult.urgency,
      urgencyReason: `ML Model (${mlResult.ml_model}) — ${mlResult.irrigate_confidence}% confidence`,
      shouldIrrigateNow: mlResult.should_irrigate,
      nextIrrigationTime: mlResult.next_irrigation,
      waterAmountLiters: mlResult.water_litres,
      durationMinutes: Math.round(mlResult.water_litres / 200),
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

export async function getPestPrediction({ crop, soilData, weather, fieldArea }) {
  try {
    // Check if ML server is running
    const health = await fetch(`${ML_API}/health`, { signal: AbortSignal.timeout(2000) })
    if (!health.ok) throw new Error('ML server offline')

    // Prepare payload for Flask API (similar to irrigation but for pest prediction)
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

    const res = await fetch(`${ML_API}/predict-pest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
    })

    if (!res.ok) throw new Error('Pest ML API error')
    const pestResult = await pestResult.json()

    // Map pest API response to UI format
    return {
      pestRiskScore: pestResult.pest_risk_score,
      pestRiskLevel: pestResult.pest_risk_level,
      pestAlertLevel: pestResult.pest_alert_level,
      pestAlertCode: pestResult.pest_alert_code,
      pestAlertLabel: pestResult.pest_alert_label,
      pestProbabilities: pestResult.pest_probabilities,
      recommendations: pestResult.recommendations,
      alerts: pestResult.alerts,
      monitoringFrequency: pestResult.monitoring_frequency,
      preventiveActions: pestResult.preventive_actions,
      source: 'pest_ml_api',
    }
  } catch (err) {
    console.warn('Pest ML API unavailable, using basic pest risk calculation:', err.message)
    // Fallback to basic calculation using pest database
    const { calculatePestRiskScore } = await import('./pests.js')
    const riskScore = calculatePestRiskScore(crop.id, {
      humidity: weather.current.humidity,
      temperature: weather.current.temperature,
      season: crop.season || 'Year-round',
      growthStage: soilData.growthStage || 'Vegetative'
    })

    const alertLevel = riskScore >= 7 ? 'critical' : riskScore >= 5 ? 'high' : riskScore >= 3 ? 'medium' : 'low'
    const alertCode = {low: 0, medium: 1, high: 2, critical: 3}[alertLevel]

    return {
      pestRiskScore: riskScore,
      pestRiskLevel: `${riskScore.toFixed(1)}/10`,
      pestAlertLevel: alertLevel,
      pestAlertCode: alertCode,
      pestAlertLabel: `${alertLevel.charAt(0).toUpperCase() + alertLevel.slice(1)} Risk`,
      recommendations: [
        riskScore >= 7 ? '🔴 CRITICAL: High pest pressure detected - Immediate action required' :
        riskScore >= 5 ? '🟠 HIGH RISK: Moderate pest pressure - Regular monitoring needed' :
        riskScore >= 3 ? '🟡 MEDIUM RISK: Watch for pest development' :
        '🟢 LOW RISK: Favorable conditions'
      ],
      alerts: [],
      monitoringFrequency: riskScore >= 7 ? 'Daily' : riskScore >= 5 ? '2-3x/week' : 'Weekly',
      preventiveActions: [
        'Field sanitation and weed control',
        'Use of resistant varieties',
        'Proper crop rotation',
        'Biological control agents'
      ],
      source: 'basic_calculation',
    }
  }
}
