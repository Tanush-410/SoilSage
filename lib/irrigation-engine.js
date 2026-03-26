/**
 * ============================================================
 * SoilSage Custom Irrigation Engine
 * Based on: FAO-56 Penman-Monteith Reference Evapotranspiration
 * Crop Kc values: FAO Irrigation & Drainage Paper No. 56
 * Soil Water Balance: Root Zone Depletion Model
 * ============================================================
 */

// ----- FAO-56 Crop Coefficients (Kc) Database -----
const KC_DATABASE = {
  // Cereals & Grains
  'Wheat':        { ini: 0.30, mid: 1.15, end: 0.25, lengthDays: { ini: 20, dev: 30, mid: 60, late: 40 } },
  'Rice / Paddy': { ini: 1.05, mid: 1.20, end: 0.75, lengthDays: { ini: 30, dev: 30, mid: 60, late: 30 } },
  'Maize / Corn': { ini: 0.30, mid: 1.20, end: 0.35, lengthDays: { ini: 20, dev: 35, mid: 40, late: 30 } },
  'Barley':       { ini: 0.30, mid: 1.15, end: 0.25, lengthDays: { ini: 15, dev: 25, mid: 50, late: 30 } },
  'Sorghum / Jowar': { ini: 0.30, mid: 1.00, end: 0.55, lengthDays: { ini: 20, dev: 35, mid: 40, late: 30 } },
  'Millet / Bajra':  { ini: 0.30, mid: 1.00, end: 0.30, lengthDays: { ini: 15, dev: 25, mid: 40, late: 25 } },
  'Oats':         { ini: 0.30, mid: 1.15, end: 0.25, lengthDays: { ini: 15, dev: 25, mid: 50, late: 30 } },
  // Pulses
  'Chickpea / Chana': { ini: 0.40, mid: 1.00, end: 0.35, lengthDays: { ini: 20, dev: 30, mid: 35, late: 20 } },
  'Soybean':          { ini: 0.40, mid: 1.15, end: 0.50, lengthDays: { ini: 15, dev: 15, mid: 40, late: 15 } },
  'Lentil / Masoor':  { ini: 0.40, mid: 1.10, end: 0.30, lengthDays: { ini: 20, dev: 30, mid: 60, late: 40 } },
  'Black Gram / Urad':{ ini: 0.40, mid: 1.05, end: 0.40, lengthDays: { ini: 15, dev: 25, mid: 30, late: 20 } },
  'Green Gram / Moong':{ ini: 0.40, mid: 1.05, end: 0.40, lengthDays: { ini: 15, dev: 25, mid: 30, late: 20 } },
  'Peas':             { ini: 0.40, mid: 1.15, end: 1.05, lengthDays: { ini: 15, dev: 25, mid: 35, late: 15 } },
  // Vegetables
  'Tomato':       { ini: 0.60, mid: 1.15, end: 0.70, lengthDays: { ini: 30, dev: 40, mid: 40, late: 25 } },
  'Potato':       { ini: 0.45, mid: 1.15, end: 0.75, lengthDays: { ini: 25, dev: 30, mid: 45, late: 30 } },
  'Onion':        { ini: 0.50, mid: 1.00, end: 0.75, lengthDays: { ini: 15, dev: 25, mid: 70, late: 40 } },
  'Cabbage':      { ini: 0.45, mid: 1.05, end: 0.80, lengthDays: { ini: 40, dev: 60, mid: 50, late: 15 } },
  'Cucumber':     { ini: 0.60, mid: 1.00, end: 0.75, lengthDays: { ini: 20, dev: 30, mid: 40, late: 15 } },
  'Bell Pepper / Capsicum': { ini: 0.60, mid: 1.05, end: 0.90, lengthDays: { ini: 30, dev: 40, mid: 110, late: 30 } },
  'Carrot':       { ini: 0.70, mid: 1.05, end: 0.95, lengthDays: { ini: 20, dev: 30, mid: 50, late: 20 } },
  'Spinach / Palak': { ini: 0.70, mid: 1.00, end: 0.95, lengthDays: { ini: 20, dev: 20, mid: 15, late: 5 } },
  'Brinjal / Eggplant': { ini: 0.60, mid: 1.05, end: 0.90, lengthDays: { ini: 30, dev: 40, mid: 40, late: 20 } },
  // Fruits
  'Mango':        { ini: 1.00, mid: 1.00, end: 1.00, lengthDays: { ini: 60, dev: 90, mid: 120, late: 90 } },
  'Banana':       { ini: 0.50, mid: 1.10, end: 1.00, lengthDays: { ini: 120, dev: 60, mid: 180, late: 5 } },
  'Grapes / Vineyard': { ini: 0.30, mid: 0.85, end: 0.45, lengthDays: { ini: 20, dev: 40, mid: 120, late: 60 } },
  'Citrus (Lemon/Orange)': { ini: 0.70, mid: 0.65, end: 0.70, lengthDays: { ini: 60, dev: 90, mid: 120, late: 95 } },
  'Watermelon':   { ini: 0.40, mid: 1.00, end: 0.75, lengthDays: { ini: 20, dev: 30, mid: 30, late: 30 } },
  // Commercial
  'Sugarcane':    { ini: 0.40, mid: 1.25, end: 0.75, lengthDays: { ini: 35, dev: 60, mid: 190, late: 120 } },
  'Cotton':       { ini: 0.35, mid: 1.20, end: 0.35, lengthDays: { ini: 30, dev: 50, mid: 55, late: 45 } },
  'Sunflower':    { ini: 0.35, mid: 1.10, end: 0.35, lengthDays: { ini: 25, dev: 35, mid: 45, late: 25 } },
  'Groundnut / Peanut': { ini: 0.40, mid: 1.15, end: 0.60, lengthDays: { ini: 25, dev: 35, mid: 45, late: 25 } },
  'Mustard / Canola':   { ini: 0.35, mid: 1.10, end: 0.35, lengthDays: { ini: 20, dev: 30, mid: 50, late: 30 } },
}

