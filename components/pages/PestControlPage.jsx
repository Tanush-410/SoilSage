'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { fetchWeather, geocodeCity } from '../../lib/weather'
import { getPestPrediction } from '../../lib/ml-client'
import { getAllCrops } from '../../lib/crops'
import { useAuth } from '../../context/AuthContext'
import { useTranslation } from '../../lib/i18n'
import { Bug, Loader2, Sprout, Droplets, Thermometer, Wind, AlertTriangle } from 'lucide-react'

export default function PestControlPage() {
  const { profile } = useAuth()
  const { t } = useTranslation()
  const [fields, setFields] = useState([])
  const [weather, setWeather] = useState(null)
  const [pestResults, setPestResults] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadAll() }, [profile])

  async function loadAll() {
    setLoading(true)
    try {
      const { data: f } = await supabase.from('fields').select('*').order('created_at', { ascending: false })
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

  const highRisk = pestResults.filter(r => r.pest?.pestAlertCode >= 2).length
  const riskColor = c => c >= 3 ? 'var(--red)' : c >= 2 ? 'var(--amber)' : c >= 1 ? '#f59e0b' : 'var(--green)'
  const riskBg = c => c >= 3 ? 'var(--red-light)' : c >= 2 ? 'var(--amber-light)' : c >= 1 ? '#fef9c3' : 'var(--green-light)'
  const riskLabel = c => c >= 3 ? 'HIGH' : c >= 2 ? 'MEDIUM' : c >= 1 ? 'LOW' : 'MINIMAL'

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title"><Bug size={22} style={{ display: 'inline', marginRight: 8, color: 'var(--amber)' }} />{t('pestMonitorTitle')}</h1>
          <p className="page-sub">{t('pestMonitorSub')}</p>
        </div>
        <button className="btn-primary" onClick={loadAll} disabled={loading}>
          {loading ? <><Loader2 size={14} className="spin" /> {t('refreshing')}</> : t('refresh')}
        </button>
      </div>

      {weather && (
        <div className="glass-card" style={{ marginBottom: 20, padding: '14px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div className="live-indicator">Live</div>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text2)' }}>{t('weatherPestNote')} — {profile?.location || 'Your Location'}</span>
          </div>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {[
              { icon: <Droplets size={14} />, label: t('humidity'), value: `${weather.current.humidity}%`, alert: weather.current.humidity > 80 },
              { icon: <Thermometer size={14} />, label: t('temp'), value: `${weather.current.temperature?.toFixed(1)}°C`, alert: weather.current.temperature > 32 },
              { icon: <Wind size={14} />, label: 'Wind', value: `${weather.current.windSpeed} km/h`, alert: false },
              { icon: <span>🌧️</span>, label: t('rain'), value: `${weather.current.rain}mm`, alert: weather.current.rain > 5 },
            ].map(({ icon, label, value, alert }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: alert ? 'var(--amber-light)' : 'var(--bg2)', borderRadius: 8, border: alert ? '1px solid var(--amber)' : '1px solid var(--border2)' }}>
                <span style={{ color: alert ? 'var(--amber)' : 'var(--text2)' }}>{icon}</span>
                <span style={{ fontSize: 12, color: 'var(--text2)' }}>{label}:</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: alert ? 'var(--amber)' : 'var(--text)' }}>{value}</span>
                {alert && <span style={{ fontSize: 10, color: 'var(--amber)' }}>⚠️</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && pestResults.length > 0 && (
        <div className="stats-grid" style={{ marginBottom: 24 }}>
          <div className="stat-card stat-orange"><div className="stat-icon"><Bug /></div><div className="stat-content"><p className="stat-label">{t('highRiskFields')}</p><p className="stat-value" style={{ color: highRisk > 0 ? 'var(--red)' : 'var(--green)' }}>{highRisk} <span className="stat-unit">{t('fields')}</span></p></div></div>
          <div className="stat-card stat-blue"><div className="stat-icon"><Droplets /></div><div className="stat-content"><p className="stat-label">{t('currentHumidity')}</p><p className="stat-value">{weather?.current?.humidity || '—'}<span className="stat-unit">%</span></p><p className="stat-trend">{weather?.current?.humidity > 80 ? '⚠️ ' + t('highRiskFields') : 'Normal'}</p></div></div>
          <div className="stat-card stat-green"><div className="stat-icon"><Sprout /></div><div className="stat-content"><p className="stat-label">{t('fieldMonitored')}</p><p className="stat-value">{pestResults.length} <span className="stat-unit">{t('fields')}</span></p></div></div>
        </div>
      )}

      {loading ? <div className="center-loader"><Loader2 size={40} className="spin" /></div>
        : fields.length === 0 ? (
          <div className="empty-page"><Bug size={64} /><h2>{t('noFieldsYet')}</h2><p>{t('pestEmptyDesc')}</p></div>
        ) : (
          <div className="fields-grid">
            {pestResults.map(({ field, pest }) => {
              if (!pest) return null
              const color = riskColor(pest.pestAlertCode)
              const bg = riskBg(pest.pestAlertCode)
              const label = riskLabel(pest.pestAlertCode)
              return (
                <div key={field.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: 14, border: pest.pestAlertCode >= 2 ? `1.5px solid ${color}` : undefined }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Sprout size={18} color="var(--green)" />
                      <div>
                        <h3 style={{ fontSize: 16, fontWeight: 800 }}>{field.name}</h3>
                        <span style={{ fontSize: 12, color: 'var(--text2)' }}>{field.crop_type} · {field.area_hectares}ha · {field.growth_stage || 'Vegetative'}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', padding: '6px 12px', background: bg, borderRadius: 10 }}>
                      <div style={{ fontSize: 20, fontWeight: 900, color }}>{pest.pestRiskScore}<span style={{ fontSize: 12 }}>/10</span></div>
                      <div style={{ fontSize: 11, fontWeight: 800, color }}>{label}</div>
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                      <span style={{ color: 'var(--text2)' }}>{t('riskLevel')}</span>
                      <span style={{ color, fontWeight: 700 }}>{pest.pestRiskLevel}</span>
                    </div>
                    <div style={{ height: 8, background: 'var(--bg2)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${(pest.pestRiskScore / 10) * 100}%`, height: '100%', background: color, borderRadius: 4 }} />
                    </div>
                  </div>

                  <div style={{ padding: '8px 12px', background: bg, borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: 'var(--text2)' }}>{t('scouting')}</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color }}>{pest.monitoringFrequency}</span>
                  </div>

                  <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <span>🌡️ {weather?.current?.temperature?.toFixed(0)}°C</span>
                    <span>💧 {weather?.current?.humidity}% {t('humidity')}</span>
                    <span>🌧️ {weather?.current?.rain}mm {t('rain')}</span>
                  </div>

                  {pest.recommendations?.length > 0 && (
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 800, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>{t('recommendations')}</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {pest.recommendations.map((r, i) => <div key={i} style={{ fontSize: 12, padding: '6px 10px', background: 'var(--bg2)', borderRadius: 8, borderLeft: `3px solid ${color}` }}>{r}</div>)}
                      </div>
                    </div>
                  )}

                  {pest.alerts?.length > 0 && pest.alerts.map((a, i) => (
                    <div key={i} style={{ fontSize: 12, padding: '6px 10px', background: 'var(--red-light)', borderRadius: 8, borderLeft: '3px solid var(--red)' }}>
                      <AlertTriangle size={11} style={{ display: 'inline', marginRight: 4 }} />{a}
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        )}
    </div>
  )
}
