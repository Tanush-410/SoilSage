#!/bin/bash
# AquaAI ML Pipeline Setup Script
# Run this once to set up and train the model

echo "=== AquaAI Irrigation ML Model Setup ==="
echo ""

# Install Python dependencies
echo "[1/3] Installing Python dependencies..."
pip install -r requirements.txt

# Generate dataset
echo "[2/3] Generating training dataset (12,000 samples)..."
python generate_dataset.py

# Train models
echo "[3/3] Training ML models..."
python train_model.py

echo ""
echo "✅ Setup complete!"
echo "Start the API with: python api.py"
echo "API will be available at: http://localhost:5000"