// ----- Soil Properties Database -----
const SOIL_PROPERTIES = {
  'Clay Soil':        { fc: 0.38, wp: 0.22, taw_mm_per_m: 160, infiltration: 2 },
  'Sandy Soil':       { fc: 0.17, wp: 0.06, taw_mm_per_m: 110, infiltration: 50 },
  'Loamy Soil':       { fc: 0.31, wp: 0.14, taw_mm_per_m: 170, infiltration: 25 },
  'Silty Soil':       { fc: 0.36, wp: 0.18, taw_mm_per_m: 180, infiltration: 10 },
  'Peaty Soil':       { fc: 0.55, wp: 0.35, taw_mm_per_m: 200, infiltration: 5 },
  'Black Soil (Regur)': { fc: 0.40, wp: 0.25, taw_mm_per_m: 150, infiltration: 1 },
  'Alluvial Soil':    { fc: 0.35, wp: 0.16, taw_mm_per_m: 185, infiltration: 20 },
  'Red Laterite Soil':{ fc: 0.20, wp: 0.08, taw_mm_per_m: 120, infiltration: 40 },
  'Chalky Soil':      { fc: 0.18, wp: 0.08, taw_mm_per_m: 100, infiltration: 45 },
}

// Root depth by crop (metres)
const ROOT_DEPTH = {
  'Wheat': 1.5, 'Rice / Paddy': 0.5, 'Maize / Corn': 1.0, 'Barley': 1.5,
  'Sorghum / Jowar': 1.0, 'Millet / Bajra': 1.0, 'Sugarcane': 1.5,
  'Cotton': 1.0, 'Sunflower': 1.0, 'Groundnut / Peanut': 0.6,
  'Tomato': 0.7, 'Potato': 0.6, 'Onion': 0.5, 'Cucumber': 0.7,
  'Mango': 1.5, 'Banana': 0.9, 'Grapes / Vineyard': 1.5,
  default: 0.8,
}

// ---- Depletion Fraction (p) — threshold before stress ----
const DEPLETION_FRACTION = {
  'very-high': 0.30, 'high': 0.40, 'medium': 0.50, 'low': 0.60
}

