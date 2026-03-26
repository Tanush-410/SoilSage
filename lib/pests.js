// Pest database for smart irrigation system
// Maps crops to common pests with risk factors

export const PEST_DATABASE = {
  // Cereals
  wheat: {
    pests: [
      {
        name: "Aphids",
        risk_factors: {
          humidity_threshold: 70,
          temp_range: { min: 15, max: 25 },
          season: "Spring",
          growth_stages: ["Seedling", "Vegetative"],
          severity: "high"
        },
        symptoms: ["Yellowing leaves", "Sticky residue", "Ants presence"],
        control: "Neem oil spray, beneficial insects"
      },
      {
        name: "Rust",
        risk_factors: {
          humidity_threshold: 80,
          temp_range: { min: 10, max: 20 },
          season: "Winter",
          growth_stages: ["Flowering", "Fruiting"],
          severity: "medium"
        },
        symptoms: ["Orange-brown pustules on leaves"],
        control: "Fungicide application, resistant varieties"
      }
    ]
  },
  rice: {
    pests: [
      {
        name: "Brown Plant Hopper",
        risk_factors: {
          humidity_threshold: 85,
          temp_range: { min: 25, max: 35 },
          season: "Monsoon",
          growth_stages: ["Vegetative", "Flowering"],
          severity: "critical"
        },
        symptoms: ["Hopper burn", "Wilting", "Stunted growth"],
        control: "Systemic insecticides, alternate wetting/drying"
      },
      {
        name: "Rice Blast",
        risk_factors: {
          humidity_threshold: 90,
          temp_range: { min: 20, max: 30 },
          season: "Kharif",
          growth_stages: ["Flowering"],
          severity: "high"
        },
        symptoms: ["Diamond-shaped lesions on leaves"],
        control: "Fungicide, balanced fertilization"
      }
    ]
  },
  maize: {
    pests: [
      {
        name: "Corn Borer",
        risk_factors: {
          humidity_threshold: 60,
          temp_range: { min: 20, max: 30 },
          season: "Summer",
          growth_stages: ["Vegetative", "Flowering"],
          severity: "high"
        },
        symptoms: ["Holes in leaves", "Broken stalks"],
        control: "Bt toxin, pheromone traps"
      },
      {
        name: "Fall Armyworm",
        risk_factors: {
          humidity_threshold: 70,
          temp_range: { min: 25, max: 35 },
          season: "Monsoon",
          growth_stages: ["Seedling", "Vegetative"],
          severity: "critical"
        },
        symptoms: ["Irregular holes in leaves", "Defoliation"],
        control: "Biological control, neem-based pesticides"
      }
    ]
  },

  // Vegetables
  tomato: {
    pests: [
      {
        name: "Tomato Fruitworm",
        risk_factors: {
          humidity_threshold: 65,
          temp_range: { min: 20, max: 30 },
          season: "Summer",
          growth_stages: ["Flowering", "Fruiting"],
          severity: "high"
        },
        symptoms: ["Holes in fruits", "Larvae in tomatoes"],
        control: "Bacillus thuringiensis, hand picking"
      },
      {
        name: "Whiteflies",
        risk_factors: {
          humidity_threshold: 70,
          temp_range: { min: 25, max: 32 },
          season: "Year-round",
          growth_stages: ["Vegetative", "Flowering"],
          severity: "medium"
        },
        symptoms: ["Yellowing leaves", "Sticky honeydew"],
        control: "Yellow sticky traps, neem oil"
      }
    ]
  },
  potato: {
    pests: [
      {
        name: "Colorado Potato Beetle",
        risk_factors: {
          humidity_threshold: 60,
          temp_range: { min: 15, max: 25 },
          season: "Spring",
          growth_stages: ["Vegetative"],
          severity: "high"
        },
        symptoms: ["Skeletonized leaves", "Defoliation"],
        control: "Insecticides, crop rotation"
      },
      {
        name: "Potato Aphids",
        risk_factors: {
          humidity_threshold: 75,
          temp_range: { min: 18, max: 28 },
          season: "Summer",
          growth_stages: ["Flowering"],
          severity: "medium"
        },
        symptoms: ["Curling leaves", "Virus transmission"],
        control: "Aphid predators, reflective mulches"
      }
    ]
  },

  // Fruits
  mango: {
    pests: [
      {
        name: "Mango Hopper",
        risk_factors: {
          humidity_threshold: 70,
          temp_range: { min: 25, max: 35 },
          season: "Summer",
          growth_stages: ["Flowering", "Fruiting"],
          severity: "high"
        },
        symptoms: ["Hopper burn", "Fruit drop"],
        control: "Systemic insecticides, neem oil"
      },
      {
        name: "Fruit Fly",
        risk_factors: {
          humidity_threshold: 65,
          temp_range: { min: 20, max: 30 },
          season: "Monsoon",
          growth_stages: ["Fruiting"],
          severity: "critical"
        },
        symptoms: ["Soft brown spots on fruits"],
        control: "Protein bait traps, sanitation"
      }
    ]
  },

  // Oilseeds
  cotton: {
    pests: [
      {
        name: "Cotton Bollworm",
        risk_factors: {
          humidity_threshold: 60,
          temp_range: { min: 25, max: 35 },
          season: "Summer",
          growth_stages: ["Flowering", "Fruiting"],
          severity: "critical"
        },
        symptoms: ["Holes in bolls", "Larvae damage"],
        control: "Bt cotton, biological control"
      },
      {
        name: "Aphids",
        risk_factors: {
          humidity_threshold: 70,
          temp_range: { min: 20, max: 30 },
          season: "Monsoon",
          growth_stages: ["Vegetative"],
          severity: "medium"
        },
        symptoms: ["Honeydew on leaves", "Sooty mold"],
        control: "Natural enemies, neem oil"
      }
    ]
  },

  // Pulses
  soybean: {
    pests: [
      {
        name: "Soybean Looper",
        risk_factors: {
          humidity_threshold: 75,
          temp_range: { min: 22, max: 32 },
          season: "Monsoon",
          growth_stages: ["Vegetative", "Flowering"],
          severity: "high"
        },
        symptoms: ["Irregular holes in leaves"],
        control: "Bacillus thuringiensis, crop rotation"
      },
      {
        name: "Bean Pod Borer",
        risk_factors: {
          humidity_threshold: 70,
          temp_range: { min: 25, max: 35 },
          season: "Summer",
          growth_stages: ["Fruiting"],
          severity: "medium"
        },
        symptoms: ["Pod damage", "Seed loss"],
        control: "Pheromone traps, biological control"
      }
    ]
  }
};

// Helper function to get pest risks for a crop
export function getPestRisks(cropId, conditions) {
  const cropPests = PEST_DATABASE[cropId];
  if (!cropPests) return [];

  const { humidity, temperature, season, growthStage } = conditions;

  return cropPests.pests.filter(pest => {
    const rf = pest.risk_factors;
    return (
      humidity >= rf.humidity_threshold &&
      temperature >= rf.temp_range.min &&
      temperature <= rf.temp_range.max &&
      rf.season === season &&
      rf.growth_stages.includes(growthStage)
    );
  });
}

// Helper function to calculate overall pest risk score
export function calculatePestRiskScore(cropId, conditions) {
  const risks = getPestRisks(cropId, conditions);
  if (risks.length === 0) return 0;

  const severityScores = { low: 1, medium: 2, high: 3, critical: 4 };
  const avgSeverity = risks.reduce((sum, pest) => sum + severityScores[pest.risk_factors.severity], 0) / risks.length;

  // Factor in number of active pests
  const pestCountFactor = Math.min(risks.length / 3, 1); // Cap at 3 pests

  return Math.min(avgSeverity * (0.5 + 0.5 * pestCountFactor), 10); // Scale to 0-10
}