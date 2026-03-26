// Comprehensive crop market price database (MSP/APMC 2024-25)
export const CROP_MARKET_DATA = [
  // Cereals
  { crop: 'Rice', category: 'Cereals', yieldPerHa: 4.2, mspRs: 2300, apmc: 2450, highSeasonPrice: 2700, lowSeasonPrice: 2100, highSeason: 'Oct-Dec', currency: '₹/qtl', forecast: '+8% (Kharif surplus expected)', forecastTrend: 'up' },
  { crop: 'Wheat', category: 'Cereals', yieldPerHa: 3.8, mspRs: 2275, apmc: 2350, highSeasonPrice: 2600, lowSeasonPrice: 2100, highSeason: 'Apr-May', currency: '₹/qtl', forecast: '+5% (Good rabi season)', forecastTrend: 'up' },
  { crop: 'Corn', category: 'Cereals', yieldPerHa: 3.2, mspRs: 2090, apmc: 2150, highSeasonPrice: 2400, lowSeasonPrice: 1800, highSeason: 'Nov-Jan', currency: '₹/qtl', forecast: '-3% (High carryover stocks)', forecastTrend: 'down' },
  { crop: 'Sorghum', category: 'Cereals', yieldPerHa: 1.8, mspRs: 3180, apmc: 3250, highSeasonPrice: 3600, lowSeasonPrice: 2900, highSeason: 'Oct-Nov', currency: '₹/qtl', forecast: '+4% (Ethanol demand rising)', forecastTrend: 'up' },
  { crop: 'Pearl Millet', category: 'Cereals', yieldPerHa: 1.6, mspRs: 2625, apmc: 2700, highSeasonPrice: 2900, lowSeasonPrice: 2400, highSeason: 'Sep-Oct', currency: '₹/qtl', forecast: 'Stable', forecastTrend: 'stable' },
  // Pulses
  { crop: 'Chickpea', category: 'Pulses', yieldPerHa: 1.1, mspRs: 5440, apmc: 5600, highSeasonPrice: 6200, lowSeasonPrice: 5000, highSeason: 'Mar-Apr', currency: '₹/qtl', forecast: '+10% (Import restrictions)', forecastTrend: 'up' },
  { crop: 'Pigeon Pea', category: 'Pulses', yieldPerHa: 0.9, mspRs: 7000, apmc: 7200, highSeasonPrice: 8500, lowSeasonPrice: 6500, highSeason: 'Nov-Dec', currency: '₹/qtl', forecast: '+12% (Low global supply)', forecastTrend: 'up' },
  { crop: 'Lentils', category: 'Pulses', yieldPerHa: 0.8, mspRs: 6000, apmc: 6200, highSeasonPrice: 7000, lowSeasonPrice: 5500, highSeason: 'Mar-Apr', currency: '₹/qtl', forecast: '+6%', forecastTrend: 'up' },
  { crop: 'Groundnut', category: 'Oilseeds', yieldPerHa: 2.1, mspRs: 6783, apmc: 7000, highSeasonPrice: 7800, lowSeasonPrice: 6300, highSeason: 'Oct-Nov', currency: '₹/qtl', forecast: '+7% (Oil demand)', forecastTrend: 'up' },
  // Oilseeds
  { crop: 'Soybean', category: 'Oilseeds', yieldPerHa: 1.4, mspRs: 4892, apmc: 5100, highSeasonPrice: 5800, lowSeasonPrice: 4600, highSeason: 'Oct-Nov', currency: '₹/qtl', forecast: 'Stable (Global parity)', forecastTrend: 'stable' },
  { crop: 'Sunflower', category: 'Oilseeds', yieldPerHa: 0.9, mspRs: 7280, apmc: 7500, highSeasonPrice: 8200, lowSeasonPrice: 6800, highSeason: 'Apr-May', currency: '₹/qtl', forecast: '+5%', forecastTrend: 'up' },
  { crop: 'Mustard', category: 'Oilseeds', yieldPerHa: 1.1, mspRs: 5950, apmc: 6200, highSeasonPrice: 7000, lowSeasonPrice: 5600, highSeason: 'Feb-Mar', currency: '₹/qtl', forecast: '+8% (Low imports)', forecastTrend: 'up' },
  // Vegetables
  { crop: 'Tomato', category: 'Vegetables', yieldPerHa: 25.0, mspRs: 800, apmc: 1200, highSeasonPrice: 4000, lowSeasonPrice: 300, highSeason: 'Jun-Aug', currency: '₹/qtl', forecast: 'Volatile (seasonal)', forecastTrend: 'volatile' },
  { crop: 'Onion', category: 'Vegetables', yieldPerHa: 18.0, mspRs: 900, apmc: 1500, highSeasonPrice: 5000, lowSeasonPrice: 400, highSeason: 'Nov-Dec', currency: '₹/qtl', forecast: '-10% (Good Maharashtra crop)', forecastTrend: 'down' },
  { crop: 'Potato', category: 'Vegetables', yieldPerHa: 22.0, mspRs: 600, apmc: 800, highSeasonPrice: 1800, lowSeasonPrice: 350, highSeason: 'Jan-Mar', currency: '₹/qtl', forecast: 'Stable', forecastTrend: 'stable' },
  { crop: 'Chili', category: 'Vegetables', yieldPerHa: 5.0, mspRs: 4000, apmc: 4500, highSeasonPrice: 8000, lowSeasonPrice: 3000, highSeason: 'Jan-Mar', currency: '₹/qtl', forecast: '+15% (Export demand)', forecastTrend: 'up' },
  // Cash Crops
  { crop: 'Cotton', category: 'Cash Crops', yieldPerHa: 2.1, mspRs: 7121, apmc: 7500, highSeasonPrice: 8500, lowSeasonPrice: 6500, highSeason: 'Oct-Dec', currency: '₹/qtl', forecast: '+6% (Textile sector recovery)', forecastTrend: 'up' },
  { crop: 'Sugarcane', category: 'Cash Crops', yieldPerHa: 70.0, mspRs: 340, apmc: 350, highSeasonPrice: 380, lowSeasonPrice: 310, highSeason: 'Oct-Feb', currency: '₹/qtl', forecast: 'Stable (govt controlled)', forecastTrend: 'stable' },
  { crop: 'Jute', category: 'Cash Crops', yieldPerHa: 2.5, mspRs: 5050, apmc: 5200, highSeasonPrice: 5800, lowSeasonPrice: 4700, highSeason: 'Aug-Sep', currency: '₹/qtl', forecast: '+4%', forecastTrend: 'up' },
  // Fruits
  { crop: 'Mango', category: 'Fruits', yieldPerHa: 10.0, mspRs: 3000, apmc: 4000, highSeasonPrice: 8000, lowSeasonPrice: 1500, highSeason: 'Apr-Jun', currency: '₹/qtl', forecast: '+12% (Export demand)', forecastTrend: 'up' },
  { crop: 'Banana', category: 'Fruits', yieldPerHa: 40.0, mspRs: 1200, apmc: 1800, highSeasonPrice: 3000, lowSeasonPrice: 900, highSeason: 'Aug-Sep', currency: '₹/qtl', forecast: 'Stable', forecastTrend: 'stable' },
  // Spices
  { crop: 'Turmeric', category: 'Spices', yieldPerHa: 7.5, mspRs: 8000, apmc: 10000, highSeasonPrice: 18000, lowSeasonPrice: 7000, highSeason: 'Feb-Mar', currency: '₹/qtl', forecast: '+20% (Global demand surge)', forecastTrend: 'up' },
  { crop: 'Ginger', category: 'Spices', yieldPerHa: 15.0, mspRs: 6000, apmc: 7000, highSeasonPrice: 14000, lowSeasonPrice: 4000, highSeason: 'Nov-Dec', currency: '₹/qtl', forecast: '+8%', forecastTrend: 'up' },
]

export const CATEGORIES = [...new Set(CROP_MARKET_DATA.map(c => c.category))]

export function formatRs(val) {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`
  if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`
  return `₹${val?.toLocaleString()}`
}
