import { NextResponse } from 'next/server';

// Indian Market-Based Yield & Price Prediction Engine
// MSP (Minimum Support Price) 2024-2025 based on Indian Government rates
// All prices in ₹ (Indian Rupees) per kg
// Reference: https://cacp.dacnet.nic.in/

const CROP_DATABASE = {
  'Rice': {
    base_yield: 5500,                     // kg per hectare (average Indian yield)
    moisture_optimal: 70,
    temp_optimal: 28,
    ph_optimal: 6.8,
    npk_ratio: [120, 60, 60],
    msp_price_per_kg: 105,                // ₹ per kg (₹2100 per 20kg quintal - MSP 2024-25)
    market_price_per_kg: 95,              // Current market rate in ₹/kg
    seasonal_multiplier: { kharif: 0.95, rabi: 1.0, summer: 0.85 },
    production_cost: 32000,                // ₹ per hectare
    cost_per_kg_produced: 5.8,            // ₹ per kg harvested
  },
  'Wheat': {
    base_yield: 5000,
    moisture_optimal: 65,
    temp_optimal: 20,
    ph_optimal: 7.0,
    npk_ratio: [100, 50, 50],
    msp_price_per_kg: 120.5,              // ₹ per kg (₹2410 per 20kg quintal)
    market_price_per_kg: 115,             // ₹ per kg
    seasonal_multiplier: { kharif: 0.85, rabi: 1.0, summer: 0.80 },
    production_cost: 28000,                // ₹ per hectare
    cost_per_kg_produced: 5.6,
  },
  'Corn': {
    base_yield: 8500,
    moisture_optimal: 60,
    temp_optimal: 25,
    ph_optimal: 6.5,
    npk_ratio: [150, 60, 60],
    msp_price_per_kg: 53.5,               // ₹ per kg (~₹1070 per 20kg)
    market_price_per_kg: 48,              // ₹ per kg
    seasonal_multiplier: { kharif: 1.0, rabi: 0.85, summer: 0.90 },
    production_cost: 32000,
    cost_per_kg_produced: 3.8,
  },
  'Potato': {
    base_yield: 22000,
    moisture_optimal: 75,
    temp_optimal: 18,
    ph_optimal: 6.0,
    npk_ratio: [100, 100, 150],
    msp_price_per_kg: 22,                 // ₹ per kg (~₹440 per 20kg)
    market_price_per_kg: 18,              // ₹ per kg - highly volatile
    seasonal_multiplier: { kharif: 0.8, rabi: 1.0, summer: 0.70 },
    production_cost: 45000,
    cost_per_kg_produced: 2.0,
  },
  'Tomato': {
    base_yield: 70000,
    moisture_optimal: 65,
    temp_optimal: 22,
    ph_optimal: 6.5,
    npk_ratio: [100, 80, 120],
    msp_price_per_kg: 8.5,                // ₹ per kg (non-MSP crop, reference only)
    market_price_per_kg: 12,              // ₹ per kg - highly volatile (₹8-20)
    seasonal_multiplier: { kharif: 0.85, rabi: 1.1, summer: 0.70 },
    production_cost: 50000,
    cost_per_kg_produced: 0.7,
  },
  'Sugarcane': {
    base_yield: 65000,
    moisture_optimal: 75,
    temp_optimal: 28,
    ph_optimal: 6.8,
    npk_ratio: [200, 100, 100],
    msp_price_per_kg: 15.5,               // ₹ per kg (~₹310 per 20kg)
    market_price_per_kg: 15,              // ₹ per kg
    seasonal_multiplier: { kharif: 1.0, rabi: 0.95, summer: 0.90 },
    production_cost: 60000,
    cost_per_kg_produced: 0.9,
  },
};

function calculateYieldFactor(actual, optimal, min_val, max_val) {
  // Mathematical formula for factor calculation
  // Returns values between 0.5 and 1.0
  if (actual === null || actual === undefined) return 0.7;
  if (actual < min_val || actual > max_val) return 0.5;
  
  const distance = Math.abs(actual - optimal);
  const max_distance = Math.max(optimal - min_val, max_val - optimal);
  
  if (max_distance === 0) return 1.0;
  
  // Gaussian-like factor: higher near optimal, drops off on sides
  const normalizedDistance = distance / max_distance;
  const factor = Math.exp(-Math.pow(normalizedDistance * 2, 2));
  
  return Math.max(0.5, Math.min(1.0, factor));
}

