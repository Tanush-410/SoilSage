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
