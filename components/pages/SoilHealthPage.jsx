'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useTranslation } from '../../lib/i18n'
import { Activity, Loader2, Sprout, Droplets, FlaskConical } from 'lucide-react'

function soilScore(f) {
  const ph = parseFloat(f.soil_ph) || 6.5
  const n = parseFloat(f.nitrogen) || 40
  const p = parseFloat(f.phosphorus) || 30
  const k = parseFloat(f.potassium) || 35
  const m = parseFloat(f.soil_moisture) || 60

  const phScore = (ph >= 6.0 && ph <= 7.5) ? 100 : (ph >= 5.5 && ph <= 8.0) ? 65 : 30
  const nScore = Math.min(100, (n / 60) * 100)
  const pScore = Math.min(100, (p / 45) * 100)
  const kScore = Math.min(100, (k / 50) * 100)
  const mScore = (m >= 40 && m <= 70) ? 100 : (m >= 25 && m <= 85) ? 60 : 25
  const total = Math.round(phScore * 0.30 + nScore * 0.25 + pScore * 0.20 + kScore * 0.15 + mScore * 0.10)
  return { total, phScore: Math.round(phScore), nScore: Math.round(nScore), pScore: Math.round(pScore), kScore: Math.round(kScore), mScore: Math.round(mScore) }
}

function healthColor(score) {
  if (score >= 80) return { color: 'var(--green)', bg: 'var(--green-light)', label: 'Excellent' }
  if (score >= 60) return { color: '#16a34a', bg: '#dcfce7', label: 'Good' }
  if (score >= 40) return { color: 'var(--amber)', bg: 'var(--amber-light)', label: 'Fair' }
  return { color: 'var(--red)', bg: 'var(--red-light)', label: 'Poor' }
}

function recommendations(f) {
  const recs = []
  const ph = parseFloat(f.soil_ph) || 6.5
  const n = parseFloat(f.nitrogen) || 40
  const p = parseFloat(f.phosphorus) || 30
  const k = parseFloat(f.potassium) || 35
  const m = parseFloat(f.soil_moisture) || 60

  if (ph < 6.0) recs.push('🧪 Add agricultural lime to raise pH above 6.0')
  else if (ph > 7.5) recs.push('🧪 Add sulfur or acidic fertilizer to lower pH below 7.5')
  if (n < 30) recs.push('🌿 Apply nitrogen-rich fertilizer (Urea/DAP) — Nitrogen is critically low')
  else if (n < 40) recs.push('🌿 Moderate nitrogen application recommended — slightly deficient')
  if (p < 20) recs.push('🟠 Apply phosphorus fertilizer (SSP/DAP) — Phosphorus critically low')
  else if (p < 30) recs.push('🟠 Boost phosphorus — slightly below optimal')
  if (k < 25) recs.push('🟡 Add potash fertilizer (MOP) — Potassium is low')
  if (m < 30) recs.push('💧 Irrigation urgently needed — soil moisture critically low')
  else if (m > 80) recs.push('⚠️ Reduce irrigation — waterlogging risk detected')
  if (recs.length === 0) recs.push('✅ Soil health is optimal — maintain current management practices')
  return recs
}

