"""
Train irrigation recommendation ML model.
Models trained:
  1. RandomForest classifier  → should_irrigate (binary)
  2. RandomForest classifier  → urgency level (0-3)
  3. RandomForest regressor   → water_litres needed
  4. RandomForest regressor   → efficiency_score

Run: python train_model.py
Output: models/irrigation_model.pkl
"""

import numpy as np
import pandas as pd
import joblib
import os
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor, GradientBoostingRegressor
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, mean_absolute_error, r2_score

# Run dataset generator if not found
if not os.path.exists("dataset.csv"):
    print("Dataset not found. Generating...")
    import generate_dataset  # runs the script

print("Loading dataset...")
df = pd.read_csv("dataset.csv")
print(f"Loaded {len(df)} samples")

FEATURES = [
    "soil_moisture", "soil_ph", "soil_temperature",
    "nitrogen", "phosphorus", "potassium",
    "area_ha", "kc", "et0", "etc_per_day",
    "rain_3day", "temp_max", "temp_min", "humidity", "wind_speed",
    "depletion_mm", "TAW", "RAW", "root_depth",
    "water_need_level", "optimal_moisture", "soil_infiltration", "growth_stage_enc"
]

X = df[FEATURES]
y_irrigate = df["should_irrigate"]
y_urgency  = df["urgency"]
y_water    = df["water_litres"]
y_eff      = df["efficiency_score"]

X_train, X_test, yi_tr, yi_te = train_test_split(X, y_irrigate, test_size=0.2, random_state=42)
_, _, yu_tr, yu_te = train_test_split(X, y_urgency, test_size=0.2, random_state=42)
_, _, yw_tr, yw_te = train_test_split(X, y_water,   test_size=0.2, random_state=42)
_, _, ye_tr, ye_te = train_test_split(X, y_eff,     test_size=0.2, random_state=42)

print("\n[1/4] Training: Should Irrigate (Binary Classifier)...")
clf_irrigate = RandomForestClassifier(n_estimators=200, max_depth=12, min_samples_leaf=5, n_jobs=-1, random_state=42)
clf_irrigate.fit(X_train, yi_tr)
yi_pred = clf_irrigate.predict(X_test)
print(classification_report(yi_te, yi_pred, target_names=["Hold", "Irrigate"]))

print("[2/4] Training: Urgency Level (Multiclass Classifier)...")
clf_urgency = RandomForestClassifier(n_estimators=200, max_depth=12, min_samples_leaf=5, n_jobs=-1, random_state=42)
clf_urgency.fit(X_train, yu_tr)
yu_pred = clf_urgency.predict(X_test)
print(classification_report(yu_te, yu_pred, target_names=["Low","Medium","High","Critical"]))

print("[3/4] Training: Water Amount in Litres (Regressor)...")
reg_water = GradientBoostingRegressor(n_estimators=300, max_depth=6, learning_rate=0.05, random_state=42)
reg_water.fit(X_train, yw_tr)
yw_pred = reg_water.predict(X_test)
print(f"  MAE: {mean_absolute_error(yw_te, yw_pred):.0f} L   R²: {r2_score(yw_te, yw_pred):.4f}")

print("[4/4] Training: Efficiency Score (Regressor)...")
reg_eff = RandomForestRegressor(n_estimators=200, max_depth=10, n_jobs=-1, random_state=42)
reg_eff.fit(X_train, ye_tr)
ye_pred = reg_eff.predict(X_test)
print(f"  MAE: {mean_absolute_error(ye_te, ye_pred):.2f}%   R²: {r2_score(ye_te, ye_pred):.4f}")

# Feature importance (top 10)
print("\nTop 10 Most Important Features (water model):")
fi = pd.Series(reg_water.feature_importances_, index=FEATURES).sort_values(ascending=False)
print(fi.head(10).to_string())

# Save models
os.makedirs("models", exist_ok=True)
bundle = {
    "features": FEATURES,
    "clf_irrigate": clf_irrigate,
    "clf_urgency":  clf_urgency,
    "reg_water":    reg_water,
    "reg_eff":      reg_eff,
    "label_map": {0: "low", 1: "medium", 2: "high", 3: "critical"},
}
joblib.dump(bundle, "models/irrigation_model.pkl", compress=3)
print(f"\n✅ Model bundle saved to models/irrigation_model.pkl")
print("Run: python api.py  →  starts Flask server on http://localhost:5000")
