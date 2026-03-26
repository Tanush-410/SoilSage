import pandas as pd
import numpy as np
import random

def generate_realistic_fertilizer_data(num_samples=8000):
    np.random.seed(42)
    random.seed(42)

    soil_types = ['Sandy', 'Loamy', 'Black', 'Red', 'Clayey']
    crop_types = ['Maize', 'Sugarcane', 'Cotton', 'Tobacco', 'Paddy', 'Barley', 'Wheat', 'Millets', 'Oil seeds', 'Pulses', 'Ground Nuts']
    
    data = []
    
    for _ in range(num_samples):
        temp = np.random.uniform(20.0, 38.0)
        humidity = np.random.uniform(40.0, 80.0)
        moisture = np.random.uniform(25.0, 65.0)
        soil = random.choice(soil_types)
        crop = random.choice(crop_types)
        
        # Base NPK values (healthy)
        n = np.random.uniform(20.0, 45.0)
        p = np.random.uniform(20.0, 45.0)
        k = np.random.uniform(20.0, 45.0)
        
        # Deficiencies logic
        deficiency = random.choice(['N_low', 'P_low', 'K_low', 'NP_low', 'PK_low', 'NK_low', 'Balanced'])
        
        if deficiency == 'N_low':
            n = np.random.uniform(5.0, 15.0)
            fert = 'Urea'
        elif deficiency == 'P_low':
            p = np.random.uniform(5.0, 15.0)
            fert = 'DAP'
        elif deficiency == 'K_low':
            k = np.random.uniform(5.0, 15.0)
            fert = '28-28' # Assume this represents a potassium-heavy mix or just a distinct label
        elif deficiency == 'NP_low':
            n = np.random.uniform(5.0, 18.0)
            p = np.random.uniform(5.0, 18.0)
            fert = '20-20'
        elif deficiency == 'PK_low':
            p = np.random.uniform(5.0, 18.0)
            k = np.random.uniform(5.0, 18.0)
            fert = '10-26-26'
        elif deficiency == 'NK_low':
            n = np.random.uniform(5.0, 18.0)
            k = np.random.uniform(5.0, 18.0)
            fert = '17-17-17'
        else: # almost balanced but slightly low on everything
            n = np.random.uniform(15.0, 22.0)
            p = np.random.uniform(15.0, 22.0)
            k = np.random.uniform(15.0, 22.0)
            fert = '14-35-14'
            
        # Add a tiny bit of noise
        if random.random() < 0.05: # 5% noise
            fert = random.choice(['Urea', 'DAP', '14-35-14', '28-28', '17-17-17', '20-20', '10-26-26'])

        data.append({
            'Temparature': round(temp, 1),
            'Humidity': round(humidity, 1),
            'Moisture': round(moisture, 1),
            'Soil Type': soil,
            'Crop Type': crop,
            'Nitrogen': round(n, 1),
            'Potassium': round(k, 1),
            'Phosphorous': round(p, 1),
            'Fertilizer Name': fert
        })
        
    df = pd.DataFrame(data)
    df.to_csv("data_core_v2.csv", index=False)
    print("✅ data_core_v2.csv generated successfully with 8000 mathematically correlated rows!")

if __name__ == "__main__":
    generate_realistic_fertilizer_data()