/**
 * FAO-56 Penman-Monteith simplified ET₀ estimator
 * Uses temperature and humidity inputs (full formula needs solar radiation)
 */
function estimateET0(tempMax, tempMin, humidity, windSpeed, et0FromAPI) {
  if (et0FromAPI && et0FromAPI > 0) return et0FromAPI
  const T = (tempMax + tempMin) / 2
  const es = 0.6108 * Math.exp((17.27 * T) / (T + 237.3))
  const ea = (humidity / 100) * es
  const deltaVPD = es - ea
  const u2 = windSpeed * (4.87 / Math.log(67.8 * 10 - 5.42))
  const et0 = 0.0023 * (T + 17.8) * Math.sqrt(tempMax - tempMin) * (0.75 * 2.5) + 0.35 * deltaVPD + 0.1 * u2
  return Math.max(1, Math.min(12, et0))
}

/**
 * Get crop coefficient (Kc) based on growth stage
 */
function getCropKc(cropName, growthStage) {
  const kc = KC_DATABASE[cropName]
  if (!kc) return 0.85
  const stageMap = {
    'Germination': kc.ini, 'Seedling': kc.ini,
    'Vegetative': (kc.ini + kc.mid) / 2,
    'Flowering': kc.mid, 'Fruiting': kc.mid,
    'Maturity': (kc.mid + kc.end) / 2, 'Harvest': kc.end
  }
  return stageMap[growthStage] || kc.mid
}

/**
 * Soil Water Balance — Root Zone Depletion
 */
function soilWaterBalance(soilType, cropName, soilMoisturePct) {
  const soil = SOIL_PROPERTIES[soilType] || SOIL_PROPERTIES['Loamy Soil']
  const rootDepth = ROOT_DEPTH[cropName] || ROOT_DEPTH.default
  // Total Available Water in root zone (mm)
  const TAW = soil.taw_mm_per_m * rootDepth
  // Current depletion
  const currentMoistureFraction = soilMoisturePct / 100
  const depletionMM = (soil.fc - currentMoistureFraction) * rootDepth * 1000
  return { TAW, depletionMM: Math.max(0, depletionMM), soil, rootDepth }
}

/**
 * Main Irrigation Recommendation Engine
 */
