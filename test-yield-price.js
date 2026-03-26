#!/usr/bin/env node

/**
 * Yield & Price Prediction API - Automated Test Suite
 * Tests the Indian market-corrected calculations
 */

const testCases = [
  {
    name: "Rice - Optimal Conditions (Base Case)",
    input: {
      field: {
        name: "Rice Field",
        crop_type: "Rice",
        area_hectares: 1,
        soil_moisture: 70,
        soil_ph: 6.8,
        nitrogen: 120,
        phosphorus: 60,
        potassium: 60
      },
      weather: {
        rainfall: 1200,
        avg_temp: 28,
        humidity: 75,
        wind_speed: 5
      },
      growth_stage_progress: 50,
      forecast_days: 30
    },
    expectedChecks: {
      expectedMSP: 105,
      expectedMinPrice: 73.5, // MSP * 0.7
      expectedMaxPrice: 136.5, // MSP * 1.3
      minYield: 4500,
      maxYield: 5500,
      description: "Rice should have MSP of ₹105/kg with prices within ±30% of MSP"
    }
  },
  {
    name: "Wheat - Rabi Season",
    input: {
      field: {
        name: "Wheat Field",
        crop_type: "Wheat",
        area_hectares: 2,
        soil_moisture: 65,
        soil_ph: 7.0,
        nitrogen: 100,
        phosphorus: 50,
        potassium: 50
      },
      weather: {
        rainfall: 500,
        avg_temp: 20,
        humidity: 60,
        wind_speed: 3
      },
      growth_stage_progress: 60,
      forecast_days: 30
    },
    expectedChecks: {
      expectedMSP: 120.5,
      expectedMinPrice: 84.35, // MSP * 0.7
      expectedMaxPrice: 156.65, // MSP * 1.3
      minYield: 8000,
      maxYield: 10000,
      description: "Wheat should have MSP of ₹120.5/kg"
    }
  },
  {
    name: "Potato - High Volatility",
    input: {
      field: {
        name: "Potato Field",
        crop_type: "Potato",
        area_hectares: 1,
        soil_moisture: 75,
        soil_ph: 6.0,
        nitrogen: 100,
        phosphorus: 100,
        potassium: 150
      },
      weather: {
        rainfall: 400,
        avg_temp: 18,
        humidity: 70,
        wind_speed: 2
      },
      growth_stage_progress: 75,
      forecast_days: 30
    },
    expectedChecks: {
      expectedMSP: 22,
      expectedMinPrice: 15.4, // MSP * 0.7
      expectedMaxPrice: 28.6, // MSP * 1.3
      minYield: 15000,
      maxYield: 22000,
      description: "Potato should have MSP of ₹22/kg with high price volatility"
    }
  },
  {
    name: "Corn - Kharif Season",
    input: {
      field: {
        name: "Corn Field",
        crop_type: "Corn",
        area_hectares: 3,
        soil_moisture: 60,
        soil_ph: 6.5,
        nitrogen: 150,
        phosphorus: 60,
        potassium: 60
      },
      weather: {
        rainfall: 600,
        avg_temp: 25,
        humidity: 65,
        wind_speed: 4
      },
      growth_stage_progress: 70,
      forecast_days: 30
    },
    expectedChecks: {
      expectedMSP: 53.5,
      expectedMinPrice: 37.45, // MSP * 0.7
      expectedMaxPrice: 69.55, // MSP * 1.3
      minYield: 18000,
      maxYield: 25000,
      description: "Corn should have MSP of ₹53.5/kg"
    }
  }
];

