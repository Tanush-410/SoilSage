// Test the yield-price prediction API
async function testAPI() {
  try {
    const response = await fetch('http://localhost:3000/api/predict/yield-price', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        field: {
          name: 'Test Field',
          crop_type: 'Rice',
          area_hectares: 1,
          soil_moisture: 65,
          soil_ph: 6.8,
          soil_temperature: 28,
          nitrogen: 100,
          phosphorus: 50,
          potassium: 50,
        },
        weather: {
          rainfall: 100,
          avg_temp: 28,
          humidity: 65,
        },
        growth_stage_progress: 50,
        forecast_days: 7,
      }),
    });

    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAPI();
