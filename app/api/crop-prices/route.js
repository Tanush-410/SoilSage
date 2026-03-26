import { NextResponse } from 'next/server'

// data.gov.in AGMARKNET — real daily mandi prices across India
const AGMARK_URL = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070'
const API_KEY = process.env.DATA_GOV_API_KEY || '579b464db66ec23bdd000001'

// Map our crop names → AGMARKNET commodity names
const COMMODITY_MAP = {
  'Rice': 'Rice', 'Wheat': 'Wheat', 'Corn': 'Maize', 'Sorghum': 'Jowar',
  'Pearl Millet': 'Bajra', 'Chickpea': 'Gram(Desi)(Whole)', 'Pigeon Pea': 'Arhar (Tur/Red Gram)(Whole)',
  'Lentils': 'Masur Dal', 'Groundnut': 'Groundnut', 'Soybean': 'Soyabean',
  'Sunflower': 'Sunflower Seed', 'Mustard': 'Rapeseed', 'Tomato': 'Tomato',
  'Onion': 'Onion', 'Potato': 'Potato', 'Chili': 'Chilli', 'Cotton': 'Cotton',
  'Sugarcane': 'Sugarcane', 'Mango': 'Mango', 'Banana': 'Banana',
  'Turmeric': 'Turmeric', 'Ginger': 'Ginger',
}

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const crop = searchParams.get('crop') || 'Wheat'
  const commodity = COMMODITY_MAP[crop] || crop

  try {
    const url = `${AGMARK_URL}?api-key=${API_KEY}&format=json&filters[commodity]=${encodeURIComponent(commodity)}&limit=5&sort[arrival_date]=desc`
    const res = await fetch(url, { next: { revalidate: 3600 } }) // cache 1hr
    if (!res.ok) throw new Error('AGMARKNET API failed')
    const data = await res.json()
    const records = data.records || []

    if (records.length === 0) {
      return NextResponse.json({ source: 'fallback', records: [] })
    }

    // Average modal price across all returned markets
    const avgModal = Math.round(records.reduce((s, r) => s + (parseFloat(r.modal_price) || 0), 0) / records.length)
    const avgMin = Math.round(records.reduce((s, r) => s + (parseFloat(r.min_price) || 0), 0) / records.length)
    const avgMax = Math.round(records.reduce((s, r) => s + (parseFloat(r.max_price) || 0), 0) / records.length)
    const latestDate = records[0]?.arrival_date || new Date().toLocaleDateString('en-IN')
    const markets = [...new Set(records.map(r => r.market))].slice(0, 3)

    return NextResponse.json({
      source: 'agmarknet',
      crop,
      commodity,
      modalPrice: avgModal,
      minPrice: avgMin,
      maxPrice: avgMax,
      date: latestDate,
      markets,
      raw: records.slice(0, 3),
    })
  } catch (err) {
    console.error('AGMARKNET fetch error:', err.message)
    return NextResponse.json({ source: 'fallback', error: err.message, records: [] }, { status: 200 })
  }
}