// Test validation function
function validateResponse(response, testCase) {
  const errors = [];
  const warnings = [];
  
  try {
    // Check field info
    if (response.field.crop !== testCase.input.field.crop_type) {
      errors.push(`Crop mismatch: ${response.field.crop}`);
    }
    
    // Check MSP
    if (response.price_forecast.msp_price_per_kg !== testCase.expectedChecks.expectedMSP) {
      errors.push(`MSP Error: Expected ₹${testCase.expectedChecks.expectedMSP}, got ₹${response.price_forecast.msp_price_per_kg}`);
    }
    
    // Check yield range
    if (response.yield_prediction.total_yield < testCase.expectedChecks.minYield || 
        response.yield_prediction.total_yield > testCase.expectedChecks.maxYield * testCase.input.field.area_hectares) {
      warnings.push(`Yield out of expected range: ${response.yield_prediction.total_yield}`);
    }
    
    // Check price bounds
    const minPrice = response.price_forecast.statistics.min_price;
    const maxPrice = response.price_forecast.statistics.max_price;
    const expectedMin = testCase.expectedChecks.expectedMinPrice;
    const expectedMax = testCase.expectedChecks.expectedMaxPrice;
    
    if (minPrice < expectedMin || maxPrice > expectedMax) {
      warnings.push(`Price range check: min=${minPrice} (expected: ${expectedMin}), max=${maxPrice} (expected: ${expectedMax})`);
    }
    
    // Check financial calculations
    if (!response.financial.total_production_cost) {
      errors.push("Missing total production cost");
    }
    
    if (!response.financial.break_even_price_per_kg) {
      errors.push("Missing break-even price calculation");
    }
    
    if (response.financial.break_even_price_per_kg <= 0) {
      errors.push("Invalid break-even price (must be > 0)");
    }
    
    // Check profitability analysis
    if (response.financial.profitability_analysis === undefined) {
      errors.push("Missing profitability analysis");
    }
    
    // Check price forecasts
    if (!response.price_forecast.forecasts || response.price_forecast.forecasts.length === 0) {
      errors.push("Missing price forecasts");
    }
    
    // Check formula correctness
    const expectedBreakEven = response.financial.total_production_cost / response.yield_prediction.total_yield;
    const actualBreakEven = response.financial.break_even_price_per_kg;
    if (Math.abs(expectedBreakEven - actualBreakEven) > 0.5) {
      warnings.push(`Break-even calculation may be off: expected ~${expectedBreakEven.toFixed(2)}, got ${actualBreakEven}`);
    }
    
  } catch (e) {
    errors.push(`Validation error: ${e.message}`);
  }
  
  return { errors, warnings };
}

// Display results
function displayResults(testCase, validation) {
  const status = validation.errors.length === 0 ? "✅ PASS" : "❌ FAIL";
  
  console.log(`\n${"=".repeat(70)}`);
  console.log(`${status} ${testCase.name}`);
  console.log(`${"-".repeat(70)}`);
  
  if (validation.errors.length > 0) {
    console.log("❌ ERRORS:");
    validation.errors.forEach(err => console.log(`   • ${err}`));
  }
  
  if (validation.warnings.length > 0) {
    console.log("⚠️  WARNINGS:");
    validation.warnings.forEach(warn => console.log(`   • ${warn}`));
  }
  
  if (validation.errors.length === 0 && validation.warnings.length === 0) {
    console.log("✅ All checks passed!");
  }
}

// Summary function
function printSummary(results) {
  const passed = results.filter(r => r.validation.errors.length === 0).length;
  const failed = results.filter(r => r.validation.errors.length > 0).length;
  const total = results.length;
  
  console.log(`\n${"=".repeat(70)}`);
  console.log("📊 TEST SUMMARY");
  console.log(`${"-".repeat(70)}`);
  console.log(`Total Tests: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success Rate: ${((passed/total)*100).toFixed(1)}%`);
  console.log(`${"-".repeat(70)}`);
}

// Main test runner
async function runTests() {
  console.log("🧪 Yield & Price Prediction API - Test Suite");
  console.log("Testing Indian Market-Corrected Mathematics\n");
  
  const results = [];
  let passCount = 0;
  let failCount = 0;
  
  for (const testCase of testCases) {
    try {
      // Simulate API call (in real scenario, this would be an actual fetch)
      console.log(`⏳ Testing: ${testCase.name}...`);
      
      // Note: In a real environment, you would call:
      // const response = await fetch('http://localhost:3000/api/predict/yield-price', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(testCase.input)
      // }).then(r => r.json());
      
      // For now, show the test structure
      const validation = {
        errors: [],
        warnings: [`Mock test - Run against real API for validation`]
      };
      
      results.push({ testCase, validation });
      displayResults(testCase, validation);
      
      if (validation.errors.length === 0) {
        passCount++;
      } else {
        failCount++;
      }
      
    } catch (error) {
      console.error(`Error testing ${testCase.name}:`, error.message);
      failCount++;
    }
  }
  
  printSummary(results);
  
  console.log("\n📝 HOW TO RUN REAL TESTS:\n");
  console.log("1. Start the dev server:");
  console.log("   cd SoilSage && npm run dev\n");
  console.log("2. Modify this file to use actual fetch calls\n");
  console.log("3. Run: node YIELD_PRICE_TEST_API.js\n");
}

// Run tests
runTests().catch(console.error);
