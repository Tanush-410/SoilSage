import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    const { action, fieldId, pestData, weatherData } = body;

    // Pest database with risk profiles
    const PEST_DATABASE = {
      Armyworm: {
        riskFactors: { minTemp: 25, maxTemp: 30, minHumidity: 70 },
        reproductionRate: 2.1,
        generationDays: 7,
      },
      Bollworm: {
        riskFactors: { minTemp: 20, maxTemp: 28, minHumidity: 65 },
        reproductionRate: 1.8,
        generationDays: 12,
      },
      Whitefly: {
        riskFactors: { minTemp: 18, maxTemp: 30, minHumidity: 70 },
        reproductionRate: 2.3,
        generationDays: 5,
      },
      Aphids: {
        riskFactors: { minTemp: 15, maxTemp: 20, minHumidity: 60 },
        reproductionRate: 1.5,
        generationDays: 3,
      },
      Mites: {
        riskFactors: { minTemp: 30, maxTemp: 40, minHumidity: 30 },
        reproductionRate: 2.5,
        generationDays: 4,
      },
      Jassid: {
        riskFactors: { minTemp: 25, maxTemp: 35, minHumidity: 40 },
        reproductionRate: 1.9,
        generationDays: 6,
      },
    };

    if (action === 'predictRisk') {
      return NextResponse.json(predictPestRisk(weatherData || {}, PEST_DATABASE));
    }

    if (action === 'analyzeTreatment') {
      return NextResponse.json(analyzeTreatmentEffectiveness(pestData || {}, PEST_DATABASE));
    }

    if (action === 'getTreatmentPlan') {
      return NextResponse.json(generateTreatmentPlan(pestData || {}, PEST_DATABASE));
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Pest management error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function predictPestRisk(weatherData, pestDatabase) {
  const temp = weatherData.temperature || 25;
  const humidity = weatherData.humidity || 70;
  const rainfall = weatherData.rainfall || 10;

  const predictions = [];

  for (const [pestName, config] of Object.entries(pestDatabase)) {
    const { riskFactors } = config;
    let riskScore = 0;

    // Temperature risk calculation
    if (temp >= riskFactors.minTemp && temp <= riskFactors.maxTemp) {
      riskScore += 35;
    } else if (temp >= riskFactors.minTemp - 5 && temp <= riskFactors.maxTemp + 5) {
      riskScore += 20;
    }

    // Humidity risk calculation
    if (humidity >= riskFactors.minHumidity) {
      riskScore += 30;
    } else if (humidity >= riskFactors.minHumidity - 10) {
      riskScore += 15;
    }

    // Rainfall impact
    if (rainfall > 5) {
      riskScore += 20;
    }

    // Bonus for optimal conditions
    if (riskScore >= 85) {
      riskScore = Math.min(100, riskScore + 10);
    }

    let riskLevel = 'Low';
    if (riskScore >= 70) riskLevel = 'High';
    else if (riskScore >= 40) riskLevel = 'Medium';

    predictions.push({
      pestName,
      riskScore: Math.min(100, Math.round(riskScore)),
      riskLevel,
      conditions: {
        temperature: temp,
        humidity,
        rainfall,
      },
      recommendation:
        riskLevel === 'High'
          ? `Monitor ${pestName} closely - conditions are favorable. Start preventive measures.`
          : riskLevel === 'Medium'
            ? `Monitor ${pestName} regularly. Be ready to treat if population increases.`
            : `Low risk for ${pestName} at current weather conditions.`,
    });
  }

  return {
    timestamp: new Date().toISOString(),
    weatherConditions: {
      temperature: temp,
      humidity,
      rainfall,
    },
    predictions: predictions.sort((a, b) => b.riskScore - a.riskScore),
  };
}

function analyzeTreatmentEffectiveness(pestData, pestDatabase) {
  const { pestName, treatmentMethod, daysSinceTreatment, currentPopulation } = pestData;
  const pestConfig = pestDatabase[pestName] || {};

  const organicTreatments = {
    'Neem oil spray': { baseEffectiveness: 65, residualDays: 7, isOrganic: true },
    'Bt toxin': { baseEffectiveness: 75, residualDays: 10, isOrganic: true },
    'Yellow sticky traps': { baseEffectiveness: 60, residualDays: 14, isOrganic: true },
    'Insecticidal soap': { baseEffectiveness: 70, residualDays: 5, isOrganic: true },
    'Pheromone traps': { baseEffectiveness: 55, residualDays: 20, isOrganic: true },
    'Hand-pick': { baseEffectiveness: 80, residualDays: 1, isOrganic: true },
  };

  const chemicalTreatments = {
    Chlorpyrifos: { baseEffectiveness: 85, residualDays: 14, isOrganic: false },
    Cypermethrin: { baseEffectiveness: 88, residualDays: 12, isOrganic: false },
    Imidacloprid: { baseEffectiveness: 90, residualDays: 21, isOrganic: false },
    Thiamethoxam: { baseEffectiveness: 87, residualDays: 18, isOrganic: false },
    Endosulfan: { baseEffectiveness: 92, residualDays: 15, isOrganic: false },
  };

  const allTreatments = { ...organicTreatments, ...chemicalTreatments };
  const treatment = allTreatments[treatmentMethod];

  if (!treatment) {
    return { error: `Treatment method "${treatmentMethod}" not found` };
  }

  // Calculate residual effectiveness
  const residualDecay = 1 - (daysSinceTreatment || 0) / treatment.residualDays;
  let currentEffectiveness = treatment.baseEffectiveness * Math.max(0.1, residualDecay);

  // Population rebound effect
  const daysPerGeneration = pestConfig.generationDays || 7;
  const generationsPassed = (daysSinceTreatment || 0) / daysPerGeneration;
  const reboundMultiplier = 1 + generationsPassed * 0.15;
  const estimatedPopulation = (currentPopulation || 100) * reboundMultiplier;

  let nextTreatmentDue = Math.ceil(treatment.residualDays - (daysSinceTreatment || 0));
  if (nextTreatmentDue < 0) nextTreatmentDue = 0;

  return {
    pestName,
    treatmentMethod,
    treatmentProfile: treatment,
    effectiveness: {
      baseEffectiveness: treatment.baseEffectiveness,
      currentEffectiveness: Math.round(currentEffectiveness),
      residualDaysRemaining: Math.max(0, treatment.residualDays - (daysSinceTreatment || 0)),
    },
    populationAnalysis: {
      estimatedCurrentPopulation: Math.round(estimatedPopulation),
      originalPopulation: currentPopulation || 100,
      populationGrowthRate: Math.round((estimatedPopulation / (currentPopulation || 100) - 1) * 100) + '%',
    },
    recommendation:
      nextTreatmentDue === 0
        ? `Reapply ${treatmentMethod} - residual effectiveness is minimal`
        : `Next treatment due in ${nextTreatmentDue} days`,
    isOrganic: treatment.isOrganic,
  };
}

function generateTreatmentPlan(pestData, pestDatabase) {
  const { pestName, severity, cropType, fieldSize } = pestData;
  const pestConfig = pestDatabase[pestName] || {};

  const organicOptions = {
    Armyworm: ['Neem oil spray', 'Bt toxin', 'hand-pick', 'pheromone traps'],
    Bollworm: ['Pheromone traps', 'Bt toxin', 'NPV virus spray'],
    Whitefly: ['Yellow sticky traps', 'Insecticidal soap', 'Neem oil spray'],
    Aphids: ['Water spray', 'Ladybugs', 'Neem oil spray'],
    Mites: ['Sulfur powder', 'Predatory mites', 'water spray'],
    Jassid: ['Neem oil spray', 'Trap crops'],
  };

  const treatmentPlan = {
    pestName,
    severity,
    cropType,
    fieldSize: fieldSize || 1,
    recommendations: [],
  };

  if (severity === 'high') {
    treatmentPlan.recommendations.push({
      priority: 1,
      method: 'Immediate Action',
      actions: [
        'Scout field thoroughly - verify pest presence and population',
        'Isolate affected area to prevent spread',
        'Apply organic treatment immediately',
        'Monitor daily for 3 days',
      ],
      timeline: '0-1 days',
    });

    treatmentPlan.recommendations.push({
      priority: 2,
      method: 'Intensive Treatment',
      actions: [
        'Repeat organic treatment every 5-7 days',
        'Set up monitoring traps',
        'Release beneficial insects if available',
        'Increase irrigation if soil is dry',
      ],
      timeline: '1-14 days',
    });
  } else if (severity === 'medium') {
    treatmentPlan.recommendations.push({
      priority: 1,
      method: 'Preventive Treatment',
      actions: [
        'Monitor pest population closely',
        'Apply organic treatment when population reaches threshold',
        'Prune affected plant parts',
        'Improve farm hygiene',
      ],
      timeline: '0-7 days',
    });
  } else {
    treatmentPlan.recommendations.push({
      priority: 1,
      method: 'Monitoring Only',
      actions: ['Scout field every 3-4 days', 'Note any population changes', 'No treatment needed yet'],
      timeline: 'Weekly',
    });
  }

  treatmentPlan.organicOptions = organicOptions[pestName] || ['Neem oil spray', 'Manual removal'];

  treatmentPlan.preventiveMeasures = [
    'Maintain proper field sanitation',
    'Remove crop residue promptly',
    'Encourage beneficial insects and predators',
    'Maintain optimal soil moisture',
    'Use resistant crop varieties',
    'Practice crop rotation',
    'Install wind-breaks to reduce pest dispersal',
  ];

  return treatmentPlan;
}
