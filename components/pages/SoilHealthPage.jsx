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
  const [weather, setWeather] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [profile])

  async function loadData() {
    setLoading(true)
    const { data: f } = await supabase.from('fields').select('*').order('created_at', { ascending: false })
    
    if (f?.length) {
      const weathers = {}
      for (const field of f) {
        if (field.city) {
          try {
            const w = await fetchWeather(field.city)
            weathers[field.id] = w
          } catch(err) { weathers[field.id] = null }
        }
      }
      setWeather(weathers)
    }
    setFields(f || [])
    setLoading(false)
  }

  const calculateScore = (f) => {
    let score = 0
    let recs = []
    
    // pH Evaluation (25%)
    const ph = f.soil_ph || 0
    if (ph >= 6.0 && ph <= 7.5) score += 25
    else if (ph > 0) recs.push({ key: 'phImbalance', solutionKey: ph < 6.0 ? 'phLowSol' : 'phHighSol' })
    
    // N Evaluation (20%)
    const n = f.nitrogen || 0
    if (n >= 40) score += 20
    else if (n > 0) recs.push({ key: 'nDeficiency', solutionKey: 'nSol' })

    // P Evaluation (15%)
    const p = f.phosphorus || 0
    if (p >= 25) score += 15
    else if (p > 0) recs.push({ key: 'pDeficiency', solutionKey: 'pSol' })

    // K Evaluation (15%)
    const k = f.potassium || 0
    if (k >= 30) score += 15
    else if (k > 0) recs.push({ key: 'kDeficiency', solutionKey: 'kSol' })

    // Moisture Evaluation (25%)
    const m = f.soil_moisture || 0
    if (m >= 55 && m <= 75) score += 25
    else if (m > 0) recs.push({ key: m < 55 ? 'lowMoisture' : 'highMoisture', solutionKey: m < 55 ? 'lowMoistureSol' : 'highMoistureSol' })

    if (score === 0 && (n===0 && p===0 && k===0 && ph===0 && m===0)) {
      score = 0; // completely empty field
    }
    
    return { score, recs }
  }

  const getHealthStatus = (score) => {
    if (score >= 80) return { label: 'Excellent', color: 'var(--green)', bg: 'var(--green-light)' }
    if (score >= 60) return { label: 'Good', color: '#16a34a', bg: '#dcfce7' }
    if (score >= 40) return { label: 'Fair', color: 'var(--amber)', bg: 'var(--amber-light)' }
    return { label: 'Poor', color: 'var(--red)', bg: 'var(--red-light)' }
  }

  const computedFields = fields.map(f => {
    const { score, recs } = calculateScore(f)
    return { ...f, healthScore: score, recs }
  })

  // Exclude empty fields from average calculation if they have 0 properties set
  const avgHealth = computedFields.length > 0 ? Math.round(
    computedFields.reduce((sum, f) => sum + f.healthScore, 0) / computedFields.length
  ) : 0

  const criticalCount = computedFields.filter(f => f.healthScore < 40 && f.healthScore > 0).length

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
            {t('soilHealthTitle')}
          </h1>
          <p className="page-sub">{t('soilHealthSub')}</p>
        </div>
      </div>

      {/* SUMMARY STATS */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        {[
          { label: t('avgSoilHealth'), value: `${avgHealth}/100`, status: getHealthStatus(avgHealth), icon: <Activity /> },
          { label: t('fieldMonitored'), value: `${fields.length}`, status: { color: 'var(--blue)', bg: '#ebf5ff' }, icon: <Sprout /> },
          { label: t('needsAttention'), value: `${criticalCount}`, status: { color: criticalCount > 0 ? 'var(--red)' : 'var(--green)', bg: criticalCount > 0 ? 'var(--red-light)' : 'var(--green-light)' }, icon: <FlaskConical /> },
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

      {/* FIELDS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 24 }}>
        {computedFields.map(field => {
          const status = getHealthStatus(field.healthScore)
          const w = weather[field.id]

          return (
            <div key={field.id} className="glass-card" style={{ borderColor: status.color, background: status.bg }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a2e1a', margin: 0, marginBottom: 4 }}>
                    🌾 {field.name}
                  </h3>
                  <p style={{ fontSize: 12, color: '#8aab96', margin: 0 }}>
                    {t(field.crop_type) || field.crop_type} · {field.area} ha
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
                  {field.healthScore}/100<br/>
                  <span style={{ fontSize: 10, fontWeight: 600 }}>{t(status.label.toLowerCase()) || status.label}</span>
                </div>
              </div>

              {/* Real-time Field Properties */}
              <div style={{ padding: 12, background: 'rgba(255,255,255,0.6)', borderRadius: 8, marginBottom: 12, border: '1px solid rgba(45,138,78,0.2)' }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: '#2d8a4e', marginBottom: 8, marginTop: 0 }}>📊 Real-Time Metrics:</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 11 }}>
                  <div>{t('moisturePct')}: <strong style={{ color: '#2d8a4e' }}>{field.soil_moisture || 0}%</strong></div>
                  <div>{t('phLevel')}: <strong style={{ color: '#2d8a4e' }}>{field.soil_ph || 0}</strong></div>
                  <div>{t('nitrogen')}: <strong style={{ color: '#2d8a4e' }}>{field.nitrogen || 0} ppm</strong></div>
                  <div>{t('phosphorus')}: <strong style={{ color: '#2d8a4e' }}>{field.phosphorus || 0} ppm</strong></div>
                  <div>{t('potassium')}: <strong style={{ color: '#2d8a4e' }}>{field.potassium || 0} ppm</strong></div>
                  <div>{t('tempC')}: <strong style={{ color: '#2d8a4e' }}>{w?.current?.temperature || 'N/A'}°C</strong></div>
                </div>
              </div>

              {/* Recommendations generated real-time from Exact Parameters */}
              <div style={{ borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: 12 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#8aab96', marginBottom: 8 }}>📋 {t('recommendations')}:</p>
                {field.recs.length > 0 ? field.recs.map((rec, i) => (
                  <div key={i} style={{ padding: 8, background: '#fef3cd', borderRadius: 6, marginBottom: 6, fontSize: 11, color: '#8a6d47' }}>
                    <p style={{ margin: 0, fontWeight: 600 }}>{t(rec.key)}</p>
                    <p style={{ margin: '4px 0 0 0', fontSize: 10 }}>{t(rec.solutionKey)}</p>
                  </div>
                )) : (
                  <p style={{ fontSize: 11, color: '#2d8a4e', fontWeight: 600 }}>{t('balancedField')}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>


    </div>
  )
}