export default function SoilHealthPage() {
  const { t } = useTranslation()
  const [fields, setFields] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('fields').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      setFields(data || [])
      setLoading(false)
    })
  }, [])

  const scores = fields.map(f => ({ ...f, score: soilScore(f) }))
  const avgHealth = scores.length ? Math.round(scores.reduce((s, f) => s + f.score.total, 0) / scores.length) : 0
  const criticalCount = scores.filter(f => f.score.total < 40).length

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title"><Activity size={22} style={{ display: 'inline', marginRight: 8, color: 'var(--green)' }} />{t('soilHealth')}</h1>
          <p className="page-sub">Per-field soil health analysis · pH · NPK · Moisture · Actionable recommendations</p>
        </div>
      </div>

      {!loading && fields.length > 0 && (
        <div className="stats-grid" style={{ marginBottom: 24 }}>
          {[
            { label: 'Avg. Soil Health', value: `${avgHealth}/100`, color: healthColor(avgHealth).color, bg: healthColor(avgHealth).bg, icon: <Activity /> },
            { label: 'Fields Monitored', value: `${fields.length}`, color: 'var(--blue)', bg: 'var(--blue-light)', icon: <Sprout /> },
            { label: 'Needs Attention', value: `${criticalCount}`, color: criticalCount > 0 ? 'var(--red)' : 'var(--green)', bg: criticalCount > 0 ? 'var(--red-light)' : 'var(--green-light)', icon: <FlaskConical /> },
          ].map(({ label, value, color, bg, icon }) => (
            <div key={label} className="stat-card" style={{ background: bg, border: `1px solid ${color}30` }}>
              <div className="stat-icon" style={{ color }}>{icon}</div>
              <div className="stat-content"><p className="stat-label">{label}</p><p className="stat-value" style={{ color }}>{value}</p></div>
            </div>
          ))}
        </div>
      )}

      {loading ? <div className="center-loader"><Loader2 size={40} className="spin" /></div>
        : fields.length === 0 ? (
          <div className="empty-page"><Activity size={64} /><h2>No Fields Found</h2><p>Add fields in "My Fields" to see soil health analysis.</p></div>
        ) : (
          <div className="fields-grid">
            {scores.map(f => {
              const s = f.score
              const { color, bg, label } = healthColor(s.total)
              const recs = recommendations(f)
              return (
                <div key={f.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Sprout size={18} color="var(--green)" />
                      <div>
                        <h3 style={{ fontSize: 16, fontWeight: 800 }}>{f.name}</h3>
                        <span style={{ fontSize: 12, color: 'var(--text2)' }}>{f.crop_type} · {f.area_hectares}ha</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 28, fontWeight: 900, color }}>{s.total}</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color, background: bg, padding: '2px 8px', borderRadius: 6 }}>{label}</div>
                    </div>
                  </div>

                  {/* Overall bar */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, color }}>Overall Soil Health</span>
                      <span style={{ fontWeight: 800, color }}>{s.total}/100</span>
                    </div>
                    <div style={{ height: 10, background: 'var(--bg2)', borderRadius: 5, overflow: 'hidden' }}>
                      <div style={{ width: `${s.total}%`, height: '100%', background: color, borderRadius: 5, transition: 'width 0.5s ease' }} />
                    </div>
                  </div>

                  {/* Individual metric bars */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: `pH Score (${f.soil_ph || 6.5})`, score: s.phScore, weight: '30%', ideal: '6.0–7.5' },
                      { label: `Nitrogen (${f.nitrogen || 40}ppm)`, score: s.nScore, weight: '25%', ideal: '≥60ppm' },
                      { label: `Phosphorus (${f.phosphorus || 30}ppm)`, score: s.pScore, weight: '20%', ideal: '≥45ppm' },
                      { label: `Potassium (${f.potassium || 35}ppm)`, score: s.kScore, weight: '15%', ideal: '≥50ppm' },
                      { label: `Moisture (${f.soil_moisture || 60}%)`, score: s.mScore, weight: '10%', ideal: '40–70%' },
                    ].map(({ label, score, weight, ideal }) => {
                      const c = score >= 80 ? 'var(--green)' : score >= 50 ? 'var(--amber)' : 'var(--red)'
                      return (
                        <div key={label}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
                            <span style={{ color: 'var(--text2)' }}>{label} <span style={{ fontSize: 10, color: 'var(--text3)' }}>({weight})</span></span>
                            <span style={{ color: c, fontWeight: 700 }}>{score}% <span style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 400 }}>Ideal: {ideal}</span></span>
                          </div>
                          <div style={{ height: 6, background: 'var(--bg2)', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ width: `${score}%`, height: '100%', background: c, borderRadius: 3 }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Recommendations */}
                  <div style={{ borderTop: '1px solid var(--border2)', paddingTop: 12 }}>
                    <p style={{ fontSize: 11, fontWeight: 800, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Recommendations</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {recs.map((r, i) => (
                        <div key={i} style={{ fontSize: 12, padding: '6px 10px', background: 'var(--bg2)', borderRadius: 8, borderLeft: `3px solid ${color}` }}>{r}</div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
    </div>
  )
}
