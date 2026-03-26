'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { fetchWeather, geocodeCity } from '@/lib/weather'
import { getIrrigationRecommendation, generate7DayPlan, CROP_IRRIGATION_SCHEDULE } from '@/lib/no-sensor-advisor'
import { Droplets, Calendar, Cloud, Loader2 } from 'lucide-react'

export default function IrrigationAdvisorPage() {
  const { profile } = useAuth()
  const [fields, setFields] = useState([])
  const [selectedField, setSelectedField] = useState(null)
  const [weather, setWeather] = useState(null)
  const [recommendation, setRecommendation] = useState(null)
  const [sevenDayPlan, setSevenDayPlan] = useState([])
  const [irrigationHistory, setIrrigationHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [profile])

  async function loadData() {
    try {
      const { data: f } = await supabase.from('fields').select('*').order('created_at', { ascending: false })
      setFields(f || [])
      if (f?.length) {
        setSelectedField(f[0])
        await loadFieldData(f[0])
      }
    } catch (err) {
      console.log('Load error:', err)
    }
    setLoading(false)
  }

  async function loadFieldData(field) {
    setSelectedField(field)
    setRecommendation(null)

    try {
      // Load irrigation history
      const { data: hist } = await supabase
        .from('irrigation_log')
        .select('*')
        .eq('field_id', field.id)
        .order('irrigated_date', { ascending: false })
        .limit(20)
      setIrrigationHistory(hist || [])

      // Fetch weather with geocoding
      let w = null
      try {
        const cityName = field.city || 'New Delhi'
        const geoData = await geocodeCity(cityName)
        if (geoData?.latitude && geoData?.longitude) {
          w = await fetchWeather(geoData.latitude, geoData.longitude)
        } else {
          throw new Error('Geocoding failed')
        }
      } catch (err) {
        console.log('Weather fetch failed:', err.message)
        w = {
          current: { temperature: 28, humidity: 65 },
          daily: Array(7).fill(0).map(() => ({
            rainSum: Math.random() > 0.7 ? Math.random() * 30 : 0,
            temp_max: 28 + Math.random() * 5,
            temp_min: 18 + Math.random() * 3
          }))
        }
      }
      setWeather(w)

      // Calculate recommendation
      const lastIrrigation = hist?.[0]?.irrigated_date
        ? new Date(hist[0].irrigated_date)
        : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

      const cropType = field.crop_type || 'Rice'
      const rec = getIrrigationRecommendation(w, cropType, lastIrrigation, field.region || 'Maharashtra')
      
      setRecommendation({
        ...rec,
        cropType,
        lastIrrigationDate: lastIrrigation
      })

      // Generate 7-day plan
      const plan = generate7DayPlan(w, field, [cropType])
      setSevenDayPlan(plan || [])

      console.log('Field loaded:', { field: field.name, crop: cropType, weather: w?.current })
    } catch (err) {
      console.error('Load error:', err)
    }
  }

  if (loading) {
    return <div className="center-loader"><Loader2 size={40} className="spin" /></div>
  }

  if (!fields.length) {
    return (
      <div className="page">
        <div className="empty-page">
          <Droplets size={64} />
          <h2>No Fields Found</h2>
          <p>Add fields to get irrigation recommendations.</p>
        </div>
      </div>
    )
  }

  const urgencyColors = {
    critical: { bg: '#fdecea', color: '#c0392b', label: '🚨 IRRIGATE NOW' },
    high: { bg: '#fef3cd', color: '#b45309', label: '⚡ Irrigate Soon' },
    medium: { bg: '#e8f0fb', color: '#1a6fb5', label: '⏰ Monitor' },
    low: { bg: '#e8f5ee', color: '#2d8a4e', label: '✅ Good' }
  }

  const colors = urgencyColors[recommendation?.urgency || 'low']

  return (
    <div className="page">
      <div className="page-header" style={{ marginBottom: 28 }}>
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Droplets size={24} color="#2d8a4e" />
          Irrigation Advisor
        </h1>
        <p className="page-sub">Weather-based scheduling for manual farmers</p>
      </div>

      {/* Field Selector */}
      <div className="glass-card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Select Field:</h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {fields.map(f => (
            <button
              key={f.id}
              onClick={() => loadFieldData(f)}
              style={{
                padding: '10px 16px',
                background: selectedField?.id === f.id ? 'linear-gradient(135deg, #2d8a4e, #f59e0b)' : '#f5f6f8',
                color: selectedField?.id === f.id ? 'white' : '#8aab96',
                border: 'none',
                borderRadius: 6,
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: 13
              }}
            >
              {f.name} ({f.crop_type})
            </button>
          ))}
        </div>
      </div>

      {selectedField && !recommendation && (
        <div className="glass-card" style={{ background: '#f0f0f0', padding: 24, textAlign: 'center' }}>
          <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', margin: '0 auto' }} />
          <p style={{ marginTop: 12, color: '#8aab96' }}>Loading...</p>
        </div>
      )}

      {recommendation && (
        <>
          {/* Recommendation Card */}
          <div
            className="glass-card"
            style={{
              background: colors.bg,
              border: `2px solid ${colors.color}`,
              marginBottom: 24,
              padding: 24
            }}
          >
            <h3 style={{ fontSize: 18, fontWeight: 800, color: colors.color, margin: 0, marginBottom: 16 }}>
              {colors.label}
            </h3>
            <p style={{ color: colors.color, margin: '0 0 16px 0' }}>{recommendation.reason}</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
              <div>
                <p style={{ fontSize: 10, color: colors.color, opacity: 0.7, fontWeight: 700, marginBottom: 4 }}>Days Since Last</p>
                <p style={{ fontSize: 26, fontWeight: 800, color: colors.color, margin: 0 }}>{recommendation.daysSinceLastIrrigation}d</p>
              </div>
              <div>
                <p style={{ fontSize: 10, color: colors.color, opacity: 0.7, fontWeight: 700, marginBottom: 4 }}>Recommended Interval</p>
                <p style={{ fontSize: 26, fontWeight: 800, color: colors.color, margin: 0 }}>{recommendation.recommendedIntervalDays}d</p>
              </div>
              <div>
                <p style={{ fontSize: 10, color: colors.color, opacity: 0.7, fontWeight: 700, marginBottom: 4 }}>Water Needed</p>
                <p style={{ fontSize: 26, fontWeight: 800, color: colors.color, margin: 0 }}>{(recommendation.waterNeededLiters / 1000).toFixed(1)}k L</p>
              </div>
            </div>
          </div>

          {/* Weather */}
          {weather && (
            <div className="glass-card" style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Cloud size={18} color="#0066cc" />
                Current Weather
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                <div style={{ padding: 12, background: '#f0f8ff', borderRadius: 8 }}>
                  <p style={{ fontSize: 10, color: '#0066cc', fontWeight: 700, marginBottom: 4 }}>Temperature</p>
                  <p style={{ fontSize: 20, fontWeight: 800, color: '#0066cc', margin: 0 }}>{weather.current?.temperature || 25}°C</p>
                </div>
                <div style={{ padding: 12, background: '#f0f8ff', borderRadius: 8 }}>
                  <p style={{ fontSize: 10, color: '#0066cc', fontWeight: 700, marginBottom: 4 }}>Humidity</p>
                  <p style={{ fontSize: 20, fontWeight: 800, color: '#0066cc', margin: 0 }}>{weather.current?.humidity || 60}%</p>
                </div>
                <div style={{ padding: 12, background: '#f0f8ff', borderRadius: 8 }}>
                  <p style={{ fontSize: 10, color: '#0066cc', fontWeight: 700, marginBottom: 4 }}>7-Day Rain</p>
                  <p style={{ fontSize: 20, fontWeight: 800, color: '#0066cc', margin: 0 }}>{weather.daily?.slice(0, 7).reduce((sum, d) => sum + (d.rainSum || 0), 0).toFixed(0)}mm</p>
                </div>
              </div>
            </div>
          )}

          {/* 7-Day Plan */}
          {sevenDayPlan.length > 0 && (
            <div className="glass-card" style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Calendar size={18} color="#2d8a4e" />
                7-Day Plan
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 12 }}>
                {sevenDayPlan.map((item, i) => (
                  <div key={i} style={{ padding: 12, background: '#f5f6f8', borderRadius: 8 }}>
                    <p style={{ fontSize: 10, fontWeight: 600, color: '#8aab96', marginBottom: 4 }}>Day {i + 1}</p>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#1a2e1a', marginBottom: 6 }}>{item.action || 'Monitor'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* History */}
          {irrigationHistory.length > 0 && (
            <div className="glass-card">
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Recent Irrigations</h3>
              <div style={{ fontSize: 12, color: '#1a2e1a', maxHeight: 300, overflowY: 'auto' }}>
                {irrigationHistory.slice(0, 10).map((log, i) => (
                  <div key={i} style={{ padding: 12, borderBottom: i < irrigationHistory.length - 1 ? '1px solid #d1e3bb' : 'none' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 80px 80px', gap: 12 }}>
                      <strong>{new Date(log.irrigated_date).toLocaleDateString()}</strong>
                      <span>{(log.water_used_liters || 0) / 1000}k L</span>
                      <span>{log.method}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
