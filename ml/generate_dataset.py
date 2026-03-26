"""
Generate synthetic irrigation training dataset based on FAO-56 agronomic research.
Produces 12,000 labelled samples representing real-world soil/crop/weather conditions.
"""

import numpy as np
import pandas as pd
import random

random.seed(42)
np.random.seed(42)

# Crop profiles (from FAO-56 Kc database)
CROPS = [
    {"name": "Wheat",           "kc_mid": 1.15, "water_need": 2, "optimal_moisture": 60},
    {"name": "Rice",            "kc_mid": 1.20, "water_need": 4, "optimal_moisture": 85},
    {"name": "Maize",           "kc_mid": 1.20, "water_need": 2, "optimal_moisture": 65},
    {"name": "Cotton",          "kc_mid": 1.20, "water_need": 2, "optimal_moisture": 65},
    {"name": "Sugarcane",       "kc_mid": 1.25, "water_need": 4, "optimal_moisture": 80},
    {"name": "Tomato",          "kc_mid": 1.15, "water_need": 3, "optimal_moisture": 70},
    {"name": "Potato",          "kc_mid": 1.15, "water_need": 3, "optimal_moisture": 70},
    {"name": "Soybean",         "kc_mid": 1.15, "water_need": 2, "optimal_moisture": 65},
    {"name": "Chickpea",        "kc_mid": 1.00, "water_need": 1, "optimal_moisture": 50},
    {"name": "Millet",          "kc_mid": 1.00, "water_need": 1, "optimal_moisture": 45},
    {"name": "Sunflower",       "kc_mid": 1.10, "water_need": 2, "optimal_moisture": 60},
    {"name": "Groundnut",       "kc_mid": 1.15, "water_need": 2, "optimal_moisture": 60},
    {"name": "Mustard",         "kc_mid": 1.10, "water_need": 1, "optimal_moisture": 55},
    {"name": "Onion",           "kc_mid": 1.00, "water_need": 2, "optimal_moisture": 65},
    {"name": "Mango",           "kc_mid": 1.00, "water_need": 2, "optimal_moisture": 60},
    {"name": "Banana",          "kc_mid": 1.10, "water_need": 3, "optimal_moisture": 75},
    {"name": "Grapes",          "kc_mid": 0.85, "water_need": 2, "optimal_moisture": 60},
    {"name": "Cucumber",        "kc_mid": 1.00, "water_need": 3, "optimal_moisture": 75},
    {"name": "Coffee",          "kc_mid": 1.05, "water_need": 3, "optimal_moisture": 70},
    {"name": "Tea",             "kc_mid": 1.05, "water_need": 3, "optimal_moisture": 75},
    {"name": "Barley",          "kc_mid": 1.15, "water_need": 1, "optimal_moisture": 55},
    {"name": "Sorghum",         "kc_mid": 1.00, "water_need": 1, "optimal_moisture": 50},
    {"name": "Lentil",          "kc_mid": 1.10, "water_need": 1, "optimal_moisture": 55},
    {"name": "Turmeric",        "kc_mid": 1.05, "water_need": 3, "optimal_moisture": 70},
    {"name": "Ginger",          "kc_mid": 1.05, "water_need": 3, "optimal_moisture": 70},
]

SOIL_TYPES = {
    "Clay":     {"fc": 0.38, "wp": 0.22, "taw": 160, "infiltration": 2},
    "Sandy":    {"fc": 0.17, "wp": 0.06, "taw": 110, "infiltration": 50},
    "Loamy":    {"fc": 0.31, "wp": 0.14, "taw": 170, "infiltration": 25},
    "Silty":    {"fc": 0.36, "wp": 0.18, "taw": 180, "infiltration": 10},
    "Black":    {"fc": 0.40, "wp": 0.25, "taw": 150, "infiltration": 1},
    "Alluvial": {"fc": 0.35, "wp": 0.16, "taw": 185, "infiltration": 20},
    "Red":      {"fc": 0.20, "wp": 0.08, "taw": 120, "infiltration": 40},
}

STAGES = ["Germination", "Seedling", "Vegetative", "Flowering", "Fruiting", "Maturity"]
STAGE_KC_MULT = {"Germination": 0.40, "Seedling": 0.60, "Vegetative": 0.85, "Flowering": 1.00, "Fruiting": 1.00, "Maturity": 0.75}

def compute_et0(temp_max, temp_min, humidity, wind_speed):
    """Simplified Hargreaves-Samani ET0 estimation."""
    T = (temp_max + temp_min) / 2
    TD = max(0, temp_max - temp_min)
    Ra = 10 + 0.3 * T  # simplified extraterrestrial radiation approx
    et0 = 0.0023 * (T + 17.8) * (TD ** 0.5) * Ra * 0.408
    # Humidity correction
    vpd = (1 - humidity / 100) * (0.6108 * np.exp(17.27 * T / (T + 237.3)))
    et0 = et0 * (0.9 + 0.1 * vpd) + 0.1 * wind_speed / 10
    return max(1.5, min(12.0, et0))