export function computeIrrigationRecommendation({ crop, soilData, weather, fieldArea, location }) {
  const cropName = crop.name
  const kc = getCropKc(cropName, soilData.growthStage || 'Vegetative')
  const { TAW, depletionMM, soil } = soilWaterBalance(soilData.soilType, cropName, soilData.moisture)

  // ET₀ from weather data (7-day forecast)
  const nextWeek = weather.daily?.slice(0, 7) || []
  const et0Values = nextWeek.map((d, i) =>
    estimateET0(d.tempMax, d.tempMin, weather.current.humidity, weather.current.windSpeed, d.evapotranspiration)
  )
  const avgET0 = et0Values.reduce((s, v) => s + v, 0) / (et0Values.length || 1)

  // Crop ET (ETc = kc × ET₀)
  const etcPerDay = kc * avgET0
  const etcPerWeek = etcPerDay * 7

  // Rainfall expected (next 3 days)
  const rain3days = nextWeek.slice(0, 3).reduce((s, d) => s + (d.rainSum || 0), 0)
  const rain7days = nextWeek.reduce((s, d) => s + (d.rainSum || 0), 0)
  const effectiveRain = rain7days * 0.75 // 75% effectiveness

  // Net irrigation requirement (NIR)
  const nirWeekMM = Math.max(0, etcPerWeek - effectiveRain)
  const nirLitersPerHa = nirWeekMM * 10000 // 1mm/ha = 10,000 litres
  const totalNIRLiters = nirLitersPerHa * fieldArea
  const totalNIR = totalNIRLiters * 0.264172 // Convert to gallons

  // Depletion-based trigger
  const p = DEPLETION_FRACTION[crop.waterNeed || 'medium']
  const RAW = TAW * p // Readily Available Water
  const stressThreshold = RAW
  const needsWaterNow = depletionMM >= stressThreshold || soilData.moisture < 30

  // Urgency
  let urgency = 'low'
  if (soilData.moisture < 25) urgency = 'critical'
  else if (soilData.moisture < 40 || depletionMM > RAW) urgency = 'high'
  else if (soilData.moisture < 55) urgency = 'medium'

  // Rain inhibitor
  const rainExpected = rain3days > 8
  const adjustedUrgency = rainExpected && urgency !== 'critical' ? 'low' : urgency

  // Best time to irrigate (evaporation minimized)
  const bestTime = weather.current.temperature > 30 ? '5:30 AM' : '6:00 AM'

  // Schedule generation
  const schedule = generateSchedule({ needsWaterNow, rainExpected, totalNIR, nextWeek, bestTime })

  // Efficiency score (based on soil health, timing optimization)
  const phPenalty = soilData.ph < 5.5 || soilData.ph > 8 ? 10 : 0
  const nPenalty = soilData.nitrogen < 20 ? 5 : 0
  const efficiencyScore = Math.min(98, Math.round(72 + (RAW - depletionMM) / TAW * 20 - phPenalty - nPenalty))

  // Water saved vs traditional flood irrigation (30-40% savings with smart scheduling)
  const traditionalUse = totalNIR * 1.38
  const waterSaved = Math.round(traditionalUse - totalNIR)

  return {
    // Core recommendation
    urgency: adjustedUrgency,
    urgencyReason: urgency === 'critical' ? `Critical: Soil moisture ${soilData.moisture}% is below wilting threshold`
      : urgency === 'high' ? `Root zone depletion (${depletionMM.toFixed(0)}mm) exceeds threshold (${stressThreshold.toFixed(0)}mm)`
      : rainExpected ? `Rain forecast (${rain3days.toFixed(0)}mm in 72hrs) — hold irrigation`
      : `Soil moisture ${soilData.moisture}% adequate for current stage`,

    shouldIrrigateNow: needsWaterNow && !rainExpected,
    nextIrrigationTime: rainExpected ? `Hold — ${rain3days.toFixed(0)}mm rain expected in 72hrs` : `${schedule[0]?.day || 'Tomorrow'}, ${bestTime}`,
    waterAmountGallons: Math.round(totalNIR),
    durationMinutes: Math.round((totalNIRLiters / (soil.infiltration * 60)) / fieldArea),
    schedule,
    efficiencyScore,
    waterSaved: `${Math.round((waterSaved / traditionalUse) * 100)}% vs flood irrigation (${waterSaved.toLocaleString()} Gal saved)`,
    waterAmountLiters: totalNIRLiters, // Keep original for backward compatibility

    // Scientific analysis
    soilAnalysis: buildSoilAnalysis(soilData, depletionMM, TAW, RAW),
    weatherImpact: buildWeatherImpact(weather, et0Values, etcPerDay, kc, rain7days),
    cropSpecificAdvice: buildCropAdvice(cropName, kc, soilData.growthStage),
    waterAmountGallonsOverride: Math.round(totalNIR), // Ensure gallons display

    // Metrics
    kc: kc.toFixed(2),
    et0: avgET0.toFixed(2),
    etcPerDay: etcPerDay.toFixed(2),
    nirWeekMM: nirWeekMM.toFixed(1),
    rootZoneTAW: TAW.toFixed(0),
    rootZoneDepletion: depletionMM.toFixed(0),
    waterAmountLitersTech: totalNIRLiters, // Technical field kept for calculations

    // Alerts
    alerts: buildAlerts(soilData, adjustedUrgency, rainExpected, rain3days),
    method: recommendIrrigationMethod(soil, cropName, fieldArea),
    bestTimeToIrrigate: `Early morning ${bestTime} — minimises evaporation losses`,
    weeklyPlan: `Apply ${nirWeekMM.toFixed(0)}mm net (${Math.round(totalNIR).toLocaleString()} Gal) across ${schedule.length} sessions. ET₀=${avgET0.toFixed(1)}mm/day, ETc=${etcPerDay.toFixed(1)}mm/day`,
    fertigation: buildFertigationAdvice(soilData),
  }
}

