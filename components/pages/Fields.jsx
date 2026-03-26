'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { CROP_DATABASE, SOIL_TYPES, GROWTH_STAGES } from '../../lib/crops'
import { estimateYield, formatRupees } from '../../lib/yield-calculator'
import { Plus, Pencil, Trash2, Sprout, MapPin, X, Loader2, TrendingUp, Activity } from 'lucide-react'

/** Compute 0-100 soil health score from NPK, pH, moisture */
function soilHealthScore(f) {
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

  return Math.round(phScore * 0.30 + nScore * 0.25 + pScore * 0.20 + kScore * 0.15 + mScore * 0.10)
}

function healthLabel(score) {
  if (score >= 80) return { label: 'Excellent', color: 'var(--green)', bg: 'var(--green-light)' }
  if (score >= 60) return { label: 'Good', color: '#16a34a', bg: '#dcfce7' }
  if (score >= 40) return { label: 'Fair', color: 'var(--amber)', bg: 'var(--amber-light)' }
  return { label: 'Poor', color: 'var(--red)', bg: 'var(--red-light)' }
}

export default function Fields() {
  const [fields, setFields] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editField, setEditField] = useState(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(blank())

  function blank() {
    return { name: '', crop_type: '', soil_type: 'Loamy Soil', area_hectares: '', growth_stage: 'Vegetative', location: '', soil_moisture: 60, soil_ph: 6.5, soil_temperature: 25, nitrogen: 40, phosphorus: 30, potassium: 35 }
  }

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('fields').select('*').order('created_at', { ascending: false })
    setFields(data || [])
    setLoading(false)
  }

  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function save(e) {
    e.preventDefault()
    setSaving(true)
    const payload = { ...form, area_hectares: parseFloat(form.area_hectares) || 1, soil_moisture: parseFloat(form.soil_moisture), soil_ph: parseFloat(form.soil_ph), soil_temperature: parseFloat(form.soil_temperature), nitrogen: parseFloat(form.nitrogen), phosphorus: parseFloat(form.phosphorus), potassium: parseFloat(form.potassium) }
    if (editField) await supabase.from('fields').update(payload).eq('id', editField.id)
    else await supabase.from('fields').insert(payload)
    setSaving(false)
    setShowForm(false)
    load()
  }

  async function del(id) {
    if (!confirm('Delete this field and all its data?')) return
    await supabase.from('fields').delete().eq('id', id)
    load()
  }

  function openEdit(f) { setEditField(f); setForm({ ...blank(), ...f }); setShowForm(true) }
  function openAdd() { setEditField(null); setForm(blank()); setShowForm(true) }

  const m = form.soil_moisture
  const mColor = m < 30 ? '#ef4444' : m < 60 ? '#f59e0b' : '#00e87a'

  return (
    <div className="page">
      <div className="page-header">
        <div><h1 className="page-title">My Fields</h1><p className="page-sub">Manage fields · Soil health · Yield & market value</p></div>
        <button className="btn-primary" onClick={openAdd}><Plus size={16} /> Add Field</button>
      </div>

      {loading ? <div className="center-loader"><Loader2 size={40} className="spin" /></div>
        : fields.length === 0 ? (
          <div className="empty-page">
            <Sprout size={64} /><h2>No fields added yet</h2>
            <p>Add your first field to get AI-powered irrigation recommendations based on FAO-56 standards</p>
            <button className="btn-primary" onClick={openAdd}><Plus size={16} /> Add First Field</button>
          </div>
        ) : (
          <div className="fields-grid">
            {fields.map(f => {
              const moist = f.soil_moisture || 60
              const color = moist < 30 ? '#ef4444' : moist < 60 ? '#f59e0b' : '#00e87a'
              const health = soilHealthScore(f)
              const { label: hLabel, color: hColor, bg: hBg } = healthLabel(health)
              const yieldData = estimateYield(f.crop_type, f.area_hectares || 1, 75)

              return (
                <div key={f.id} className="field-card">
                  <div className="field-card-header">
                    <div className="field-card-title"><Sprout size={18} color="var(--green)" /><h3>{f.name}</h3></div>
                    <div className="field-card-actions">
                      <button onClick={() => openEdit(f)}><Pencil size={14} /></button>
                      <button className="danger" onClick={() => del(f.id)}><Trash2 size={14} /></button>
                    </div>
                  </div>

                  <div className="field-info-grid">
                    {[['Crop', f.crop_type], ['Area', `${f.area_hectares} ha`], ['Soil', f.soil_type], ['Stage', f.growth_stage || 'Vegetative']].map(([l, v]) => (
                      <div key={l} className="info-row"><span className="info-label">{l}</span><span className="info-value">{v}</span></div>
                    ))}
                  </div>

                  {f.location && <div className="field-location"><MapPin size={12} />{f.location}</div>}

                  {/* Soil Health Score */}
                  <div style={{ marginBottom: 10, padding: '8px 12px', background: hBg, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: `1px solid ${hColor}30` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Activity size={14} color={hColor} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: hColor }}>Soil Health</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 80, height: 6, background: '#e5e7eb', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: `${health}%`, height: '100%', background: hColor, borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 800, color: hColor }}>{health}/100</span>
                      <span style={{ fontSize: 11, color: hColor, fontWeight: 600 }}>{hLabel}</span>
                    </div>
                  </div>

                  {/* Yield & Market Value */}
                  {f.crop_type && (
                    <div style={{ marginBottom: 10, padding: '8px 12px', background: 'var(--blue-light)', borderRadius: 10, border: '1px solid #bfdbfe30', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <TrendingUp size={14} color="var(--blue)" />
                        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--blue)' }}>Est. Yield</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--blue)' }}>{yieldData.yieldTonnes}t </span>
                        <span style={{ fontSize: 11, color: 'var(--text2)', fontWeight: 600 }}>· {formatRupees(yieldData.marketValueRs)}</span>
                      </div>
                    </div>
                  )}

                  <div className="soil-metrics">
                    <div className="soil-metric">
                      <span>Moisture</span>
                      <div className="metric-bar"><div className="metric-fill" style={{ width: `${moist}%`, background: color }} /></div>
                      <span style={{ color, fontSize: 12, fontWeight: 700 }}>{moist}%</span>
                    </div>
                    <div className="soil-mini-stats">
                      <span>pH {f.soil_ph || 6.5}</span>
                      <span>{f.soil_temperature || 25}°C</span>
                      <span>N:{f.nitrogen || 40}ppm</span>
                      <span>P:{f.phosphorus || 30}ppm</span>
                    </div>
                  </div>

                  <div className="field-card-footer">
                    <span className={`crop-water-badge ${moist < 30 ? 'critical' : moist < 60 ? 'warning' : 'ok'}`}>
                      {moist < 30 ? '⚠️ Critical' : moist < 60 ? '⚡ Monitor' : '✅ Adequate'}
                    </span>
                    <span className="field-date">{new Date(f.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

      {showForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal-box">
            <div className="modal-header">
              <h2>{editField ? 'Edit Field' : 'Add New Field'}</h2>
              <button onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>
            <form onSubmit={save} className="modal-form">
              <div className="form-section-title">Field Info</div>
              <div className="form-row-2">
                <div className="form-group"><label>Field Name *</label><input placeholder="e.g. North Field" value={form.name} onChange={e => upd('name', e.target.value)} required /></div>
                <div className="form-group"><label>Area (hectares) *</label><input type="number" min="0.01" step="0.1" placeholder="2.5" value={form.area_hectares} onChange={e => upd('area_hectares', e.target.value)} required /></div>
              </div>
              <div className="form-row-2">
                <div className="form-group">
                  <label>Crop Type *</label>
                  <select value={form.crop_type} onChange={e => upd('crop_type', e.target.value)} required>
                    <option value="">Select Crop</option>
                    {Object.entries(CROP_DATABASE).map(([key, cat]) => (
                      <optgroup key={key} label={cat.label}>
                        {cat.crops.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                      </optgroup>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Growth Stage</label>
                  <select value={form.growth_stage} onChange={e => upd('growth_stage', e.target.value)}>
                    {GROWTH_STAGES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row-2">
                <div className="form-group">
                  <label>Soil Type *</label>
                  <select value={form.soil_type} onChange={e => upd('soil_type', e.target.value)} required>
                    {SOIL_TYPES.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Location</label><input placeholder="Village / District" value={form.location} onChange={e => upd('location', e.target.value)} /></div>
              </div>

              <div className="form-section-title">IoT Soil Sensor Data</div>
              <div className="form-row-3">
                <div className="form-group">
                  <label>Moisture (%)</label>
                  <input type="number" min="0" max="100" value={form.soil_moisture} onChange={e => upd('soil_moisture', e.target.value)} />
                  <div className="moisture-bar" style={{ marginTop: 6 }}><div className="moisture-fill" style={{ width: `${form.soil_moisture}%`, background: mColor }} /></div>
                </div>
                <div className="form-group"><label>pH Level</label><input type="number" min="0" max="14" step="0.1" value={form.soil_ph} onChange={e => upd('soil_ph', e.target.value)} /></div>
                <div className="form-group"><label>Temp (°C)</label><input type="number" value={form.soil_temperature} onChange={e => upd('soil_temperature', e.target.value)} /></div>
              </div>
              <div className="form-row-3">
                <div className="form-group"><label>Nitrogen (ppm)</label><input type="number" min="0" value={form.nitrogen} onChange={e => upd('nitrogen', e.target.value)} /></div>
                <div className="form-group"><label>Phosphorus (ppm)</label><input type="number" min="0" value={form.phosphorus} onChange={e => upd('phosphorus', e.target.value)} /></div>
                <div className="form-group"><label>Potassium (ppm)</label><input type="number" min="0" value={form.potassium} onChange={e => upd('potassium', e.target.value)} /></div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? <><Loader2 size={14} className="spin" /> Saving...</> : editField ? 'Update Field' : 'Add Field'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