def generate_sample():
    crop = random.choice(CROPS)
    soil_name = random.choice(list(SOIL_TYPES.keys()))
    soil = SOIL_TYPES[soil_name]
    stage = random.choice(STAGES)
    kc = crop["kc_mid"] * STAGE_KC_MULT[stage]

    # Soil conditions
    soil_moisture = np.random.uniform(15, 95)
    soil_ph = np.random.uniform(4.5, 9.0)
    soil_temp = np.random.uniform(15, 40)
    nitrogen = np.random.uniform(5, 120)
    phosphorus = np.random.uniform(5, 80)
    potassium = np.random.uniform(5, 90)
    area_ha = np.random.uniform(0.1, 20)

    # Weather
    temp_max = np.random.uniform(18, 48)
    temp_min = temp_max - np.random.uniform(5, 18)
    humidity = np.random.uniform(20, 95)
    wind_speed = np.random.uniform(0, 25)
    rain_3day = np.random.exponential(3)   # usually low, occasionally high
    et0 = compute_et0(temp_max, temp_min, humidity, wind_speed)
    etc = kc * et0  # crop evapotranspiration (mm/day)

    # Root zone depletion
    root_depth = 0.8 + crop["water_need"] * 0.1
    TAW = soil["taw"] * root_depth
    current_frac = soil_moisture / 100
    depletion_mm = max(0, (soil["fc"] - current_frac) * root_depth * 1000)
    p_threshold = 0.5 - crop["water_need"] * 0.05
    RAW = TAW * p_threshold
    moisture_deficit = crop["optimal_moisture"] - soil_moisture

    # --- Target 1: should irrigate (binary) ---
    rain_inhibit = rain_3day > 8
    should_irrigate = int(
        (depletion_mm >= RAW or soil_moisture < 30) and not rain_inhibit
    )

    # --- Target 2: urgency (0=low, 1=medium, 2=high, 3=critical) ---
    if soil_moisture < 22:
        urgency = 3
    elif soil_moisture < 35 or depletion_mm > RAW:
        urgency = 2
    elif soil_moisture < 55 and not rain_inhibit:
        urgency = 1
    else:
        urgency = 0
    if rain_inhibit and urgency < 3:
        urgency = 0

    # --- Target 3: water amount (litres) ---
    nir_week_mm = max(0, etc * 7 - rain_3day * 0.75 * 2)
    water_litres = nir_week_mm * 10000 * area_ha
    # Add noise
    water_litres *= np.random.uniform(0.9, 1.1)
    water_litres = max(0, water_litres)

    # --- Target 4: efficiency score (50-98) ---
    eff = 75 + (RAW - depletion_mm) / TAW * 20
    eff -= max(0, (soil_ph - 7.5) * 3)
    eff -= max(0, (6.0 - soil_ph) * 3)
    eff -= max(0, 25 - nitrogen) * 0.15
    eff = max(50, min(98, eff + np.random.normal(0, 3)))

    return {
        # Features
        "soil_moisture": round(soil_moisture, 2),
        "soil_ph": round(soil_ph, 2),
        "soil_temperature": round(soil_temp, 2),
        "nitrogen": round(nitrogen, 2),
        "phosphorus": round(phosphorus, 2),
        "potassium": round(potassium, 2),
        "area_ha": round(area_ha, 3),
        "kc": round(kc, 3),
        "et0": round(et0, 3),
        "etc_per_day": round(etc, 3),
        "rain_3day": round(rain_3day, 2),
        "temp_max": round(temp_max, 2),
        "temp_min": round(temp_min, 2),
        "humidity": round(humidity, 2),
        "wind_speed": round(wind_speed, 2),
        "depletion_mm": round(depletion_mm, 2),
        "TAW": round(TAW, 2),
        "RAW": round(RAW, 2),
        "root_depth": round(root_depth, 2),
        "water_need_level": crop["water_need"],
        "optimal_moisture": crop["optimal_moisture"],
        "soil_infiltration": soil["infiltration"],
        "growth_stage_enc": STAGES.index(stage),
        # Targets
        "should_irrigate": should_irrigate,
        "urgency": urgency,
        "water_litres": round(water_litres, 2),
        "efficiency_score": round(eff, 2),
    }

if __name__ == "__main__":
    print("Generating 12,000 training samples...")
    records = [generate_sample() for _ in range(12000)]
    df = pd.DataFrame(records)
    df.to_csv("dataset.csv", index=False)
    print(f"Dataset generated: {len(df)} rows, {len(df.columns)} columns")
    print("\nTarget distributions:")
    print(f"  should_irrigate: {df['should_irrigate'].value_counts().to_dict()}")
    print(f"  urgency: {df['urgency'].value_counts().sort_index().to_dict()}")
    print(f"  water_litres mean: {df['water_litres'].mean():.0f}L")
    print(f"  efficiency mean: {df['efficiency_score'].mean():.1f}%")