function generateSchedule({ needsWaterNow, rainExpected, totalNIR, nextWeek, bestTime }) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const schedule = []
  const today = new Date()

  for (let i = 0; i < 7 && schedule.length < 3; i++) {
    const d = nextWeek[i]
    const rainDay = d?.rainSum > 5
    if (rainDay && schedule.length > 0) continue
    const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : days[(today.getDay() + i) % 7]
    const sessionGallons = totalNIR / (rainExpected ? 2 : 3)
    // Rain offset: 1mm per ha = 10,000 liters = 2641.72 gallons
    const adjustedGallons = Math.max(0, sessionGallons - (d?.rainSum || 0) * 2641.72 * 0.75)
    if (adjustedGallons < 13.2) continue // ~50 liters in gallons
    schedule.push({
      day: dayName,
      date: new Date(today.getTime() + i * 86400000).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      time: bestTime,
      gallons: Math.round(adjustedGallons),
      liters: Math.round(adjustedGallons / 0.264172), // Keep for compatibility
      rainForecast: d?.rainSum?.toFixed(0) || 0,
      reason: i === 0 && needsWaterNow ? 'Immediate — critical soil depletion' : rainDay ? 'Light top-up — rain expected' : 'Scheduled maintenance irrigation',
    })
  }

  if (schedule.length === 0) {
    const dayName = needsWaterNow ? 'Today' : 'Tomorrow'
    schedule.push({ day: dayName, time: bestTime, gallons: Math.round(totalNIR), liters: Math.round(totalNIR / 0.264172), rainForecast: 0, reason: 'Primary irrigation session' })
  }

  return schedule
}

function buildSoilAnalysis(soilData, depletion, TAW, RAW) {
  const depletionPct = ((depletion / TAW) * 100).toFixed(0)
  const phStatus = soilData.ph >= 6 && soilData.ph <= 7.5 ? 'optimal (6.0–7.5)' : soilData.ph < 6 ? 'acidic — consider liming' : 'alkaline — consider gypsum'
  const nStatus = soilData.nitrogen > 40 ? 'adequate' : soilData.nitrogen > 20 ? 'moderate' : 'deficient'
  return `Root zone depletion at ${depletionPct}% of TAW (${TAW.toFixed(0)}mm). Stress threshold at ${RAW.toFixed(0)}mm. Soil pH ${soilData.ph} is ${phStatus}. Nitrogen is ${nStatus} at ${soilData.nitrogen}ppm — ${soilData.nitrogen < 30 ? 'fertigation with urea recommended' : 'no N supplement needed'}.`
}

function buildWeatherImpact(weather, et0Values, etcPerDay, kc, rain7days) {
  const maxET0 = Math.max(...et0Values).toFixed(1)
  const minET0 = Math.min(...et0Values).toFixed(1)
  return `ET₀ ranges ${minET0}–${maxET0}mm/day this week. With Kc=${kc.toFixed(2)}, crop water demand (ETc) is ${etcPerDay.toFixed(1)}mm/day. Forecast rain (${rain7days.toFixed(0)}mm total, ~75% effective) offsets ${(rain7days * 0.75).toFixed(0)}mm of demand. Temperature ${weather.current.temperature}°C and ${weather.current.humidity}% humidity ${weather.current.humidity > 70 ? 'reduces' : 'increases'} atmospheric demand.`
}

function buildCropAdvice(cropName, kc, growthStage) {
  const stageTips = {
    'Flowering': 'Critical stage — never let moisture drop below 50%. Deficit now will reduce yield by 30–50%.',
    'Fruiting': 'Consistent moisture prevents blossom end rot and cracking. Drip irrigation recommended.',
    'Maturity': 'Reduce irrigation by 20% — excess water causes leaching and delayed harvest.',
    'Germination': 'Keep top 10cm consistently moist but not waterlogged. Light frequent irrigations.',
    'Vegetative': 'Moderate water stress can improve root development. Irrigate at 60–70% TAW.',
  }
  const tip = stageTips[growthStage] || 'Maintain consistent moisture for best yields.'
  return `${cropName} at ${growthStage} stage (Kc=${kc.toFixed(2)}). ${tip} Irrigate early morning to reduce evapotranspiration losses by 20–30%.`
}

