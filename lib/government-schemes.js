// Government Schemes Database for Karnataka Farmers
export const KARNATAKA_SCHEMES = {
  // Direct Income Support
  'PM-KISAN': {
    name: 'Pradhan Mantri Kisan Samman Nidhi',
    description: 'Direct income support to farmers',
    eligibility: ['All crops', 'All farm sizes'],
    benefit: '₹6,000 per year (₹2,000 x 3 installments)',
    criteria: 'Land ownership proof + Aadhar',
    regions: ['Karnataka'],
    applicationLink: 'https://pmkisan.gov.in',
    helpline: '1800-115-411 (Toll Free)',
    icon: '💰'
  },
  
  // Crop Insurance
  'PMFBY': {
    name: 'Pradhan Mantri Fasal Bima Yojana',
    description: 'Crop insurance against natural calamities',
    eligibility: ['All farmers', 'All crops (at risk)'],
    benefit: 'Full coverage for natural disasters (70-90% of yield loss)',
    crops: ['Rice', 'Wheat', 'Cotton', 'Sugarcane', 'Corn', 'Millets'],
    regions: ['Karnataka'],
    premium: '1.5-2% of insured value (subsidized)',
    applicationLink: 'https://pmfby.gov.in',
    helpline: '1800-180-1551',
    icon: '🛡️'
  },

  // Soil Health
  'Soil Health Card': {
    name: 'Soil Health Card Scheme',
    description: 'Free soil testing + personalized recommendations',
    eligibility: ['All farmers'],
    benefit: 'Free soil health report every 2 years',
    whatsCovered: 'NPK, pH, Organic matter, Micronutrients',
    regions: ['Karnataka'],
    nextStep: 'Contact nearest KSAC lab or Agricultural Department',
    helpline: '080-2201-8855 (KSAC, Bangalore)',
    icon: '🧪'
  },

  // Subsidy Programs
  'RKVY-RAFTAAR': {
    name: 'Rashtriya Krishi Vikas Yojana - RAFTAAR',
    description: 'Subsidy for agricultural infrastructure & equipment',
    eligibility: ['Farmers', 'Groups', 'FPOs'],
    benefit: '50-70% subsidy on drip irrigation, solar pumps, equipment',
    applications: 'Drip irrigation | Solar pumps | Farm machinery | Storage units',
    regions: ['Karnataka'],
    applicationLink: 'https://rkvy.rkvy.nic.in',
    helpline: '080-2225-5111 (State Agriculture Department)',
    icon: '⚙️'
  },

  'Horticulture Mission': {
    name: 'Mission for Integrated Development of Horticulture',
    description: 'Support for fruit, vegetable, spice cultivation',
    eligibility: ['Horticulture farmers'],
    benefit: '60% subsidy on saplings, fertilizers, equipment',
    crops: ['Fruits', 'Vegetables', 'Spices', 'Flowers', 'Medicinal plants'],
    regions: ['Karnataka'],
    applicationLink: 'https://midhms.nica.nic.in',
    helpline: '080-2234-5678 (Horticulture Department)',
    icon: '🥕'
  },

  // Irrigation
  'AIBP': {
    name: 'Accelerated Irrigation Benefit Program',
    description: 'Irrigation system installation with subsidies',
    eligibility: ['Small & marginal farmers'],
    benefit: '80% cost support for drip & sprinkler systems',
    regions: ['Karnataka', 'Parts of Bangalore Rural'],
    applicationLink: 'https://aibp.nic.in',
    helpline: '080-2201-1133',
    icon: '💧'
  },

  // Livestock
  'Pashu Poshan Scheme': {
    name: 'Pashu Poshan Abhiyaan',
    description: 'Livestock feed subsidy program',
    eligibility: ['Dairy/livestock farmers'],
    benefit: '40% subsidy on quality fodder seeds & supplements',
    regions: ['Karnataka'],
    helpline: '080-2255-6789 (Animal Husbandry)',
    icon: '🐄'
  },

  // Women Farmers
  'Hariyali': {
    name: 'Hariyali (Woman Farmer Scheme)',
    description: 'Special support for women farmers',
    eligibility: ['Women farmers', 'SHGs'],
    benefit: '100% subsidy on saplings, seeds, training',
    regions: ['Karnataka'],
    applicationLink: 'https://horticulture.kar.nic.in',
    helpline: '080-2234-5670 (Women Farmer Helpline)',
    icon: '👩‍🌾'
  },

  // Youth
  'Agri Business Training': {
    name: 'Agricultural Entrepreneur Scheme',
    description: 'Support for young farmers starting agri-business',
    eligibility: ['Age 18-40 years', 'Any educational background'],
    benefit: 'Subsidy up to ₹1 Lakh + Low-interest loans',
    regions: ['Karnataka'],
    applicationLink: 'https://pragati.gov.in',
    helpline: '1800-11-7080',
    icon: '🌱'
  },

  // Climate Smart
  'Pradhan Mantri Krishi Sinchayee Yojana': {
    name: 'PM Krishi Sinchayee Yojana',
    description: 'Water-efficient irrigation systems',
    eligibility: ['All farmers'],
    benefit: '60% subsidy on micro-irrigation systems',
    regions: ['Karnataka'],
    applicationLink: 'https://pmksy.gov.in',
    helpline: '011-2306-6802',
    icon: '🚰'
  }
}

// Function to get schemes for a specific crop
export function getSchemesForCrop(cropName) {
  const relevantSchemes = []
  
  for (const [key, scheme] of Object.entries(KARNATAKA_SCHEMES)) {
    // Check if scheme is relevant
    if (scheme.crops && scheme.crops.some(c => c.toLowerCase() === cropName.toLowerCase())) {
      relevantSchemes.push({ id: key, ...scheme })
    } else if (scheme.eligibility && scheme.eligibility.includes('All crops')) {
      relevantSchemes.push({ id: key, ...scheme })
    }
  }
  
  return relevantSchemes
}

// Function to get all applicable schemes for a farmer
export function getAllApplicableSchemes() {
  return Object.entries(KARNATAKA_SCHEMES).map(([id, scheme]) => ({
    id,
    ...scheme
  }))
}

// Function to calculate subsidy based on farm size and scheme
export function calculateSubsidy(scheme, farmSizeHectares) {
  if (scheme.id === 'RKVY-RAFTAAR') {
    // ₹2,500 per hectare, up to 50% subsidy
    return Math.min(farmSizeHectares * 2500, 300000) // Max ₹3 Lakh
  }
  if (scheme.id === 'Horticulture Mission') {
    return farmSizeHectares * 2000 // ₹2,000 per hectare
  }
  if (scheme.id === 'AIBP') {
    return farmSizeHectares * 3000 // ₹3,000 per hectare (80% support)
  }
  return 0
}
