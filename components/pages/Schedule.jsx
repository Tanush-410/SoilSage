'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { generateWeeklyPlan } from '../../lib/irrigation-engine'
import { fetchWeather, geocodeCity } from '../../lib/weather'
import { getAllCrops, CROP_DATABASE, SOIL_TYPES, GROWTH_STAGES } from '../../lib/crops'
import { Calendar, Loader2, Droplets, CloudRain } from 'lucide-react'

export default function Schedule() {
  const [fields, setFields] = useState([])
  const [selected, setSelected] = useState(null)
  const [plan, setPlan] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingFields, setLoadingFields] = useState(true)

  useEffect(() => {
    supabase.from('fields').select('*').then(({ data }) => {
      setFields(data || [])
      if (data?.[0]) setSelected(data[0])
      setLoadingFields(false)
    })
  }, [])

  async function generate() {
    if (!selected) return
    setLoading(true)
    try {
      const geo = await geocodeCity(selected.location || 'New Delhi')
      const weather = await fetchWeather(geo?.latitude || 28.6, geo?.longitude || 77.2)
      const allCrops = getAllCrops()
      const crop = allCrops.find(c => c.name === selected.crop_type) || { name: selected.crop_type, waterNeed: 'medium' }
      const weekPlan = generateWeeklyPlan({
        crop,
        soilData: { moisture: selected.soil_moisture || 60, soilType: selected.soil_type || 'Loamy Soil', growthStage: selected.growth_stage || 'Vegetative' },
        weather,
        fieldArea: selected.area_hectares || 1,
      })
      setPlan(weekPlan)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const totalWater = plan.reduce((s, d) => s + (d.irrigate ? d.liters : 0), 0)
  const irrigateDays = plan.filter(d => d.irrigate).length

  return (
    <div className="page">
      <div className="page-header">
        <div><h1 className="page-title">7-Day Irrigation Schedule</h1><p className="page-sub">Daily ETc balance — FAO-56 Penman-Monteith</p></div>
      </div>

      <div className="schedule-layout">
        <div className="glass-card">
          <div className="card-header"><h3>Select Field</h3></div>
          {loadingFields ? <div className="center-loader"><Loader2 size={24} className="spin" /></div> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              {fields.map(f => (
                <div key={f.id} className="field-mini-item" style={{ cursor: 'pointer', border: selected?.id === f.id ? '1px solid var(--green)' : '1px solid transparent' }} onClick={() => setSelected(f)}>
                  <div className="field-mini-info">
                    <span className="field-mini-name">{f.name}</span>
                    <span className="field-mini-crop">{f.crop_type} · {f.area_hectares}ha</span>
                  </div>
                </div>
              ))}
              {fields.length === 0 && <p style={{ fontSize: 13, color: 'var(--text2)', textAlign: 'center' }}>No fields yet</p>}
            </div>
          )}
          <button className="btn-primary btn-full" onClick={generate} disabled={loading || !selected}>
            {loading ? <><Loader2 size={16} className="spin" /> Generating...</> : <><Calendar size={16} /> Generate Plan</>}
          </button>
          {plan.length > 0 && (
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div className="rec-metric" style={{ textAlign: 'center' }}><div className="rec-metric-value">{irrigateDays}/7</div><div className="rec-metric-label">Irrigation Days</div></div>
              <div className="rec-metric" style={{ textAlign: 'center' }}><div className="rec-metric-value">{totalWater.toLocaleString()}</div><div className="rec-metric-label">Total Litres</div></div>
            </div>
          )}
        </div>

        <div className="glass-card">
          <div className="card-header"><h3>Weekly Schedule</h3><span className="badge-green">ETc-based</span></div>
          {plan.length === 0 ? (
            <div className="empty-state" style={{ padding: '48px 0' }}>
              <Calendar size={44} /><p>Generate a schedule to see your 7-day irrigation plan</p>
            </div>
          ) : (
            <>
              <div className="history-table-wrap">
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Date</th><th>ET₀ (mm)</th><th>ETc (mm)</th><th>Rain (mm)</th><th>Net Irr (mm)</th><th>Litres</th><th>Temp</th><th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plan.map((d, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 600 }}>{d.date}</td>
                        <td style={{ fontFamily: 'var(--mono)', color: 'var(--text2)' }}>{d.et0}</td>
                        <td style={{ fontFamily: 'var(--mono)', color: 'var(--blue)' }}>{d.etc}</td>
                        <td style={{ color: d.rain > 0 ? 'var(--blue)' : 'var(--text3)' }}>{d.rain > 0 ? `🌧️ ${d.rain}` : '—'}</td>
                        <td style={{ fontFamily: 'var(--mono)', color: parseFloat(d.netIrrigation) > 0 ? 'var(--green)' : 'var(--text3)' }}>{d.netIrrigation}</td>
                        <td style={{ fontWeight: 700 }}>{d.irrigate ? d.liters?.toLocaleString() : '—'}</td>
                        <td style={{ color: 'var(--text2)' }}>{d.tempMax}° / {d.tempMin}°</td>
                        <td>{d.irrigate ? <span className="irrigate-yes"><Droplets size={11} style={{ display: 'inline' }} /> Irrigate</span> : <span className="irrigate-no">Hold</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ marginTop: 14, padding: '10px 14px', background: 'rgba(0,232,122,0.06)', borderRadius: 10, fontSize: 13, color: 'var(--text2)' }}>
                <strong style={{ color: 'var(--green)' }}>Methodology:</strong> Net irrigation = ETc − Effective Rain (75%) · ETc = Kc × ET₀ (FAO-56 Penman-Monteith)
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