function calculateYield(fieldData, weatherData, growthStageProgress) {
  const cropName = fieldData.crop_type || 'Rice';
  const crop = CROP_DATABASE[cropName] || CROP_DATABASE['Rice'];

  // Safely get field parameters with defaults
  const soilMoisture = fieldData.soil_moisture ?? 65;
  const soilPH = fieldData.soil_ph ?? 6.8;
  const temperature = weatherData?.avg_temp ?? 28;
  const rainfall = weatherData?.rainfall ?? 100;
  const nitrogen = fieldData.nitrogen ?? 80;
  const phosphorus = fieldData.phosphorus ?? 40;
  const potassium = fieldData.potassium ?? 40;
  const areHectares = fieldData.area_hectares ?? 1;
  const growthProgress = Math.max(10, Math.min(100, growthStageProgress ?? 50));

  // Calculate individual factors (0.5 to 1.0)
  const moistureFactor = calculateYieldFactor(soilMoisture, crop.moisture_optimal, 30, 85);
  const phFactor = calculateYieldFactor(soilPH, crop.ph_optimal, 5.5, 8.5);
  const tempFactor = calculateYieldFactor(temperature, crop.temp_optimal, 10, 35);
  const nutrientFactor = 
    (calculateYieldFactor(nitrogen, crop.npk_ratio[0], 30, 200) +
     calculateYieldFactor(phosphorus, crop.npk_ratio[1], 20, 100) +
     calculateYieldFactor(potassium, crop.npk_ratio[2], 20, 100)) / 3;
  
  // Water factor based on rainfall
  const waterRequirement = {
    'Rice': 1200,
    'Wheat': 500,
    'Corn': 600,
    'Potato': 500,
    'Tomato': 400,
    'Sugarcane': 1500,
  }[cropName] || 600;
  
  let waterFactor = rainfall / waterRequirement;
  if (waterFactor > 1.2) waterFactor = 1.2;
  if (waterFactor < 0.4) waterFactor = 0.4;

  // Growth stage factor (ramps up from 0.3 at 10% to 1.0 at 100%)
  const stageFactor = 0.3 + (growthProgress / 100) * 0.7;

  // Weighted combination of all factors
  const yieldMultiplier = 
    (moistureFactor * 0.25) +
    (phFactor * 0.15) +
    (tempFactor * 0.20) +
    (nutrientFactor * 0.25) +
    (waterFactor * 0.15);

  // Calculate yield in kg per hectare
  const yieldPerHectare = Math.round(crop.base_yield * yieldMultiplier * stageFactor);
  
  // Total yield for the field
  const totalYield = Math.round(yieldPerHectare * areHectares);

  return {
    crop_type: cropName,
    yield_per_hectare: Math.max(500, yieldPerHectare),  // Minimum 500 kg/ha
    total_yield: Math.max(500, totalYield),
    confidence: Math.min(95, Math.round(50 + growthProgress * 0.4)),
    factors: {
      moisture: Math.round(moistureFactor * 100),
      ph: Math.round(phFactor * 100),
      temperature: Math.round(tempFactor * 100),
      nutrients: Math.round(nutrientFactor * 100),
      water: Math.round(waterFactor * 100),
      growth_stage: Math.round(stageFactor * 100),
    },
  };
}

