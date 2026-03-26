// Emergency Crop Help Solutions for Karnataka
export const EMERGENCY_SOLUTIONS = {
  flood: {
    id: 'flood',
    name: 'Flood Emergency Help',
    icon: '🌊',
    severity: 'critical',
    color: '#3498db',
    steps: [
      {
        no: 1,
        action: 'Stop Irrigation Immediately',
        details: 'Turn off all water sources to prevent further waterlogging',
        duration: '0-2 hours'
      },
      {
        no: 2,
        action: 'Improve Field Drainage',
        details: 'Create temporary channels to divert excess water. Use pumps if available to drain standing water.',
        duration: '2-6 hours'
      },
      {
        no: 3,
        action: 'Document Damage',
        details: 'Take photos/videos of affected area. Record crop loss % for insurance claims.',
        duration: 'Immediately'
      },
      {
        no: 4,
        action: 'Apply Crop Insurance Claim',
        details: 'Contact PMFBY within 72 hours. Required docs: Land record, damage photos, assessment report.',
        duration: 'Within 3 days'
      },
      {
        no: 5,
        action: 'Plan Crop Recovery',
        details: 'Replant crop variety if time permits, or switch to short-duration crop. Consult agronomist.',
        duration: 'After water recedes'
      }
    ],
    contacts: [
      { type: 'Farmers Helpline', number: '1800-180-1551', description: 'PMFBY Insurance Claims Support' },
      { type: '24/7 Flood Emergency', number: '080-2201-0018', description: 'Karnataka State Disaster Mgmt Authority' },
      { type: 'Agricultural Officer', number: '080-2234-5605', description: 'State Horticulture Department' },
      { type: 'IMD Weather Alert', number: '080-2251-7900', description: 'Get latest weather updates' }
    ],
    resources: [
      'Emergency Drainage Tips: www.icar.org.in/flood-management',
      'Insurance Claim Form: https://pmfby.gov.in/claim',
      'Local Rental Pumps: Contact nearby agricultural equipment dealers'
    ],
    prevention: 'Maintain field bunds regularly, install drainage systems before monsoon'
  },

  heatwave: {
    id: 'heatwave',
    name: 'Heatwave Emergency Help',
    icon: '🔥',
    severity: 'high',
    color: '#e74c3c',
    steps: [
      {
        no: 1,
        action: 'Water Immediately - High Priority',
        details: 'Increase irrigation frequency. Rice: Daily, Wheat: Every 3 days, Cotton: Every 5 days.',
        duration: '0-4 hours'
      },
      {
        no: 2,
        action: 'Use Drip Irrigation if Available',
        details: 'Drip cuts water loss by 40%. More efficient than flood irrigation in heat.',
        duration: 'Setup: 2-4 hours'
      },
      {
        no: 3,
        action: 'Mulch Your Fields',
        details: 'Apply crop residue (5-10 cm) to reduce soil temperature by 5-10°C',
        duration: '2-6 hours'
      },
      {
        no: 4,
        action: 'Identify Heat-Tolerant Seeds',
        details: 'Switch to heat-resistant crop varieties. Available at nearby seed shops.',
        duration: '1-2 days'
      },
      {
        no: 5,
        action: 'Monitor Crop Daily',
        details: 'Look for wilting, leaf curl. Apply foliar spray if stress visible.',
        duration: 'Daily observation'
      }
    ],
    contacts: [
      { type: 'Irrigation Helpline', number: '080-2201-1133', description: 'Irrigation Department - Pump issues' },
      { type: 'Agricultural Advisory', number: '1800-180-1551', description: 'Crop guidance for heat stress' },
      { type: 'Water Management', number: '080-2225-5111', description: 'Water allocation support' },
      { type: 'IMD Heatwave Alert', number: '080-2251-7900', description: 'Real-time temperature updates' }
    ],
    resources: [
      'Heat-Resistant Seed Varieties: Contact KSAC / State Seed Centre',
      'Drip Irrigation Support: RKVY-RAFTAAR (60% subsidy) - Call 080-2225-5111',
      'Mulching Guide: www.icar.org.in/heat-stress-management'
    ],
    prevention: 'Prepare drip systems in advance, keep backup water source, diversify crops'
  },

  pestAttack: {
    id: 'pestAttack',
    name: 'Pest Attack Emergency Help',
    icon: '🐛',
    severity: 'high',
    color: '#f39c12',
    steps: [
      {
        no: 1,
        action: 'Isolate Affected Area',
        details: 'Prevent pest spread. Remove heavily infested plants if possible.',
        duration: '1-2 hours'
      },
      {
        no: 2,
        action: 'Identify Pest Type',
        details: 'Take clear photo of pest/leaf damage. Send to local Krishi Vigyan Kendra for identification.',
        duration: '1 hour'
      },
      {
        no: 3,
        action: 'Choose Treatment Method',
        details: 'Organic: Neem spray, Biopesticides. Chemical: Targeted insecticides (use licensed spray operators)',
        duration: '2-4 hours'
      },
      {
        no: 4,
        action: 'Apply Treatment',
        details: 'Early morning/evening application best. Spray entire plant - top, bottom of leaves.',
        duration: '2-3 hours (full field)'
      },
      {
        no: 5,
        action: 'Monitor & Repeat',
        details: 'Check after 3 days. Repeat treatment if pest load > 5% of plants. Continue 14-21 days.',
        duration: 'Daily monitoring'
      }
    ],
    contacts: [
      { type: '🔴 Pest Hotline', number: '080-2234-5610', description: 'KSAC Pest Management Unit' },
      { type: 'Krishi Vigyan Kendra', number: '080-2200-0880', description: 'Free pest identification & advice' },
      { type: 'Agricultural Officer', number: '080-2234-5605', description: 'State pest control program' },
      { type: 'Spray Service Providers', number: '080-2225-8899', description: 'Licensed spraying operators' }
    ],
    resources: [
      'Pest Identification Guide: www.icar.org.in/pest-management',
      'Organic Treatment Shops: Krishi Kendra outlets, Agricultural Stores near you',
      'Chemical Approval: Only ICAR-approved pesticides. Avoid banned chemicals.',
      'Spraying Equipment Rental: Local agricultural equipment dealers'
    ],
    prevention: 'Crop rotation, proper sanitation, early scouting (2x per week), use resistant varieties'
  },

  drought: {
    id: 'drought',
    name: 'Drought Emergency Help',
    icon: '☀️',
    severity: 'high',
    color: '#d4a574',
    steps: [
      {
        no: 1,
        action: 'Assess Water Availability',
        details: 'Check bore well depth, canal status, rainfall forecast. Plan accordingly.',
        duration: '30 mins'
      },
      {
        no: 2,
        action: 'Prioritize Essential Crops',
        details: 'Water high-value crops first. Consider abandoning low-value/late-sown crops.',
        duration: '1-2 days'
      },
      {
        no: 3,
        action: 'Install Water Harvesting',
        details: 'Farm ponds, check dams can save 30-40% water. Available subsidy: 50-60%.',
        duration: '1-2 weeks'
      },
      {
        no: 4,
        action: 'Switch Irrigation Method',
        details: 'Drip saves 60% water vs. flood irrigation. Micro-sprinklers for small farms.',
        duration: 'Installation: 1 week'
      },
      {
        no: 5,
        action: 'Plan Alternative Crop',
        details: 'Switch to drought-resistant crops: Millets, Pulses, Oil seeds instead of water-intensive crops.',
        duration: 'Plan now, implement next crop'
      }
    ],
    contacts: [
      { type: 'Water Supply Helpline', number: '080-2201-1133', description: 'Emergency water allocation' },
      { type: 'Drought Relief Fund', number: '1800-180-1551', description: 'Government financial aid queries' },
      { type: 'Water Harvesting Program', number: '080-2225-5111', description: 'Subsidy info - RKVY-RAFTAAR' },
      { type: 'Meteorological Dept', number: '080-2251-7900', description: 'Rainfall forecast & alerts' }
    ],
    resources: [
      'Water Harvesting: PM-KRISHI SINCHAYEE YOJANA (60% subsidy) - www.pmksy.gov.in',
      'Drought-Resistant Crops: Contact KSAC for seed recommendations',
      'Loan Assistance: NABARD - www.nabard.org'
    ],
    prevention: 'Build water storage in advance, diversify crops, practice mulching year-round'
  },

  disease: {
    id: 'disease',
    name: 'Plant Disease Emergency Help',
    icon: '🦠',
    severity: 'medium',
    color: '#95a5a6',
    steps: [
      {
        no: 1,
        action: 'Quarantine Affected Plants',
        details: 'Separate diseased plants to prevent spread. Remove leaves with severe symptoms.',
        duration: '1-2 hours'
      },
      {
        no: 2,
        action: 'Identify Disease',
        details: 'Common: Blight, Rust, Mildew, Leaf Spot. Send leaf sample to agricultural lab.',
        duration: '1 day'
      },
      {
        no: 3,
        action: 'Apply Fungicide/Treatment',
        details: 'Copper fungicide, Sulfur, Bio-agents. Follow label instructions strictly.',
        duration: '2-3 hours'
      },
      {
        no: 4,
        action: 'Improve Field Hygiene',
        details: 'Remove crop debris, avoid waterlogging, ensure proper spacing for airflow.',
        duration: 'Ongoing'
      },
      {
        no: 5,
        action: 'Monitor & Prevent',
        details: 'Weekly field walks to catch early signs. Use resistant varieties next season.',
        duration: 'Continuous'
      }
    ],
    contacts: [
      { type: 'Plant Pathology Lab', number: '080-2200-0880', description: 'Disease identification - KSAC' },
      { type: 'Agricultural Advisory', number: '080-2234-5605', description: 'Treatment recommendations' },
      { type: 'Input Dealers', number: '080-2225-8899', description: 'Fungicides & bio-agents' },
      { type: 'Krishi Vigyan Kendra', number: '080-2215-4444', description: 'Free advisory service' }
    ],
    resources: [
      'Disease Management Guide: www.icar.org.in/plant-disease',
      'Approved Fungicides: Check ICAR approved list before buying',
      'Resistant Varieties: KSAC recommends varieties per crop'
    ],
    prevention: 'Use disease-free seeds, crop rotation, proper sanitation, avoid overwatering'
  }
}

// Get emergency solution by type
export function getEmergencySolution(emergencyType) {
  return EMERGENCY_SOLUTIONS[emergencyType] || null
}

// Get all emergency solutions
export function getAllEmergencies() {
  return Object.values(EMERGENCY_SOLUTIONS)
}

// Trigger emergency alert based on weather conditions
export function checkWeatherEmergency(weatherData) {
  const alerts = []
  
  if (weatherData.temperature > 40) {
    alerts.push('heatwave')
  }
  
  if (weatherData.humidity > 85 || weatherData.rainfall > 50) {
    alerts.push('flood')
  }
  
  if (weatherData.rainfall < 20 && weatherData.temperature > 35) {
    alerts.push('drought')
  }
  
  // Pest risk when temp 20-30°C and humidity > 70%
  if (weatherData.temperature >= 20 && weatherData.temperature <= 30 && weatherData.humidity > 70) {
    alerts.push('pestAttack')
  }
  
  return alerts
}