function buildAlerts(soilData, urgency, rainExpected, rain3days) {
  const alerts = []
  if (soilData.moisture < 25) alerts.push('🔴 CRITICAL: Near permanent wilting point — irrigate immediately')
  if (soilData.ph < 5.5) alerts.push('⚠️ Soil pH very acidic — nutrient uptake severely limited')
  if (soilData.ph > 8.0) alerts.push('⚠️ Soil pH alkaline — iron/zinc deficiency likely')
  if (soilData.nitrogen < 20) alerts.push('⚠️ Low nitrogen — consider fertigation in next session')
  if (rainExpected) alerts.push(`🌧️ Rain alert: ${rain3days.toFixed(0)}mm expected in 72hrs — skip or reduce irrigation`)
  if (urgency === 'low' && soilData.moisture > 80) alerts.push('💧 Overwatering risk — check drainage')
  if (alerts.length === 0) alerts.push('✅ All parameters within optimal range')
  return alerts
}

function recommendIrrigationMethod(soil, cropName, area) {
  if (soil.infiltration < 5) return 'Surface drip or raised-bed furrow — slow infiltration soil requires controlled application'
  if (area > 5) return 'Centre-pivot sprinkler or micro-sprinkler for large area coverage'
  if (['Tomato', 'Pepper', 'Grapes / Vineyard', 'Strawberry'].some(c => cropName.includes(c.split(' ')[0])))
    return 'Sub-surface drip irrigation — maximises efficiency and prevents foliar disease'
  if (cropName.includes('Rice')) return 'Flood/ponded irrigation — maintain 5–10cm water depth'
  return 'Drip irrigation — 35–50% more efficient than sprinkler/flood'
}

function buildFertigationAdvice(soilData) {
  const parts = []
  if (soilData.nitrogen < 30) parts.push('N: 5–10kg/ha urea injected at next irrigation')
  if (soilData.phosphorus < 20) parts.push('P: DAP 3kg/ha at next session')
  if (soilData.potassium < 25) parts.push('K: MOP 4kg/ha for fruit quality')
  return parts.length > 0 ? `Fertigation recommended: ${parts.join('; ')}` : 'Nutrient levels adequate — no fertigation needed this week'
}

/**
 * Generate 7-day irrigation schedule with daily ET balance
 */
export function generateWeeklyPlan({ crop, soilData, weather, fieldArea }) {
  const kc = getCropKc(crop.name, soilData.growthStage || 'Vegetative')
  const { fc } = SOIL_PROPERTIES[soilData.soilType] || SOIL_PROPERTIES['Loamy Soil']
  const today = new Date()

  let accumulatedDepletionMM = 0

  return weather.daily?.slice(0, 7).map((d, i) => {
    const et0 = estimateET0(d.tempMax, d.tempMin, weather.current.humidity, weather.current.windSpeed, d.evapotranspiration)
    const etc = kc * et0
    const rain = d.rainSum || 0
    const netDailyLoss = Math.max(0, etc - rain * 0.75)
    
    accumulatedDepletionMM += netDailyLoss
    
    let irrigate = false
    let litersToApply = 0
    
    // Group irrigations into 2-3 sessions per week by allowing soil depletion to build up
    // Trigger if depleted > 15mm, or force a top-up mid-week/end-week if it's building up
    if (accumulatedDepletionMM > 15 || (i === 3 && accumulatedDepletionMM > 8) || (i === 6 && accumulatedDepletionMM > 5)) {
      if (rain < 8) {
        irrigate = true
        litersToApply = accumulatedDepletionMM * 10000 * fieldArea
        accumulatedDepletionMM = 0 // Reset pool because we irrigated
      }
    }

    return {
      date: new Date(today.getTime() + i * 86400000).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }),
      et0: et0.toFixed(1),
      etc: etc.toFixed(1),
      rain: rain.toFixed(0),
      netIrrigation: netDailyLoss.toFixed(1),
      liters: Math.round(litersToApply),
      irrigate: irrigate,
      tempMax: d.tempMax?.toFixed(0),
      tempMin: d.tempMin?.toFixed(0),
    }
  }) || []
}