function forecastPrice(cropType, daysAhead, season = 'kharif') {
  const crop = CROP_DATABASE[cropType] || CROP_DATABASE['Rice'];
  const mspPrice = crop.msp_price_per_kg;
  const basePrice = crop.market_price_per_kg;

  // Seasonal adjustment
  const seasonalMultiplier = crop.seasonal_multiplier[season] || 1.0;
  const adjustedBasePrice = basePrice * seasonalMultiplier;

  const forecasts = [];
  let currentPrice = adjustedBasePrice;

  // Indian market volatility factors
  const volatilityFactor = cropType === 'Potato' || cropType === 'Tomato' ? 0.08 : 0.04;
  const cycleAmplitude = cropType === 'Rice' || cropType === 'Wheat' ? 0.06 : 0.10;

  for (let day = 1; day <= daysAhead; day++) {
    // Realistic price fluctuation based on crop type
    const dailyChange = (Math.random() - 0.5) * volatilityFactor;
    
    // Market cycle patterns (30-day cycle for harvest patterns)
    const cycleComponent = cycleAmplitude * Math.sin((2 * Math.PI * day) / 30);
    
    // Trend component (modest upward drift)
    const trendComponent = (day / daysAhead) * 0.02;

    currentPrice = adjustedBasePrice * (1 + dailyChange + cycleComponent + trendComponent);
    
    // Ensure price stays within reasonable bounds
    // Lower bound: 70% of MSP (prevent unrealistic lows)
    // Upper bound: 130% of MSP (prevent unrealistic highs)
    currentPrice = Math.max(mspPrice * 0.70, Math.min(mspPrice * 1.30, currentPrice));

    // Ensure minimum of market price * 0.8
    currentPrice = Math.max(basePrice * 0.80, currentPrice);

    forecasts.push({
      day,
      date: new Date(Date.now() + day * 86400000).toISOString().split('T')[0],
      price: Math.round(currentPrice * 100) / 100,
      trend: currentPrice > adjustedBasePrice ? 'upward' : 'downward',
      confidence: Math.max(40, Math.round(100 - day * 0.6)),
    });
  }

  const prices = forecasts.map((f) => f.price);
  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
  const variance = prices.reduce((a, p) => a + Math.pow(p - avgPrice, 2), 0) / prices.length;
  const stdDev = Math.sqrt(variance);

  // Calculate forecast trend (last 7 days vs first 7 days)
  const recentAvg = prices.slice(-7).reduce((a, b) => a + b) / 7;
  const earlierAvg = prices.slice(0, 7).reduce((a, b) => a + b) / 7;
  const forecastTrend = recentAvg > earlierAvg ? 'bullish' : 'bearish';

  return {
    crop_type: cropType,
    base_price_per_kg: Math.round(adjustedBasePrice * 100) / 100,
    msp_price_per_kg: Math.round(mspPrice * 100) / 100,
    forecast_period_days: daysAhead,
    forecasts: forecasts.slice(0, daysAhead),
    statistics: {
      current_price: Math.round(adjustedBasePrice * 100) / 100,
      avg_price_30days: Math.round(avgPrice * 100) / 100,
      min_price: Math.round(Math.min(...prices) * 100) / 100,
      max_price: Math.round(Math.max(...prices) * 100) / 100,
      std_dev: Math.round(stdDev * 100) / 100,
      forecast_trend: forecastTrend,
    },
  };
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { field, weather, growth_stage_progress = 50, forecast_days = 30 } = body;

    // Validate field data
    if (!field) {
      return NextResponse.json({ error: 'Field data is required' }, { status: 400 });
    }

    // Generate yield prediction
    const yieldPrediction = calculateYield(field, weather || {}, growth_stage_progress);

    // Generate price forecast
    const priceForecast = forecastPrice(field.crop_type || 'Rice', forecast_days);

    // Calculate financial projection
    const estimated_production_kg = yieldPrediction.total_yield;
    const avg_price_30days = priceForecast.statistics.avg_price_30days;

    const crop = CROP_DATABASE[field.crop_type] || CROP_DATABASE['Rice'];
    const areaHectares = field.area_hectares || 1;
    const productionCostPerHa = crop.production_cost;
    const costPerKgProduced = crop.cost_per_kg_produced;
    
    // More accurate cost calculation
    const totalProductionCost = (productionCostPerHa * areaHectares) + (costPerKgProduced * estimated_production_kg);
    
    // Break-even price calculation
    const breakEvenPrice = estimated_production_kg > 0 ? totalProductionCost / estimated_production_kg : crop.msp_price_per_kg;

    const optimisticRevenue = estimated_production_kg * priceForecast.statistics.max_price;
    const expectedRevenue = estimated_production_kg * avg_price_30days;
    const conservativeRevenue = estimated_production_kg * priceForecast.statistics.min_price;

    // Profitability analysis
    const isProfitable = expectedRevenue > totalProductionCost;
    const profitMargin = isProfitable ? ((expectedRevenue - totalProductionCost) / expectedRevenue * 100) : 0;

    return NextResponse.json({
      field: {
        name: field.name || 'Unknown Field',
        crop: field.crop_type || 'Rice',
        area: areaHectares,
      },
      yield_prediction: yieldPrediction,
      price_forecast: priceForecast,
      financial: {
        estimated_production_kg: Math.round(estimated_production_kg),
        production_cost_per_hectare: productionCostPerHa,
        variable_cost_per_kg: costPerKgProduced,
        total_production_cost: Math.round(totalProductionCost * 100) / 100,
        break_even_price_per_kg: Math.round(breakEvenPrice * 100) / 100,
        
        revenue: {
          optimistic: Math.round(optimisticRevenue * 100) / 100,
          expected: Math.round(expectedRevenue * 100) / 100,
          conservative: Math.round(conservativeRevenue * 100) / 100,
        },
        
        profit: {
          optimistic: Math.round((optimisticRevenue - totalProductionCost) * 100) / 100,
          expected: Math.round((expectedRevenue - totalProductionCost) * 100) / 100,
          conservative: Math.round((conservativeRevenue - totalProductionCost) * 100) / 100,
        },
        
        roi_percent: {
          optimistic: totalProductionCost > 0 ? Math.round(((optimisticRevenue - totalProductionCost) / totalProductionCost) * 100 * 100) / 100 : 0,
          expected: totalProductionCost > 0 ? Math.round(((expectedRevenue - totalProductionCost) / totalProductionCost) * 100 * 100) / 100 : 0,
          conservative: totalProductionCost > 0 ? Math.round(((conservativeRevenue - totalProductionCost) / totalProductionCost) * 100 * 100) / 100 : 0,
        },
        
        profitability_analysis: {
          is_profitable: isProfitable,
          profit_margin_percent: Math.round(profitMargin * 100) / 100,
          price_above_msp: Math.round((avg_price_30days - crop.msp_price_per_kg) * 100) / 100,
          msp_coverage_percent: Math.round((avg_price_30days / crop.msp_price_per_kg) * 100 * 100) / 100,
        },
      },
    });
  } catch (error) {
    console.error('Prediction error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate predictions' }, { status: 500 });
  }
}
