"""
Yield Prediction & Price Forecasting Models
Uses crop-specific data and weather patterns to predict yields and market prices
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
import pickle
from datetime import datetime, timedelta
import json

# Crop-specific yield models (kg/hectare)
# All price data in ₹ (Indian Rupees) per kg
# MSP Reference: https://cacp.dacnet.nic.in/
CROP_YIELD_FACTORS = {
    'Rice': {
        'base_yield': 5500,
        'moisture_optimal': 70,
        'temp_optimal': 28,
        'ph_optimal': 6.8,
        'npk_ratio': (120, 60, 60),
        'growing_days': 120,
        'water_requirement': 1200,  # mm
        'price_base': 95,  # ₹/kg - Current market price
        'msp_price': 105,  # ₹/kg - MSP 2024-25
        'price_volatility': 0.12
    },
    'Wheat': {
        'base_yield': 5000,
        'moisture_optimal': 65,
        'temp_optimal': 20,
        'ph_optimal': 7.0,
        'npk_ratio': (100, 50, 50),
        'growing_days': 150,
        'water_requirement': 500,
        'price_base': 115,  # ₹/kg
        'msp_price': 120.5,  # ₹/kg
        'price_volatility': 0.10
    },
    'Corn': {
        'base_yield': 8500,
        'moisture_optimal': 60,
        'temp_optimal': 25,
        'ph_optimal': 6.5,
        'npk_ratio': (150, 60, 60),
        'growing_days': 120,
        'water_requirement': 600,
        'price_base': 48,  # ₹/kg
        'msp_price': 53.5,  # ₹/kg
        'price_volatility': 0.15
    },
    'Potato': {
        'base_yield': 22000,
        'moisture_optimal': 75,
        'temp_optimal': 18,
        'ph_optimal': 6.0,
        'npk_ratio': (100, 100, 150),
        'growing_days': 90,
        'water_requirement': 400,
        'price_base': 18,  # ₹/kg - Highly volatile
        'msp_price': 22,  # ₹/kg
        'price_volatility': 0.30  # Higher volatility
    },
    'Tomato': {
        'base_yield': 70000,
        'moisture_optimal': 65,
        'temp_optimal': 22,
        'ph_optimal': 6.5,
        'npk_ratio': (100, 80, 120),
        'growing_days': 180,
        'water_requirement': 450,
        'price_base': 12,  # ₹/kg - Non-MSP, reference only
        'msp_price': 8.5,  # ₹/kg
        'price_volatility': 0.35  # Very volatile
    },
    'Cotton': {
        'base_yield': 2500,
        'moisture_optimal': 60,
        'temp_optimal': 26,
        'ph_optimal': 7.5,
        'npk_ratio': (100, 50, 50),
        'growing_days': 180,
        'water_requirement': 800,
        'price_base': 55,  # ₹/kg
        'msp_price': 65,  # ₹/kg (lint)
        'price_volatility': 0.18
    }
}

class YieldPredictor:
    """Predicts crop yield based on soil, weather, and farm data"""
    
    def __init__(self):
        self.model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.scaler = StandardScaler()
        self.is_trained = False
    
    def calculate_yield(self, field_data, weather_data, growth_stage_progress):
        """
        Calculate predicted yield using agronomic factors
        
        Args:
            field_data: {soil_moisture, soil_ph, soil_temp, nitrogen, phosphorus, potassium, area_hectares}
            weather_data: {rainfall, avg_temp, humidity, wind_speed}
            growth_stage_progress: 0-100 (percentage of growing season complete)
        """
        
        crop_type = field_data.get('crop_type', 'Rice')
        if crop_type not in CROP_YIELD_FACTORS:
            crop_type = 'Rice'
        
        params = CROP_YIELD_FACTORS[crop_type]
        
        # Calculate factor deviations
        moisture_factor = self._calculate_factor(
            field_data['soil_moisture'],
            params['moisture_optimal'],
            30, 85  # acceptable range
        )
        
        ph_factor = self._calculate_factor(
            field_data['soil_ph'],
            params['ph_optimal'],
            5.5, 8.5
        )
        
        temp_factor = self._calculate_factor(
            weather_data['avg_temp'],
            params['temp_optimal'],
            10, 35
        )
        
        # Nutrient factor (compound)
        n_factor = self._calculate_factor(field_data['nitrogen'], params['npk_ratio'][0], 30, 200)
        p_factor = self._calculate_factor(field_data['phosphorus'], params['npk_ratio'][1], 20, 100)
        k_factor = self._calculate_factor(field_data['potassium'], params['npk_ratio'][2], 20, 100)
        nutrient_factor = (n_factor + p_factor + k_factor) / 3
        
        # Water/rainfall factor
        water_factor = min(weather_data['rainfall'] / params['water_requirement'], 1.5)
        if water_factor < 0.5:
            water_factor *= 0.7  # penalty for drought
        
        # Growth stage adjustment (lower yield early season)
        stage_factor = 0.5 + (growth_stage_progress / 100) * 0.5
        
        # Combined yield prediction
        yield_kg_per_ha = params['base_yield'] * (
            moisture_factor * 0.25 +
            ph_factor * 0.15 +
            temp_factor * 0.20 +
            nutrient_factor * 0.25 +
            water_factor * 0.15
        ) * stage_factor
        
        total_yield = yield_kg_per_ha * field_data['area_hectares']
        
        return {
            'yield_per_hectare': round(yield_kg_per_ha, 2),
            'total_yield': round(total_yield, 2),
            'unit': 'kg',
            'confidence': round(min(95, 60 + growth_stage_progress), 1),
            'factors': {
                'moisture': round(moisture_factor * 100, 1),
                'ph': round(ph_factor * 100, 1),
                'temperature': round(temp_factor * 100, 1),
                'nutrients': round(nutrient_factor * 100, 1),
                'water': round(water_factor * 100, 1),
                'growth_stage': round(stage_factor * 100, 1)
            }
        }
    
    def _calculate_factor(self, actual, optimal, min_val, max_val):
        """Calculate performance factor (0-1.2) based on deviation from optimal"""
        if actual < min_val or actual > max_val:
            return 0.5
        
        distance = abs(actual - optimal)
        max_distance = max(optimal - min_val, max_val - optimal)
        
        if max_distance == 0:
            return 1.0
        
        factor = 1.0 - (distance / max_distance) * 0.4
        return max(0.5, factor)


class PriceForecaster:
    """Predicts market prices using trend analysis and seasonal patterns"""
    
    def __init__(self):
        self.model = GradientBoostingRegressor(n_estimators=50, random_state=42)
        self.scaler = StandardScaler()
    
    def forecast_price(self, crop_type, days_ahead=30, current_price=None, season='kharif'):
        """
        Forecast crop prices for next N days using Indian market dynamics
        
        Args:
            crop_type: Crop name
            days_ahead: Number of days to forecast (1-90)
            current_price: Current market price optional
            season: 'kharif', 'rabi', 'summer'
        """
        
        if crop_type not in CROP_YIELD_FACTORS:
            crop_type = 'Rice'
        
        params = CROP_YIELD_FACTORS[crop_type]
        base_price = current_price or params['price_base']
        msp_price = params['msp_price']
        volatility = params['price_volatility']
        
        # Seasonal adjustments (based on harvest cycles)
        seasonal_factors = {
            'kharif': 0.95,   # Post-harvest supply peaks
            'rabi': 1.10,     # Off-season scarcity
            'summer': 0.80    # Storage stock available
        }
        seasonal_factor = seasonal_factors.get(season, 1.0)
        adjusted_base = base_price * seasonal_factor
        
        forecasts = []
        for day in range(1, days_ahead + 1):
            # Simulate realistic price movement
            random_walk = np.random.normal(0, volatility * base_price * 0.5)
            
            # Market cycle (harvest patterns)
            cycle_amplitude = 0.08 if crop_type in ['Potato', 'Tomato'] else 0.05
            cycle = cycle_amplitude * np.sin(2 * np.pi * day / 30)
            
            # Trend component (seasonal pressure)
            trend = (day / days_ahead) * seasonal_factor * 0.02
            
            price = adjusted_base * (1 + cycle + trend) + random_walk
            
            # Keep prices within realistic bounds
            min_price = msp_price * 0.70  # 30% below MSP (govt support floor)
            max_price = msp_price * 1.30  # 30% above MSP (market ceiling)
            
            price = np.clip(price, min_price, max_price)
            price = max(base_price * 0.75, price)  # Never below 75% of base
            
            forecasts.append({
                'day': day,
                'date': (datetime.now() + timedelta(days=day)).strftime('%Y-%m-%d'),
                'price': round(price, 2),
                'trend': 'upward' if price > adjusted_base else 'downward',
                'confidence': round(max(40, 100 - (day * 0.6)), 1)
            })
        
        # Calculate statistics
        prices = [f['price'] for f in forecasts]
        avg_price = np.mean(prices)
        std_dev = np.std(prices)
        
        return {
            'crop': crop_type,
            'season': season,
            'current_price': round(adjusted_base, 2),
            'msp_price': round(msp_price, 2),
            'forecast_period_days': days_ahead,
            'forecasts': forecasts,
            'statistics': {
                'expected_price': round(avg_price, 2),
                'min_price': round(min(prices), 2),
                'max_price': round(max(prices), 2),
                'std_dev': round(std_dev, 2),
                'trend': 'bullish' if np.mean(prices[-7:]) > np.mean(prices[:7]) else 'bearish',
                'msp_coverage': round((avg_price / msp_price) * 100, 2)  # % above/below MSP
            }
        }
    
    def get_seasonal_outlook(self, crop_type):
        """Get seasonal price outlook and recommendations"""
        
        if crop_type not in CROP_YIELD_FACTORS:
            crop_type = 'Rice'
        
        params = CROP_YIELD_FACTORS[crop_type]
        base_price = params['price_base']
        
        return {
            'crop': crop_type,
            'current_season_price': round(base_price, 2),
            'seasonal_prices': {
                'kharif': round(base_price * 1.0, 2),
                'rabi': round(base_price * 1.15, 2),
                'summer': round(base_price * 0.85, 2)
            },
            'recommendations': [
                'Store produce if expecting price increase in next month',
                'Market immediately if prices are at seasonal peak',
                'Consider futures contracts for price stability'
            ] if base_price > 20 else [
                'Expect competitive prices during peak season',
                'Differentiation through quality can improve margins',
                'Volume sales recommended'
            ]
        }


def generate_prediction_report(field_data, weather_data, growth_stage=50):
    """Generate complete yield and price prediction report"""
    
    yield_predictor = YieldPredictor()
    price_forecaster = PriceForecaster()
    
    # Get yield prediction
    yield_pred = yield_predictor.calculate_yield(field_data, weather_data, growth_stage)
    
    # Get price forecast
    price_forecast = price_forecaster.forecast_price(
        field_data['crop_type'],
        days_ahead=30
    )
    
    # Get seasonal outlook
    seasonal = price_forecaster.get_seasonal_outlook(field_data['crop_type'])
    
    # Calculate potential revenue
    estimated_production = yield_pred['total_yield']
    avg_price = price_forecast['statistics']['expected_price']
    potential_revenue = estimated_production * avg_price
    
    return {
        'timestamp': datetime.now().isoformat(),
        'field': {
            'name': field_data.get('name', 'Field 1'),
            'crop': field_data['crop_type'],
            'area': field_data['area_hectares']
        },
        'yield_prediction': yield_pred,
        'price_forecast': price_forecast,
        'seasonal_outlook': seasonal,
        'financial_projection': {
            'estimated_production_kg': estimated_production,
            'expected_price_per_kg': avg_price,
            'potential_revenue': round(potential_revenue, 2),
            'revenue_range': {
                'low': round(estimated_production * price_forecast['statistics']['min_price'], 2),
                'high': round(estimated_production * price_forecast['statistics']['max_price'], 2)
            }
        }
    }
