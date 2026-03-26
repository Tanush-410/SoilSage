'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { fetchWeather, geocodeCity } from '../../lib/weather'
import { getPestPrediction } from '../../lib/ml-client'
import { getAllCrops } from '../../lib/crops'
import { PEST_DATABASE, SEVERITY_COLORS } from '../../lib/pest-database'
import { useAuth } from '../../context/AuthContext'
import { useTranslation } from '../../lib/i18n'
import { Bug, Loader2, Sprout, Droplets, Thermometer } from 'lucide-react'

export default function PestControlPage() {
  const { profile } = useAuth()
  const { t } = useTranslation()
  const [tab, setTab] = useState('overview')
  const [fields, setFields] = useState([])
  const [weather, setWeather] = useState(null)
  const [pestResults, setPestResults] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadAll() }, [profile])

  async function loadAll() {
    setLoading(true)
    try {
      const { data: f } = await supabase.from('fields').select('*')
      setFields(f || [])
      const geo = await geocodeCity(profile?.location || 'New Delhi')
      const w = await fetchWeather(geo?.latitude || 28.6, geo?.longitude || 77.2)
      setWeather(w)
      const allCrops = getAllCrops()
      setPestResults((f || []).map(field => {
        const cropObj = allCrops.find(c => c.name === field.crop_type) || { name: field.crop_type, waterNeed: 'medium' }
        return { field, pest: getPestPrediction({ crop: cropObj, soilData: { moisture: parseFloat(field.soil_moisture) || 60, growthStage: field.growth_stage || 'Vegetative' }, weather: w }) }
      }))
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const criticalCount = PEST_DATABASE.filter(p => p.severity === 'critical').length
  const highCount = PEST_DATABASE.filter(p => p.severity === 'high').length
  const mediumCount = PEST_DATABASE.filter(p => p.severity === 'medium').length
  const highRiskFields = pestResults.filter(r => r.pest?.pestAlertCode >= 2).length

  const SeverityBadge = ({ s }) => {
    const sc = SEVERITY_COLORS[s] || SEVERITY_COLORS.medium
    return <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 6, background: sc.bg, color: sc.color }}>{sc.label}</span>
  }

  const TABS = [
    { id: 'overview', label: t('tabPestOverview') },
    { id: 'directory', label: t('tabDirectory') },
    { id: 'treatment', label: t('tabTreatment') },
    { id: 'detected', label: t('tabDetected') },
  ]

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title"><Bug size={22} style={{ display: 'inline', marginRight: 8, color: 'var(--amber)' }} />{t('pestMonitorTitle')}</h1>
          <p className="page-sub">{t('pestMonitorSub')}</p>
        </div>
        <button className="btn-primary" onClick={loadAll} disabled={loading}>{loading ? <><Loader2 size={14} className="spin" /> {t('refreshing')}</> : t('refresh')}</button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {TABS.map(tb => (
          <button key={tb.id} onClick={() => setTab(tb.id)} style={{ padding: '9px 18px', borderRadius: 10, border: tab === tb.id ? 'none' : '1px solid var(--border2)', cursor: 'pointer', fontWeight: 700, fontSize: 13, background: tab === tb.id ? 'var(--green)' : 'var(--bg2)', color: tab === tb.id ? '#fff' : 'var(--text2)', transition: 'all 0.2s' }}>
            {tb.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {tab === 'overview' && (
        <>
          <div className="glass-card" style={{ marginBottom: 20 }}>
            <div className="card-header"><h3>🎯 {t('riskAssessment')}</h3></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
              {[
                { label: t('criticalLabel'), count: criticalCount, color: '#dc2626', bg: '#fee2e2' },
                { label: t('highLabel'), count: highCount, color: '#ea580c', bg: '#ffedd5' },
                { label: t('mediumLabel'), count: mediumCount, color: '#ca8a04', bg: '#fef9c3' },
              ].map(({ label, count, color, bg }) => (
                <div key={label} style={{ background: bg, border: `1px solid ${color}30`, borderRadius: 12, padding: '16px 20px' }}>
                  <p style={{ fontSize: 12, color, fontWeight: 700, marginBottom: 6 }}>{label}</p>
                  <p style={{ fontSize: 40, fontWeight: 900, color, lineHeight: 1 }}>{count}</p>
                  <p style={{ fontSize: 11, color, marginTop: 4 }}>{t('pestsLabel')}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-card">
            <div className="card-header"><h3>⚡ {t('quickFacts')}</h3></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[
                [t('totalCoveredPests'), PEST_DATABASE.length, t('commonPestsIndia'), 'var(--blue)'],
                [t('comprehensiveTreatments'), '3x', t('perPest'), 'var(--green)'],
                [t('atRiskFields'), loading ? '—' : highRiskFields, t('basedOnLiveWeather'), highRiskFields > 0 ? 'var(--red)' : 'var(--green)'],
                [t('currentHumidity'), weather ? `${weather.current?.humidity}%` : '—', weather?.current?.humidity > 80 ? `⚠️ ${t('highLabel')} — ${t('riskLevel')}` : 'Normal', 'var(--blue)'],
              ].map(([k, v, sub, col]) => (
                <div key={k} style={{ padding: '14px 16px', background: 'var(--bg2)', borderRadius: 12 }}>
                  <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 6 }}>{k}</p>
                  <p style={{ fontSize: 28, fontWeight: 900, color: col }}>{v}</p>
                  <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* PEST DIRECTORY TAB */}
      {tab === 'directory' && (
        <div className="fields-grid">
          {PEST_DATABASE.map(pest => (
            <div key={pest.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: 12, border: `1.5px solid ${SEVERITY_COLORS[pest.severity]?.color}25`, cursor: 'pointer' }} onClick={() => setTab('treatment')}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800 }}>{pest.emoji} {pest.name}</h3>
                  <p style={{ fontSize: 11, color: 'var(--text3)', fontStyle: 'italic' }}>{pest.scientific}</p>
                  <p style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>{pest.description}</p>
                </div>
                <SeverityBadge s={pest.severity} />
              </div>
              <div>
                <p style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 700, marginBottom: 6 }}>{t('affectsCrops')}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {pest.affectedCrops.map(c => <span key={c} style={{ fontSize: 11, padding: '2px 8px', background: 'var(--bg2)', borderRadius: 6, color: 'var(--text2)', fontWeight: 600 }}>{c}</span>)}
                </div>
              </div>
              <div style={{ padding: '8px 10px', background: 'var(--amber-light)', borderRadius: 8, fontSize: 12, color: 'var(--amber)', borderLeft: '3px solid var(--amber)' }}>
                ⚠️ {t('riskConditions')} {pest.riskConditions}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TREATMENT GUIDE TAB */}
      {tab === 'treatment' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {PEST_DATABASE.map(pest => (
            <div key={pest.id} className="glass-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <h3 style={{ fontSize: 17, fontWeight: 800 }}>{pest.emoji} {pest.name}</h3>
                <SeverityBadge s={pest.severity} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 14 }}>
                {[
                  { key: 'organic', label: `🌿 ${t('organicLabel')}: ${pest.treatment.organic.name}`, color: '#16a34a', bg: '#f0fdf4', border: '#86efac' },
                  { key: 'chemical', label: `⚗️ ${t('chemicalLabel')}: ${pest.treatment.chemical.name}`, color: '#ea580c', bg: '#fff7ed', border: '#fed7aa' },
                  { key: 'bioagent', label: `🔵 ${t('bioagentLabel')}: ${pest.treatment.bioagent.name}`, color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
                ].map(({ key, label, color, bg, border }) => {
                  const tr = pest.treatment[key]
                  return (
                    <div key={key} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 12, padding: '14px' }}>
                      <p style={{ fontSize: 12, fontWeight: 800, color, marginBottom: 10 }}>{label}</p>
                      <p style={{ fontSize: 11, color: '#374151', fontWeight: 700, marginBottom: 5 }}>{t('stepsLabel')}</p>
                      {tr.steps.map((s, i) => <p key={i} style={{ fontSize: 11, color: '#374151', marginBottom: 3 }}>{i + 1}. {s}</p>)}
                      <div style={{ marginTop: 10, display: 'flex', gap: 12 }}>
                        <span style={{ fontSize: 11, color }}><strong>💰 {t('cost')}</strong> {tr.cost}</span>
                        <span style={{ fontSize: 11, color }}><strong>⏱ {t('treatmentTime')}</strong> {tr.time}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ padding: '10px 14px', background: 'var(--green-light)', borderRadius: 10 }}>
                  <p style={{ fontSize: 11, fontWeight: 800, color: 'var(--green)', marginBottom: 4 }}>✅ {t('preventiveMeasures')}</p>
                  <p style={{ fontSize: 12, color: 'var(--text2)' }}>{pest.preventive}</p>
                </div>
                <div style={{ padding: '10px 14px', background: 'var(--bg2)', borderRadius: 10 }}>
                  <p style={{ fontSize: 11, fontWeight: 800, color: 'var(--text2)', marginBottom: 4 }}>🔍 {t('pestIndicators')}</p>
                  <p style={{ fontSize: 12, color: 'var(--text2)' }}>{pest.indicators}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DETECTED PESTS TAB */}
      {tab === 'detected' && (
        <>
          {weather && (
            <div className="glass-card" style={{ marginBottom: 20, padding: '14px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div className="live-indicator">{t('liveBadge')}</div>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text2)' }}>{t('weatherPestNote')} — {profile?.location || 'Your Location'}</span>
              </div>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {[
                  { label: t('humidity'), value: `${weather.current.humidity}%`, alert: weather.current.humidity > 80, icon: <Droplets size={13} /> },
                  { label: t('temp'), value: `${weather.current.temperature?.toFixed(1)}°C`, alert: weather.current.temperature > 32, icon: <Thermometer size={13} /> },
                  { label: t('rain'), value: `${weather.current.rain}mm`, alert: false, icon: '🌧️' },
                ].map(({ label, value, alert, icon }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: alert ? 'var(--amber-light)' : 'var(--bg2)', borderRadius: 8, border: alert ? '1px solid var(--amber)' : '1px solid var(--border2)' }}>
                    <span style={{ color: alert ? 'var(--amber)' : 'var(--text3)' }}>{icon}</span>
                    <span style={{ fontSize: 12, color: 'var(--text2)' }}>{label}:</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: alert ? 'var(--amber)' : 'var(--text)' }}>{value}</span>
                    {alert && <span>⚠️</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
          {loading ? <div className="center-loader"><Loader2 size={40} className="spin" /></div>
            : fields.length === 0 ? <div className="empty-page"><Bug size={64} /><h2>{t('noFieldsYet')}</h2><p>{t('pestEmptyDesc')}</p></div>
            : (
              <div className="fields-grid">
                {pestResults.map(({ field, pest }) => {
                  if (!pest) return null
                  const code = pest.pestAlertCode
                  const color = code >= 3 ? 'var(--red)' : code >= 2 ? 'var(--amber)' : code >= 1 ? '#f59e0b' : 'var(--green)'
                  const bg = code >= 3 ? 'var(--red-light)' : code >= 2 ? 'var(--amber-light)' : code >= 1 ? '#fef9c3' : 'var(--green-light)'
                  const matchedPests = PEST_DATABASE.filter(p => p.affectedCrops.some(c => c.toLowerCase() === field.crop_type?.toLowerCase()))
                  return (
                    <div key={field.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: 12, border: code >= 2 ? `1.5px solid ${color}` : undefined }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Sprout size={18} color="var(--green)" />
                          <div>
                            <h3 style={{ fontSize: 16, fontWeight: 800 }}>{field.name}</h3>
                            <span style={{ fontSize: 12, color: 'var(--text2)' }}>{field.crop_type} · {field.area_hectares}ha</span>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', padding: '8px 14px', background: bg, borderRadius: 10 }}>
                          <div style={{ fontSize: 22, fontWeight: 900, color }}>{pest.pestRiskScore}<span style={{ fontSize: 12 }}>/10</span></div>
                          <div style={{ fontSize: 11, fontWeight: 800, color }}>{pest.pestRiskLevel.toUpperCase()}</div>
                        </div>
                      </div>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                          <span style={{ color: 'var(--text2)' }}>{t('riskLevel')}</span>
                          <span style={{ color, fontWeight: 700 }}>{pest.monitoringFrequency}</span>
                        </div>
                        <div style={{ height: 8, background: 'var(--bg2)', borderRadius: 4, overflow: 'hidden' }}><div style={{ width: `${(pest.pestRiskScore / 10) * 100}%`, height: '100%', background: color, borderRadius: 4 }} /></div>
                      </div>
                      {matchedPests.length > 0 && (
                        <div>
                          <p style={{ fontSize: 11, fontWeight: 800, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>{t('susceptibleTo')}</p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                            {matchedPests.map(p => {
                              const sc = SEVERITY_COLORS[p.severity]
                              return <span key={p.id} style={{ fontSize: 11, padding: '3px 8px', background: sc.bg, color: sc.color, borderRadius: 6, fontWeight: 700 }}>{p.emoji} {p.name}</span>
                            })}
                          </div>
                        </div>
                      )}
                      {pest.recommendations?.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                          {pest.recommendations.map((r, i) => <div key={i} style={{ fontSize: 12, padding: '6px 10px', background: 'var(--bg2)', borderRadius: 8, borderLeft: `3px solid ${color}` }}>{r}</div>)}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
        </>
      )}
    </div>
  )
}
