import { supabase } from './supabase';

/**
 * Yield & Price Prediction Services
 * Manage predictions, historical data, and recommendations
 */

export async function savePrediction(fieldId, predictionData) {
  try {
    const { data, error } = await supabase.from('predictions').insert({
      field_id: fieldId,
      prediction_type: 'combined',
      yield_per_hectare: predictionData.yield_prediction.yield_per_hectare,
      total_yield: predictionData.yield_prediction.total_yield,
      yield_confidence: predictionData.yield_prediction.confidence,
      yield_factors: predictionData.yield_prediction.factors,
      current_price: predictionData.price_forecast.current_price,
      expected_price: predictionData.price_forecast.statistics.expected_price,
      min_price: predictionData.price_forecast.statistics.min_price,
      max_price: predictionData.price_forecast.statistics.max_price,
      price_trend: predictionData.price_forecast.statistics.trend,
      price_forecasts: predictionData.price_forecast.forecasts,
      estimated_production: predictionData.financial_projection.estimated_production_kg,
      potential_revenue: predictionData.financial_projection.potential_revenue,
      revenue_low: predictionData.financial_projection.revenue_range.low,
      revenue_high: predictionData.financial_projection.revenue_range.high,
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error saving prediction:', error);
    return { success: false, error: error.message };
  }
}

export async function getPredictionHistory(fieldId, limit = 10) {
  try {
    const { data, error } = await supabase
      .from('predictions')
      .select('*')
      .eq('field_id', fieldId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching predictions:', error);
    return { success: false, error: error.message };
  }
}

export async function getLatestPrediction(fieldId) {
  try {
    const { data, error } = await supabase
      .from('predictions')
      .select('*')
      .eq('field_id', fieldId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching latest prediction:', error);
    return { success: false, error: error.message };
  }
}

export async function createPriceRecommendation(fieldId, cropType, recommendedPrice, reason) {
  try {
    const { data, error } = await supabase.from('price_recommendations').insert({
      field_id: fieldId,
      crop_type: cropType,
      recommended_selling_price: recommendedPrice,
      recommendation_reason: reason,
      confidence_level: 85,
      suggested_action: 'hold',
      valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error creating recommendation:', error);
    return { success: false, error: error.message };
  }
}

export async function recordMarketPrice(cropType, price, location = null, season = 'kharif') {
  try {
    const { data, error } = await supabase.from('market_prices').insert({
      crop_type: cropType,
      price,
      market_location: location,
      season,
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error recording market price:', error);
    return { success: false, error: error.message };
  }
}

export async function getMarketPriceStats(cropType) {
  try {
    const { data, error } = await supabase
      .from('market_prices')
      .select('price')
      .eq('crop_type', cropType)
      .order('recorded_at', { ascending: false })
      .limit(30);

    if (error) throw error;

    if (!data || data.length === 0) {
      return { success: true, data: { avg: 0, min: 0, max: 0, trend: 'stable' } };
    }

    const prices = data.map((d) => d.price);
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const recent = prices.slice(0, 10).reduce((a, b) => a + b) / 10;
    const older = prices.slice(-10).reduce((a, b) => a + b) / 10;
    const trend = recent > older ? 'upward' : recent < older ? 'downward' : 'stable';

    return { success: true, data: { avg, min, max, trend, count: prices.length } };
  } catch (error) {
    console.error('Error fetching market stats:', error);
    return { success: false, error: error.message };
  }
}

export async function getYieldBenchmarks(cropType, region = null) {
  try {
    let query = supabase.from('yield_benchmarks').select('*').eq('crop_type', cropType);

    if (region) {
      query = query.eq('region', region);
    }

    const { data, error } = await query.order('year', { ascending: false }).limit(5);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching benchmarks:', error);
    return { success: false, error: error.message };
  }
}

export async function recordActualYield(predictionHistoryId, actualYield, notes = '') {
  try {
    // Calculate accuracy if we have the prediction
    const { data: predData, error: predError } = await supabase
      .from('prediction_history')
      .select('yield_prediction')
      .eq('id', predictionHistoryId)
      .single();

    if (predError) throw predError;

    let accuracy = 0;
    if (predData?.yield_prediction?.total_yield) {
      const predicted = predData.yield_prediction.total_yield;
      const actual = actualYield;
      accuracy = Math.round(((1 - Math.abs(predicted - actual) / Math.max(predicted, actual)) * 100));
    }

    const { data, error } = await supabase
      .from('prediction_history')
      .update({
        actual_yield: actualYield,
        accuracy_score: Math.max(0, accuracy),
        verified_at: new Date(),
        notes,
      })
      .eq('id', predictionHistoryId);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error recording actual yield:', error);
    return { success: false, error: error.message };
  }
}

export async function getAccuracyStats(userId) {
  try {
    const { data, error } = await supabase
      .from('yield_accuracy_stats')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching accuracy stats:', error);
    return { success: false, error: error.message };
  }
}
