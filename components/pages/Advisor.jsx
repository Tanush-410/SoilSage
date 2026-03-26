'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { getMLPrediction, getPestPrediction } from '../../lib/ml-client'
import { fetchWeather, geocodeCity } from '../../lib/weather'
import { getAllCrops, CROP_DATABASE, SOIL_TYPES, GROWTH_STAGES } from '../../lib/crops'
import { Brain, Loader2, Droplets, Clock, AlertTriangle, CheckCircle, Leaf, FlaskConical } from 'lucide-react'

export default function Advisor() {
  const [fields, setFields] = useState([])
  const [selectedField, setSelectedField] = useState(null)
  const [weather, setWeather] = useState(null)
  const [rec, setRec] = useState(null)
  const [pestRec, setPestRec] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingFields, setLoadingFields] = useState(true)
  const [activeTab, setActiveTab] = useState('irrigation')
  const [customMode, setCustomMode] = useState(false)
  const [custom, setCustom] = useState({ crop_type: '', soil_type: 'Loamy Soil', growth_stage: 'Vegetative', soil_moisture: 60, soil_ph: 6.5, soil_temperature: 25, nitrogen: 40, phosphorus: 30, potassium: 35, area_hectares: 1, location: 'New Delhi' })

  useEffect(() => {
    supabase.from('fields').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      setFields(data || [])
      if (data?.[0]) setSelectedField(data[0])
      setLoadingFields(false)
    })
  }, [])

  const upd = (k, v) => setCustom(f => ({ ...f, [k]: v }))

  async function runAnalysis() {
    setLoading(true)
    setRec(null)
    setPestRec(null)
    try {
      const fieldData = customMode ? custom : selectedField
      if (!fieldData) return
      const loc = fieldData.location || 'New Delhi'
      const geo = await geocodeCity(loc)
      const w = await fetchWeather(geo?.latitude || 28.6, geo?.longitude || 77.2)
      setWeather(w)
      const allCrops = getAllCrops()
      const cropObj = allCrops.find(c => c.name === fieldData.crop_type) || { name: fieldData.crop_type || 'Wheat', category: 'Cereals', waterNeed: 'medium', optimalMoisture: 60, id: 'wheat' }

      // Run both irrigation and pest analysis
      const [irrigationResult, pestResult] = await Promise.all([
        getMLPrediction({
          crop: { ...cropObj, growthStage: fieldData.growth_stage || 'Vegetative' },
          soilData: {
            moisture: parseFloat(fieldData.soil_moisture) || 60,
            soilType: fieldData.soil_type || 'Loamy Soil',
            temperature: parseFloat(fieldData.soil_temperature) || 25,
            ph: parseFloat(fieldData.soil_ph) || 6.5,
            nitrogen: parseFloat(fieldData.nitrogen) || 40,
            phosphorus: parseFloat(fieldData.phosphorus) || 30,
            potassium: parseFloat(fieldData.potassium) || 35,
            growthStage: fieldData.growth_stage || 'Vegetative',
          },
          weather: w,
          fieldArea: parseFloat(fieldData.area_hectares) || 1,
          location: loc,
        }),
        getPestPrediction({
          crop: { ...cropObj, id: cropObj.id || 'wheat', season: cropObj.season || 'Year-round' },
          soilData: {
            moisture: parseFloat(fieldData.soil_moisture) || 60,
            soilType: fieldData.soil_type || 'Loamy Soil',
            temperature: parseFloat(fieldData.soil_temperature) || 25,
            ph: parseFloat(fieldData.soil_ph) || 6.5,
            nitrogen: parseFloat(fieldData.nitrogen) || 40,
            phosphorus: parseFloat(fieldData.phosphorus) || 30,
            potassium: parseFloat(fieldData.potassium) || 35,
            growthStage: fieldData.growth_stage || 'Vegetative',
          },
          weather: w,
          fieldArea: parseFloat(fieldData.area_hectares) || 1,
        })
      ])

      setRec(irrigationResult)
      setPestRec(pestResult)

      if (!customMode && selectedField?.id) {
        await supabase.from('recommendations').insert({
          field_id: selectedField.id,
          urgency: irrigationResult.urgency,
          next_irrigation_time: irrigationResult.nextIrrigationTime,
          water_amount_liters: irrigationResult.waterAmountLiters,
          efficiency_score: irrigationResult.efficiencyScore,
          recommendation_json: irrigationResult,
        })
      }
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const fieldData = customMode ? custom : selectedField

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">AI Crop Advisor</h1>
          <p className="page-sub">Irrigation & Pest Control · Python ML models · Real-time weather integration</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="page-tabs" style={{ marginBottom: 20, padding: '0 4px' }}>
        <button
          onClick={() => setActiveTab('irrigation')}
          style={{
            flex: 1,
            padding: '12px 16px',
            borderRadius: 12,
            border: 'none',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: 14,
            background: activeTab === 'irrigation' ? 'var(--green)' : 'var(--bg)',
            color: activeTab === 'irrigation' ? '#fff' : 'var(--text2)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            justifyContent: 'center'
          }}
        >
          <Droplets size={16} />
          Irrigation
        </button>
        <button
          onClick={() => setActiveTab('pest')}
          style={{
            flex: 1,
            padding: '12px 16px',
            borderRadius: 12,
            border: 'none',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: 14,
            background: activeTab === 'pest' ? 'var(--green)' : 'var(--bg)',
            color: activeTab === 'pest' ? '#fff' : 'var(--text2)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            justifyContent: 'center'
          }}
        >
          <Leaf size={16} />
          Pest Control
        </button>
      </div>

      <div className="advisor-layout">
        {/* Input Panel */}
        <div className="glass-card advisor-input">
          <div className="card-header"><h3>Analysis Input</h3></div>
          <div className="toggle-group" style={{ marginBottom: 16 }}>
            <button onClick={() => setCustomMode(false)} style={{ flex: 1, padding: '9px', borderRadius: 9, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13, background: !customMode ? 'var(--green)' : 'var(--bg)', color: !customMode ? '#fff' : 'var(--text2)' }}>My Fields</button>
            <button onClick={() => setCustomMode(true)} style={{ flex: 1, padding: '9px', borderRadius: 9, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13, background: customMode ? 'var(--green)' : 'var(--bg)', color: customMode ? '#fff' : 'var(--text2)' }}>Custom Input</button>
          </div>

          {!customMode ? (
            loadingFields ? <div className="center-loader"><Loader2 size={24} className="spin" /></div> :
            fields.length === 0 ? <p style={{ fontSize: 13, color: 'var(--text2)', textAlign: 'center', padding: '20px 0' }}>No fields yet. Add a field first.</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                {fields.map(f => (
                  <div key={f.id} className="field-mini-item" style={{ border: selectedField?.id === f.id ? '2px solid var(--green)' : '1.5px solid transparent' }} onClick={() => setSelectedField(f)}>
                    <div className="field-mini-info">
                      <span className="field-mini-name">{f.name}</span>
                      <span className="field-mini-crop">{f.crop_type} · {f.growth_stage} · {f.area_hectares}ha</span>
                    </div>
                    <div className={`moisture-badge ${f.soil_moisture < 35 ? 'low' : f.soil_moisture < 60 ? 'medium' : 'high'}`}>{f.soil_moisture}%</div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              <div className="form-group">
                <label>Crop Type</label>
                <select value={custom.crop_type} onChange={e => upd('crop_type', e.target.value)}>
                  <option value="">Select Crop</option>
                  {Object.entries(CROP_DATABASE).map(([key, cat]) => (
                    <optgroup key={key} label={cat.label}>
                      {cat.crops.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div className="form-row-2">
                <div className="form-group"><label>Soil Type</label><select value={custom.soil_type} onChange={e => upd('soil_type', e.target.value)}>{SOIL_TYPES.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}</select></div>
                <div className="form-group"><label>Growth Stage</label><select value={custom.growth_stage} onChange={e => upd('growth_stage', e.target.value)}>{GROWTH_STAGES.map(s => <option key={s}>{s}</option>)}</select></div>
              </div>
              <div className="form-row-2">
                <div className="form-group"><label>Moisture %</label><input type="number" min="0" max="100" value={custom.soil_moisture} onChange={e => upd('soil_moisture', e.target.value)} /></div>
                <div className="form-group"><label>Area (ha)</label><input type="number" min="0.1" step="0.1" value={custom.area_hectares} onChange={e => upd('area_hectares', e.target.value)} /></div>
              </div>
              <div className="form-row-3">
                <div className="form-group"><label>pH</label><input type="number" step="0.1" value={custom.soil_ph} onChange={e => upd('soil_ph', e.target.value)} /></div>
                <div className="form-group"><label>N (ppm)</label><input type="number" value={custom.nitrogen} onChange={e => upd('nitrogen', e.target.value)} /></div>
                <div className="form-group"><label>P (ppm)</label><input type="number" value={custom.phosphorus} onChange={e => upd('phosphorus', e.target.value)} /></div>
              </div>
              <div className="form-group"><label>Location (for weather)</label><input placeholder="City name" value={custom.location} onChange={e => upd('location', e.target.value)} /></div>
            </div>
          )}

          <button className="btn-primary btn-full" onClick={runAnalysis} disabled={loading || (!customMode && !selectedField) || (customMode && !custom.crop_type)}>
            {loading ? <><Loader2 size={16} className="spin" /> Running ML Model...</> : <><Brain size={16} /> Run AI Analysis</>}
          </button>

          {weather && !loading && (
            <div style={{ marginTop: 14, padding: '10px 14px', background: 'var(--blue-light)', border: '1px solid #bfdbfe', borderRadius: 10 }}>
              <p style={{ fontSize: 11, color: 'var(--blue)', fontWeight: 800, marginBottom: 4 }}>LIVE WEATHER - {(customMode ? custom.location : selectedField?.location || 'New Delhi').toUpperCase()}</p>
              <p style={{ fontSize: 13, color: 'var(--text)', fontWeight: 600 }}>{weather.current.icon} {weather.current.temperature?.toFixed(1)}°C · {weather.current.condition}</p>
              <p style={{ fontSize: 12, color: 'var(--text2)' }}>{weather.current.humidity}% RH · {weather.current.windSpeed} km/h</p>
            </div>
          )}

          {(rec || pestRec) && !loading && (
            <div style={{ marginTop: 12, padding: '8px 12px', background: (rec?.source === 'ml_api' || pestRec?.source === 'pest_ml_api') ? 'var(--green-light)' : 'var(--amber-light)', border: `1px solid ${(rec?.source === 'ml_api' || pestRec?.source === 'pest_ml_api') ? 'var(--border)' : '#fbd38d'}`, borderRadius: 10 }}>
              <p style={{ fontSize: 11, fontWeight: 800, color: (rec?.source === 'ml_api' || pestRec?.source === 'pest_ml_api') ? 'var(--green)' : 'var(--amber)' }}>
                {(rec?.source === 'ml_api' || pestRec?.source === 'pest_ml_api') ? '🤖 Python ML APIs Active' : '📐 Fallback Mode (ML servers offline)'}
              </p>
            </div>
          )}
        </div>

        {/* Results Panel */}
        <div className="recommendation-panel">
          {!rec && !pestRec && !loading && (
            <div className="glass-card" style={{ textAlign: 'center', padding: '60px 24px' }}>
              <Brain size={56} style={{ color: 'var(--green)', opacity: 0.35, margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Ready for Analysis</h3>
              <p style={{ fontSize: 14, color: 'var(--text2)', maxWidth: 340, margin: '0 auto' }}>Select a field or enter custom inputs, then click <strong>Run AI Analysis</strong>.</p>
            </div>
          )}
          {loading && (
            <div className="glass-card" style={{ textAlign: 'center', padding: '60px 24px' }}>
              <Loader2 size={48} className="spin" style={{ color: 'var(--green)', margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: 16, fontWeight: 800 }}>Running ML Models...</h3>
              <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 8 }}>Fetching weather · Analyzing irrigation & pest risks</p>
            </div>
          )}

          {/* Irrigation Tab Content */}
          {activeTab === 'irrigation' && rec && !loading && (
            <>
              <div className="glass-card">
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                  <div>
                    <span className={`urgency-badge urgency-${rec.urgency}`}>
                      {rec.urgency === 'critical' ? '🔴' : rec.urgency === 'high' ? '🟠' : rec.urgency === 'medium' ? '🔵' : '🟢'} {rec.urgency?.toUpperCase()} PRIORITY
                    </span>
                    <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 8, fontWeight: 500 }}>{rec.urgencyReason}</p>
                  </div>
                  <div style={{ textAlign: 'center', background: 'var(--green-light)', padding: '12px 20px', borderRadius: 12, border: '1px solid var(--border)' }}>
                    <p style={{ fontSize: 11, color: 'var(--text2)', fontWeight: 700 }}>EFFICIENCY</p>
                    <p style={{ fontSize: 28, fontWeight: 800, color: 'var(--green)' }}>{rec.efficiencyScore}<span style={{ fontSize: 14 }}>%</span></p>
                  </div>
                </div>
                <div style={{ padding: '12px 16px', background: rec.shouldIrrigateNow ? 'var(--green-light)' : 'var(--blue-light)', border: `1.5px solid ${rec.shouldIrrigateNow ? 'var(--border)' : '#bfdbfe'}`, borderRadius: 12, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                  {rec.shouldIrrigateNow ? <Droplets size={20} color="var(--green)" /> : <CheckCircle size={20} color="var(--blue)" />}
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)' }}>{rec.shouldIrrigateNow ? '💧 Irrigate Now' : '✋ Hold Irrigation'}</p>
                    <p style={{ fontSize: 13, color: 'var(--text2)', fontWeight: 500 }}>Next: {rec.nextIrrigationTime}</p>
                  </div>
                </div>
                <div className="rec-main-grid">
                  <div className="rec-metric"><div className="rec-metric-value">{rec.waterAmountLiters?.toLocaleString()}</div><div className="rec-metric-label">Total Litres (week)</div></div>
                  <div className="rec-metric"><div className="rec-metric-value">{rec.durationMinutes}</div><div className="rec-metric-label">Duration (min)</div></div>
                  <div className="rec-metric"><div className="rec-metric-value">{rec.nirWeekMM}</div><div className="rec-metric-label">Net Irr. (mm/week)</div></div>
                </div>
                <p style={{ fontSize: 12, color: 'var(--green)', fontWeight: 700 }}>💧 {rec.waterSaved}</p>
              </div>

              <div className="glass-card">
                <div className="card-header"><h3><FlaskConical size={15} style={{ display: 'inline', marginRight: 6 }} />Scientific Metrics (FAO-56)</h3></div>
                <div className="sci-metrics">
                  {[['ET₀', rec.et0, 'mm/day'], ['Crop Kc', rec.kc, '—'], ['ETc', rec.etcPerDay, 'mm/day'], ['Zone TAW', rec.rootZoneTAW, 'mm'], ['Depletion', rec.rootZoneDepletion, 'mm'], ['Sessions', rec.schedule?.length, 'events']].map(([l, v, u]) => (
                    <div key={l} className="sci-metric"><div className="sci-metric-label">{l}</div><div className="sci-metric-value">{v}</div><div className="sci-metric-unit">{u}</div></div>
                  ))}
                </div>
              </div>

              {rec.schedule?.length > 0 && (
                <div className="glass-card">
                  <div className="card-header"><h3><Clock size={15} style={{ display: 'inline', marginRight: 6 }} />Irrigation Schedule</h3></div>
                  <div className="history-table-wrap">
                    <table className="schedule-table">
                      <thead><tr><th>Day</th><th>Time</th><th>Litres</th><th>Notes</th></tr></thead>
                      <tbody>
                        {rec.schedule.map((s, i) => (
                          <tr key={i}>
                            <td style={{ fontWeight: 700 }}>{s.day}</td>
                            <td style={{ color: 'var(--green)', fontFamily: 'var(--mono)', fontWeight: 700 }}>{s.time}</td>
                            <td style={{ fontWeight: 800 }}>{s.liters?.toLocaleString()}</td>
                            <td style={{ color: 'var(--text2)', fontSize: 12 }}>{s.reason}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text2)', marginTop: 10, fontWeight: 500 }}>⏰ {rec.bestTimeToIrrigate}</p>
                </div>
              )}

              <div className="glass-card">
                <div className="card-header"><h3><Leaf size={15} style={{ display: 'inline', marginRight: 6 }} />AI Analysis</h3></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {[['🌱 Soil', rec.soilAnalysis], ['🌤️ Weather Impact', rec.weatherImpact], ['🌾 Crop Advice', rec.cropSpecificAdvice], ['💊 Fertigation', rec.fertigation], ['💧 Method', rec.method]].map(([l, t]) => t ? (
                    <div key={l}><p style={{ fontSize: 12, fontWeight: 800, color: 'var(--green)', marginBottom: 4 }}>{l}</p><p className="analysis-text">{t}</p></div>
                  ) : null)}
                </div>
              </div>

              <div className="glass-card">
                <div className="card-header"><h3><AlertTriangle size={15} style={{ display: 'inline', marginRight: 6 }} />Alerts</h3></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {rec.alerts?.map((a, i) => <div key={i} className="alert-item" style={{ borderLeftColor: a.startsWith('🔴') ? 'var(--red)' : a.startsWith('✅') ? 'var(--green)' : 'var(--amber)', background: a.startsWith('🔴') ? 'var(--red-light)' : a.startsWith('✅') ? 'var(--green-light)' : 'var(--amber-light)' }}>{a}</div>)}
                </div>
              </div>
            </>
          )}

          {/* Pest Control Tab Content */}
          {activeTab === 'pest' && pestRec && !loading && (
            <>
              <div className="glass-card">
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                  <div>
                    <span className={`urgency-badge urgency-${pestRec.pestAlertLevel}`}>
                      {pestRec.pestAlertCode === 3 ? '🔴' : pestRec.pestAlertCode === 2 ? '🟠' : pestRec.pestAlertCode === 1 ? '🟡' : '🟢'} {pestRec.pestAlertLevel?.toUpperCase()} RISK
                    </span>
                    <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 8, fontWeight: 500 }}>Pest risk assessment based on crop, weather, and soil conditions</p>
                  </div>
                  <div style={{ textAlign: 'center', background: 'var(--green-light)', padding: '12px 20px', borderRadius: 12, border: '1px solid var(--border)' }}>
                    <p style={{ fontSize: 11, color: 'var(--text2)', fontWeight: 700 }}>PEST RISK</p>
                    <p style={{ fontSize: 28, fontWeight: 800, color: 'var(--green)' }}>{pestRec.pestRiskScore}<span style={{ fontSize: 14 }}>/10</span></p>
                  </div>
                </div>
                <div className="rec-main-grid">
                  <div className="rec-metric"><div className="rec-metric-value">{pestRec.monitoringFrequency}</div><div className="rec-metric-label">Monitoring</div></div>
                  <div className="rec-metric"><div className="rec-metric-value">{pestRec.pestAlertLevel}</div><div className="rec-metric-label">Risk Level</div></div>
                  <div className="rec-metric"><div className="rec-metric-value">{pestRec.pestRiskLevel}</div><div className="rec-metric-label">Score</div></div>
                </div>
              </div>

              <div className="glass-card">
                <div className="card-header"><h3><Leaf size={15} style={{ display: 'inline', marginRight: 6 }} />Pest Control Recommendations</h3></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {pestRec.recommendations?.map((rec, i) => (
                    <div key={i} className="alert-item" style={{
                      borderLeftColor: rec.startsWith('🔴') ? 'var(--red)' : rec.startsWith('🟠') ? 'var(--orange)' : rec.startsWith('🟡') ? 'var(--yellow)' : 'var(--green)',
                      background: rec.startsWith('🔴') ? 'var(--red-light)' : rec.startsWith('🟠') ? 'var(--amber-light)' : rec.startsWith('🟡') ? 'var(--yellow-light)' : 'var(--green-light)'
                    }}>
                      {rec}
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card">
                <div className="card-header"><h3><CheckCircle size={15} style={{ display: 'inline', marginRight: 6 }} />Preventive Actions</h3></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {pestRec.preventiveActions?.map((action, i) => (
                    <div key={i} className="preventive-action">
                      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--green)' }}>•</span>
                      <span style={{ fontSize: 14, color: 'var(--text)' }}>{action}</span>
                    </div>
                  ))}
                </div>
              </div>

              {pestRec.alerts?.length > 0 && (
                <div className="glass-card">
                  <div className="card-header"><h3><AlertTriangle size={15} style={{ display: 'inline', marginRight: 6 }} />Environmental Alerts</h3></div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {pestRec.alerts?.map((alert, i) => (
                      <div key={i} className="alert-item" style={{
                        borderLeftColor: alert.startsWith('⚠️') ? 'var(--amber)' : 'var(--blue)',
                        background: alert.startsWith('⚠️') ? 'var(--amber-light)' : 'var(--blue-light)'
                      }}>
                        {alert}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="glass-card">
                <div className="card-header"><h3><FlaskConical size={15} style={{ display: 'inline', marginRight: 6 }} />ML Model Details</h3></div>
                <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 12 }}>
                  {pestRec.source === 'pest_ml_api' ? '🤖 Python ML API (RandomForest ensemble)' : '📊 Basic calculation (fallback mode)'}
                </p>
                {pestRec.pestProbabilities && (
                  <div style={{ fontSize: 12, color: 'var(--text2)' }}>
                    <p style={{ fontWeight: 700, marginBottom: 4 }}>Risk Probabilities:</p>
                    {Object.entries(pestRec.pestProbabilities).map(([level, prob]) => (
                      <span key={level} style={{ marginRight: 12 }}>
                        {level}: {prob}%
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
