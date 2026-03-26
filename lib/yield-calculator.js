/**
 * Yield estimation + Indian market value calculator
 * Based on ICAR / APMC average yield and MSP/market rates
 */

// Yield in tonnes/hectare (typical Indian conditions, irrigated)
// Market price in ₹/quintal (1 quintal = 100 kg)
const CROP_DATA = {
  // Cereals
  'Wheat':              { yield: 4.5,  price: 2275,  unit: 'quintal' },
  'Rice / Paddy':       { yield: 5.5,  price: 2183,  unit: 'quintal' },
  'Maize / Corn':       { yield: 4.0,  price: 2090,  unit: 'quintal' },
  'Barley':             { yield: 3.5,  price: 1735,  unit: 'quintal' },
  'Sorghum / Jowar':    { yield: 2.8,  price: 3180,  unit: 'quintal' },
  'Millet / Bajra':     { yield: 2.5,  price: 2500,  unit: 'quintal' },
  // Pulses
  'Chickpea / Chana':   { yield: 1.8,  price: 5440,  unit: 'quintal' },
  'Soybean':            { yield: 2.5,  price: 4600,  unit: 'quintal' },
  'Lentil / Masoor':    { yield: 1.5,  price: 6000,  unit: 'quintal' },
  // Oilseeds
  'Sunflower':          { yield: 1.8,  price: 6760,  unit: 'quintal' },
  'Groundnut / Peanut': { yield: 2.2,  price: 6377,  unit: 'quintal' },
  'Mustard / Canola':   { yield: 2.0,  price: 5650,  unit: 'quintal' },
  // Cash crops
  'Sugarcane':          { yield: 75.0, price: 350,   unit: 'quintal' },
  'Cotton':             { yield: 2.0,  price: 6620,  unit: 'quintal' },
  // Vegetables
  'Tomato':             { yield: 25.0, price: 1200,  unit: 'quintal' },
  'Potato':             { yield: 22.0, price: 800,   unit: 'quintal' },
  'Onion':              { yield: 18.0, price: 1500,  unit: 'quintal' },
  'Cucumber':           { yield: 20.0, price: 900,   unit: 'quintal' },
  // Fruits
  'Mango':              { yield: 10.0, price: 4000,  unit: 'quintal' },
  'Banana':             { yield: 35.0, price: 1800,  unit: 'quintal' },
  'Grapes / Vineyard':  { yield: 15.0, price: 5000,  unit: 'quintal' },
  // Spices
  'Turmeric / Haldi':   { yield: 5.0,  price: 9000,  unit: 'quintal' },
  'Ginger / Adrak':     { yield: 15.0, price: 3500,  unit: 'quintal' },
  // Other
  'Coffee':             { yield: 1.5,  price: 10000, unit: 'quintal' },
  'Tea':                { yield: 2.5,  price: 12000, unit: 'quintal' },
}

/**
 * Estimate yield and market value for a field
 * @param {string} cropName
 * @param {number} areaHa - field area in hectares
 * @param {number} efficiencyScore - irrigation efficiency 0-100
 * @returns {{ yieldTonnes, yieldPerHa, marketValueRs, pricePerQuintal, priceSource }}
 */
export function estimateYield(cropName, areaHa, efficiencyScore = 75) {
  const crop = CROP_DATA[cropName]
  if (!crop) {
    // Fallback for unknown crops
    const baseYield = areaHa * 2.5
    return {
      yieldTonnes: Math.round(baseYield * 10) / 10,
      yieldPerHa: 2.5,
      marketValueRs: Math.round(baseYield * 10 * 2000 * 10),
      pricePerQuintal: 2000,
      priceSource: 'estimated',
    }
  }

  // Efficiency multiplier: 60% efficiency → 0.92x yield, 90% → 1.04x yield
  const effMultiplier = 0.85 + (efficiencyScore / 100) * 0.25
  const yieldPerHa = crop.yield * effMultiplier
  const yieldTonnes = yieldPerHa * areaHa
  // 1 tonne = 10 quintals
  const marketValueRs = Math.round(yieldTonnes * 10 * crop.price)

  return {
    yieldTonnes: Math.round(yieldTonnes * 10) / 10,
    yieldPerHa: Math.round(yieldPerHa * 10) / 10,
    marketValueRs,
    pricePerQuintal: crop.price,
    priceSource: 'MSP/APMC 2024-25',
  }
}

/** Format rupees nicely */
export function formatRupees(amount) {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`
  return `₹${amount}`
}
