export const CROP_DATABASE = {
  cereals: {
    label: '🌾 Cereals & Grains',
    crops: [
      { id: 'wheat', name: 'Wheat', category: 'Cereals', optimalMoisture: 60, waterNeed: 'medium', season: 'Rabi' },
      { id: 'rice', name: 'Rice / Paddy', category: 'Cereals', optimalMoisture: 85, waterNeed: 'high', season: 'Kharif' },
      { id: 'maize', name: 'Maize / Corn', category: 'Cereals', optimalMoisture: 65, waterNeed: 'medium', season: 'Kharif' },
      { id: 'barley', name: 'Barley', category: 'Cereals', optimalMoisture: 55, waterNeed: 'low', season: 'Rabi' },
      { id: 'sorghum', name: 'Sorghum / Jowar', category: 'Cereals', optimalMoisture: 50, waterNeed: 'low', season: 'Kharif' },
      { id: 'millet', name: 'Millet / Bajra', category: 'Cereals', optimalMoisture: 45, waterNeed: 'low', season: 'Kharif' },
      { id: 'oats', name: 'Oats', category: 'Cereals', optimalMoisture: 60, waterNeed: 'medium', season: 'Rabi' },
    ]
  },
  pulses: {
    label: '🫛 Pulses & Legumes',
    crops: [
      { id: 'chickpea', name: 'Chickpea / Chana', category: 'Pulses', optimalMoisture: 50, waterNeed: 'low', season: 'Rabi' },
      { id: 'lentil', name: 'Lentil / Masoor', category: 'Pulses', optimalMoisture: 55, waterNeed: 'low', season: 'Rabi' },
      { id: 'soybean', name: 'Soybean', category: 'Pulses', optimalMoisture: 65, waterNeed: 'medium', season: 'Kharif' },
      { id: 'blackgram', name: 'Black Gram / Urad', category: 'Pulses', optimalMoisture: 60, waterNeed: 'medium', season: 'Kharif' },
      { id: 'greengram', name: 'Green Gram / Moong', category: 'Pulses', optimalMoisture: 60, waterNeed: 'medium', season: 'Kharif' },
      { id: 'pea', name: 'Peas', category: 'Pulses', optimalMoisture: 60, waterNeed: 'medium', season: 'Rabi' },
    ]
  },
  oilseeds: {
    label: '🌻 Oilseeds & Fiber',
    crops: [
      { id: 'cotton', name: 'Cotton', category: 'Fiber', optimalMoisture: 65, waterNeed: 'medium', season: 'Kharif' },
      { id: 'sunflower', name: 'Sunflower', category: 'Oilseed', optimalMoisture: 60, waterNeed: 'medium', season: 'Rabi' },
      { id: 'mustard', name: 'Mustard / Canola', category: 'Oilseed', optimalMoisture: 55, waterNeed: 'low', season: 'Rabi' },
      { id: 'groundnut', name: 'Groundnut / Peanut', category: 'Oilseed', optimalMoisture: 60, waterNeed: 'medium', season: 'Kharif' },
      { id: 'sesame', name: 'Sesame / Til', category: 'Oilseed', optimalMoisture: 50, waterNeed: 'low', season: 'Kharif' },
    ]
  },
  vegetables: {
    label: '🥦 Vegetables',
    crops: [
      { id: 'tomato', name: 'Tomato', category: 'Vegetables', optimalMoisture: 70, waterNeed: 'high', season: 'Year-round' },
      { id: 'potato', name: 'Potato', category: 'Vegetables', optimalMoisture: 70, waterNeed: 'high', season: 'Rabi' },
      { id: 'onion', name: 'Onion', category: 'Vegetables', optimalMoisture: 65, waterNeed: 'medium', season: 'Rabi' },
      { id: 'cabbage', name: 'Cabbage', category: 'Vegetables', optimalMoisture: 70, waterNeed: 'high', season: 'Rabi' },
      { id: 'cucumber', name: 'Cucumber', category: 'Vegetables', optimalMoisture: 75, waterNeed: 'high', season: 'Kharif' },
      { id: 'pepper', name: 'Bell Pepper / Capsicum', category: 'Vegetables', optimalMoisture: 70, waterNeed: 'high', season: 'Rabi' },
      { id: 'carrot', name: 'Carrot', category: 'Vegetables', optimalMoisture: 65, waterNeed: 'medium', season: 'Rabi' },
      { id: 'spinach', name: 'Spinach / Palak', category: 'Vegetables', optimalMoisture: 70, waterNeed: 'high', season: 'Rabi' },
      { id: 'okra', name: 'Okra / Bhindi', category: 'Vegetables', optimalMoisture: 65, waterNeed: 'medium', season: 'Kharif' },
      { id: 'brinjal', name: 'Brinjal / Eggplant', category: 'Vegetables', optimalMoisture: 65, waterNeed: 'medium', season: 'Kharif' },
    ]
  },
  fruits: {
    label: '🍎 Fruits',
    crops: [
      { id: 'mango', name: 'Mango', category: 'Fruits', optimalMoisture: 60, waterNeed: 'medium', season: 'Perennial' },
      { id: 'banana', name: 'Banana', category: 'Fruits', optimalMoisture: 75, waterNeed: 'high', season: 'Perennial' },
      { id: 'grapes', name: 'Grapes / Vineyard', category: 'Fruits', optimalMoisture: 60, waterNeed: 'medium', season: 'Perennial' },
      { id: 'citrus', name: 'Citrus (Lemon/Orange)', category: 'Fruits', optimalMoisture: 65, waterNeed: 'medium', season: 'Perennial' },
      { id: 'watermelon', name: 'Watermelon', category: 'Fruits', optimalMoisture: 65, waterNeed: 'medium', season: 'Kharif' },
      { id: 'papaya', name: 'Papaya', category: 'Fruits', optimalMoisture: 70, waterNeed: 'high', season: 'Perennial' },
      { id: 'guava', name: 'Guava', category: 'Fruits', optimalMoisture: 60, waterNeed: 'medium', season: 'Perennial' },
    ]
  },
  commercial: {
    label: '🌿 Commercial Crops',
    crops: [
      { id: 'sugarcane', name: 'Sugarcane', category: 'Commercial', optimalMoisture: 80, waterNeed: 'very-high', season: 'Perennial' },
      { id: 'tobacco', name: 'Tobacco', category: 'Commercial', optimalMoisture: 60, waterNeed: 'medium', season: 'Kharif' },
      { id: 'tea', name: 'Tea', category: 'Commercial', optimalMoisture: 75, waterNeed: 'high', season: 'Perennial' },
      { id: 'coffee', name: 'Coffee', category: 'Commercial', optimalMoisture: 70, waterNeed: 'high', season: 'Perennial' },
      { id: 'coconut', name: 'Coconut', category: 'Commercial', optimalMoisture: 65, waterNeed: 'medium', season: 'Perennial' },
      { id: 'turmeric', name: 'Turmeric / Haldi', category: 'Spices', optimalMoisture: 70, waterNeed: 'high', season: 'Kharif' },
      { id: 'ginger', name: 'Ginger / Adrak', category: 'Spices', optimalMoisture: 70, waterNeed: 'high', season: 'Kharif' },
      { id: 'jute', name: 'Jute', category: 'Commercial', optimalMoisture: 75, waterNeed: 'high', season: 'Kharif' },
    ]
  }
}

export const SOIL_TYPES = [
  { id: 'clay', name: 'Clay Soil' },
  { id: 'sandy', name: 'Sandy Soil' },
  { id: 'loamy', name: 'Loamy Soil' },
  { id: 'silty', name: 'Silty Soil' },
  { id: 'peaty', name: 'Peaty Soil' },
  { id: 'black', name: 'Black Soil (Regur)' },
  { id: 'alluvial', name: 'Alluvial Soil' },
  { id: 'red', name: 'Red Laterite Soil' },
  { id: 'chalky', name: 'Chalky Soil' },
]

export const GROWTH_STAGES = ['Germination', 'Seedling', 'Vegetative', 'Flowering', 'Fruiting', 'Maturity', 'Harvest']

export function getAllCrops() {
  return Object.values(CROP_DATABASE).flatMap(cat => cat.crops)
}
