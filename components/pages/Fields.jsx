'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { CROP_DATABASE, SOIL_TYPES, GROWTH_STAGES } from '../../lib/crops'
import { Plus, Pencil, Trash2, Sprout, MapPin, X, Loader2 } from 'lucide-react'

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
        <div><h1 className="page-title">My Fields</h1><p className="page-sub">Manage fields and IoT soil sensor data</p></div>
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
              return (
                <div key={f.id} className="field-card">
                  <div className="field-card-header">
                    <div className="field-card-title"><Sprout size={18} color="#00e87a" /><h3>{f.name}</h3></div>
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
