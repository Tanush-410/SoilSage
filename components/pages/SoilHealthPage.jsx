'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { useTranslation } from '@/lib/i18n'
import { calculateSoilHealthFromObservations, calculateComprehensiveSoilHealth, NUTRIENT_DEFICIENCY_GUIDE, CROP_IRRIGATION_SCHEDULE } from '@/lib/no-sensor-advisor'
import { fetchWeather } from '@/lib/weather'
import SoilObservationForm from '../SoilObservationForm'
import { Activity, Loader2, Sprout, FlaskConical, AlertCircle, CheckCircle, Leaf, Cloud, Droplets } from 'lucide-react'

export default function SoilHealthPage() {
  const { profile } = useAuth()
  const { t } = useTranslation()
  const [fields, setFields] = useState([])
  const [observations, setObservations] = useState({})
  const [weather, setWeather] = useState({})
  const [irrigationHistory, setIrrigationHistory] = useState({})
  const [recentRainfall, setRecentRainfall] = useState({})
  const [loading, setLoading] = useState(true)
  const [healthScores, setHealthScores] = useState({})

  useEffect(() => { loadData() }, [profile])

  async function loadData() {
    // Load fields
    const { data: f } = await supabase.from('fields').select('*').order('created_at', { ascending: false })
    setFields(f || [])

    if (f?.length) {
      const obs = {}
      const weatherData = {}
      const irrigHistory = {}
      const rainfall = {}
      const scores = {}

      for (const field of f) {
        // Load latest soil observations
        const { data: fieldObs } = await supabase
          .from('field_observations')
          .select('*')
          .eq('field_id', field.id)
          .eq('observation_type', 'soil_health')
          .order('observation_date', { ascending: false })
          .limit(1)
        
        if (fieldObs?.length) {
          obs[field.id] = fieldObs[0]
        } else {
          // Create mock observation if none exists
          obs[field.id] = {
            color: 'brown',
            texture: 'loamy',
            drainage: 'good',
            organic_matter: 'moderate',
            compaction: 'medium',
            earthworm_level: 'moderate',
            surface_crust: false
          }
        }

        // Load irrigation history
        const { data: irrig } = await supabase
          .from('irrigation_log')
          .select('*')
          .eq('field_id', field.id)
          .order('irrigated_date', { ascending: false })
          .limit(10)
        
        irrigHistory[field.id] = irrig || []

        // Fetch weather for field location
        if (field.city) {
          try {
            const w = await fetchWeather(field.city)
            weatherData[field.id] = w
            
            // Calculate recent rainfall (mm from last 7 days)
            const recentRain = w?.daily?.slice(0, 7).reduce((sum, d) => sum + (d.rainSum || 0), 0) || 0
            rainfall[field.id] = recentRain
          } catch (err) {
            console.log('Weather fetch failed, using mock')
            weatherData[field.id] = { current: { temperature: 25, humidity: 60 }, daily: [] }
            rainfall[field.id] = 0
          }
        }

        // Calculate comprehensive soil health
        try {
          const obData = obs[field.id]
          const compScore = calculateComprehensiveSoilHealth(
            obData,
            weatherData[field.id] || { current: { temperature: 25, humidity: 60 } },
            irrigHistory[field.id],
            field.region || 'Maharashtra',
            rainfall[field.id] || 0
          )
          scores[field.id] = compScore
        } catch (err) {
          console.log('Health calculation error:', err)
          // Fallback to simple calculation
          const simpleScore = calculateSoilHealthFromObservations(obs[field.id], field.region || 'Maharashtra')
          scores[field.id] = { overallScore: simpleScore.overallScore }
        }
      }

      setObservations(obs)
      setWeather(weatherData)
      setIrrigationHistory(irrigHistory)
      setRecentRainfall(rainfall)
      setHealthScores(scores)
    }

    setLoading(false)
  }

  const getHealthStatus = (score) => {
    if (score >= 80) return { label: 'Excellent', color: 'var(--green)', bg: 'var(--green-light)' }
    if (score >= 60) return { label: 'Good', color: '#16a34a', bg: '#dcfce7' }
    if (score >= 40) return { label: 'Fair', color: 'var(--amber)', bg: 'var(--amber-light)' }
    return { label: 'Poor', color: 'var(--red)', bg: 'var(--red-light)' }
  }

  const getRecommendations = (field, fieldScore) => {
    const recs = []
    const obs = observations[field.id]
    
    if (!fieldScore) return recs

    // Compound recommendations from comprehensive score
    if (fieldScore.recommendations) {
      recs.push(...fieldScore.recommendations.map((rec, i) => ({
        name: `Recommendation ${i + 1}`,
        solution: rec,
        priority: i === 0 ? 'high' : 'medium'
      })))
    }

    const nutrients = obs?.estimated_nitrogen ? [
      { name: 'Nitrogen', value: obs.estimated_nitrogen, key: 'nitrogen' },
      { name: 'Phosphorus', value: obs.estimated_phosphorus, key: 'phosphorus' },
      { name: 'Potassium', value: obs.estimated_potassium, key: 'potassium' }
    ] : []

    // Nutrient deficiency detection
    nutrients.forEach(nut => {
      if (nut.key === 'nitrogen' && nut.value < 150) {
        recs.push(NUTRIENT_DEFICIENCY_GUIDE.nitrogen)
      } else if (nut.key === 'phosphorus' && nut.value < 20) {
        recs.push(NUTRIENT_DEFICIENCY_GUIDE.phosphorus)
      } else if (nut.key === 'potassium' && nut.value < 100) {
        recs.push(NUTRIENT_DEFICIENCY_GUIDE.potassium)
      }
    })

    // Observation-based recommendations
    if (obs?.organic_matter === 'low') {
      recs.push({
        name: 'Low Organic Matter',
        solution: 'Add 15-20 tonnes FYM/ha or grow green manure crop',
        cost: '₹2,000-3,000/ha'
      })
    }
    if (obs?.compaction === 'hard') {
      recs.push({
        name: 'Soil Compaction',
        solution: 'Deep plowing (35-40cm) followed by harrowing',
        cost: '₹3,000-5,000/ha'
      })
    }
    if (obs?.drainage === 'poor') {
      recs.push({
        name: 'Poor Drainage',
        solution: 'Install drain tiles or raise field beds',
        cost: '₹5,000-8,000/ha'
      })
    }

    return recs.slice(0, 5) // Top 5 recommendations
  }

  const avgHealth = Object.values(healthScores).length > 0
    ? Math.round(
        Object.values(healthScores)
          .filter(s => s?.overallScore)
          .reduce((sum, s) => sum + s.overallScore, 0) /
        Object.values(healthScores).filter(s => s?.overallScore).length
      )
    : 0

  const criticalCount = Object.values(healthScores).filter(
    s => s?.overallScore && s.overallScore < 40
  ).length

  if (loading) {
    return <div className="center-loader"><Loader2 size={40} className="spin" /></div>
  }

  if (fields.length === 0) {
    return (
      <div className="page">
        <div className="empty-page">
          <Activity size={64} />
          <h2>No Fields Found</h2>
          <p>Add fields in "My Fields" to start soil health monitoring.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Activity size={22} color="var(--green)" />
            Soil Health (No Sensors Needed)
          </h1>
          <p className="page-sub">Visual observations + regional data + AI analysis</p>
        </div>
      </div>

      {/* SUMMARY STATS */}
      {Object.values(observations).length > 0 && (
        <div className="stats-grid" style={{ marginBottom: 24 }}>
          {[
            { label: 'Avg. Soil Health', value: `${avgHealth}/100`, status: getHealthStatus(avgHealth), icon: <Activity /> },
            { label: 'Fields Monitored', value: `${fields.length}`, status: { color: 'var(--blue)' }, icon: <Sprout /> },
            { label: 'Needs Attention', value: `${criticalCount}`, status: { color: criticalCount > 0 ? 'var(--red)' : 'var(--green)' }, icon: <FlaskConical /> },
          ].map(({ label, value, status, icon }) => (
            <div key={label} className="stat-card" style={{ background: status.bg }}>
              <div className="stat-icon" style={{ color: status.color }}>{icon}</div>
              <div className="stat-content">
                <p className="stat-label">{label}</p>
                <p className="stat-value" style={{ color: status.color }}>{value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FIELDS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 24 }}>
        {fields.map(field => {
          const obs = observations[field.id]
          const fieldScore = healthScores[field.id]
          const score = fieldScore?.overallScore || 0
          const status = getHealthStatus(score)
          const recs = getRecommendations(field, fieldScore)
          const w = weather[field.id]
          const rainfall = recentRainfall[field.id] || 0

          return (
            <div key={field.id} className="glass-card" style={{ borderColor: status.color, background: status.bg }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a2e1a', margin: 0, marginBottom: 4 }}>
                    🌾 {field.name}
                  </h3>
                  <p style={{ fontSize: 12, color: '#8aab96', margin: 0 }}>
                    {field.crop_type} · {field.area} ha
                  </p>
                </div>
                <div style={{ 
                  padding: '8px 12px', 
                  background: status.color, 
                  color: 'white', 
                  borderRadius: 6, 
                  fontWeight: 700, 
                  fontSize: 14,
                  textAlign: 'center'
                }}>
                  {Math.round(score)}/100<br/>
                  <span style={{ fontSize: 10, fontWeight: 600 }}>{status.label}</span>
                </div>
              </div>

              {/* Comprehensive Score Breakdown */}
              {fieldScore && (
                <div style={{ padding: 12, background: 'rgba(255,255,255,0.6)', borderRadius: 8, marginBottom: 12, border: '1px solid rgba(45,138,78,0.2)' }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: '#2d8a4e', marginBottom: 8, marginTop: 0 }}>📊 Score Factors:</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 11 }}>
                    <div>Observations: <strong style={{ color: '#2d8a4e' }}>{Math.round(fieldScore.baseObservationScore || 0)}</strong></div>
                    <div>Weather: <strong style={{ color: '#2d8a4e' }}>{Math.round(fieldScore.weatherImpactScore || 0)}</strong></div>
                    <div>Irrigation: <strong style={{ color: '#2d8a4e' }}>{Math.round(fieldScore.irrigationHealthScore || 0)}</strong></div>
                    <div>Climate: <strong style={{ color: '#2d8a4e' }}>{Math.round(fieldScore.climateStressScore || 0)}</strong></div>
                  </div>
                </div>
              )}

              {/* Weather & Climate Info */}
              {(w || rainfall > 0) && (
                <div style={{ padding: 12, background: 'rgba(100,200,255,0.1)', borderRadius: 8, marginBottom: 12, border: '1px solid rgba(100,150,255,0.2)' }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: '#0066cc', marginBottom: 8, marginTop: 0 }}>☀️ Weather Impact:</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 11 }}>
                    <div>Temp: <strong>{w?.current?.temperature || 'N/A'}°C</strong></div>
                    <div>Humidity: <strong>{w?.current?.humidity || 'N/A'}%</strong></div>
                    <div>Recent Rain: <strong>{rainfall}mm</strong></div>
                    <div>Assessment: <strong>{rainfall > 50 ? '✓ Good' : rainfall > 20 ? '◐ Moderate' : '✗ Dry'}</strong></div>
                  </div>
                </div>
              )}

              {obs ? (
                <>
                  {/* Observations */}
                  <div style={{ padding: 12, background: 'rgba(255,255,255,0.5)', borderRadius: 8, marginBottom: 12 }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: '#8aab96', marginBottom: 8 }}>Last Observation:</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 11, color: '#1a2e1a' }}>
                      <div>🌱 Color: <strong>{obs.color?.replace(/_/g, ' ')}</strong></div>
                      <div>🟫 Texture: <strong>{obs.texture?.replace(/_/g, ' ')}</strong></div>
                      <div>💧 Drainage: <strong>{obs.drainage}</strong></div>
                      <div>♻️ OM: <strong>{obs.organic_matter}</strong></div>
                      <div>⛏️ Compaction: <strong>{obs.compaction}</strong></div>
                      <div>🪱 Earthworms: <strong>{obs.earthworm_level}</strong></div>
                    </div>
                  </div>

                  {/* Estimated Nutrients */}
                  {obs.estimated_nitrogen && (
                    <div style={{ padding: 12, background: 'rgba(0,200,122,0.1)', borderRadius: 8, marginBottom: 12, border: '1px solid rgba(0,200,122,0.2)' }}>
                      <p style={{ fontSize: 11, fontWeight: 600, color: '#2d8a4e', marginBottom: 8 }}>Estimated Nutrients:</p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, fontSize: 12 }}>
                        <div style={{ textAlign: 'center' }}>
                          <p style={{ margin: 0, color: '#8aab96', fontSize: 10, fontWeight: 600 }}>Nitrogen</p>
                          <p style={{ margin: 0, color: '#2d8a4e', fontWeight: 800 }}>{obs.estimated_nitrogen} ppm</p>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <p style={{ margin: 0, color: '#8aab96', fontSize: 10, fontWeight: 600 }}>Phosphorus</p>
                          <p style={{ margin: 0, color: '#2d8a4e', fontWeight: 800 }}>{obs.estimated_phosphorus} ppm</p>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <p style={{ margin: 0, color: '#8aab96', fontSize: 10, fontWeight: 600 }}>Potassium</p>
                          <p style={{ margin: 0, color: '#2d8a4e', fontWeight: 800 }}>{obs.estimated_potassium} ppm</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {recs.length > 0 && (
                    <div style={{ borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: 12 }}>
                      <p style={{ fontSize: 11, fontWeight: 600, color: '#8aab96', marginBottom: 8 }}>📋 Recommendations:</p>
                      {recs.map((rec, i) => (
                        <div key={i} style={{ padding: 8, background: '#fef3cd', borderRadius: 6, marginBottom: 6, fontSize: 11, color: '#8a6d47' }}>
                          <p style={{ margin: 0, fontWeight: 600 }}>{rec.name || rec.solution}</p>
                          {rec.solution && <p style={{ margin: '4px 0 0 0', fontSize: 10 }}>{rec.solution}</p>}
                          {rec.cost && <p style={{ margin: '2px 0 0 0', fontSize: 9, opacity: 0.7 }}>💰 {rec.cost}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <p style={{ color: '#8aab96', textAlign: 'center', padding: 16, fontSize: 13 }}>
                  No soil observations yet. Add one using the form below.
                </p>
              )}
            </div>
          )
        })}
      </div>

      {/* OBSERVATION FORM */}
      <div style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1a2e1a', marginBottom: 16 }}>
          ➕ Add New Soil Observation
        </h2>
        {fields[0] && (
          <SoilObservationForm 
            fieldId={fields[0].id} 
            region={profile?.location || 'default'} 
            onSaved={() => loadData()}
          />
        )}
      </div>
    </div>
  )
}
