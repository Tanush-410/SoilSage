'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { History, Loader2, Droplets, Plus, Trash2 } from 'lucide-react'

export default function HistoryPage() {
  const [fields, setFields] = useState([])
  const [logs, setLogs] = useState([])
  const [recs, setRecs] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('recs')
  const [showLogForm, setShowLogForm] = useState(false)
  const [logForm, setLogForm] = useState({ field_id: '', duration_minutes: '', water_liters: '', notes: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    const { data: f } = await supabase.from('fields').select('id, name, crop_type')
    setFields(f || [])
    if (f?.length) {
      const ids = f.map(x => x.id)
      const { data: r } = await supabase.from('recommendations').select('*, fields(name, crop_type)').in('field_id', ids).order('created_at', { ascending: false }).limit(50)
      const { data: l } = await supabase.from('irrigation_logs').select('*, fields(name, crop_type)').in('field_id', ids).order('irrigated_at', { ascending: false }).limit(50)
      setRecs(r || [])
      setLogs(l || [])
    }
    setLoading(false)
  }

  async function saveLog(e) {
    e.preventDefault()
    setSaving(true)
    await supabase.from('irrigation_logs').insert({
      field_id: logForm.field_id,
      duration_minutes: parseInt(logForm.duration_minutes),
      water_liters: parseFloat(logForm.water_liters),
      notes: logForm.notes,
      irrigated_at: new Date().toISOString(),
    })
    setSaving(false)
    setShowLogForm(false)
    setLogForm({ field_id: '', duration_minutes: '', water_liters: '', notes: '' })
    loadData()
  }

  const upd = (k, v) => setLogForm(f => ({ ...f, [k]: v }))

  return (
    <div className="page">
      <div className="page-header">
        <div><h1 className="page-title">History & Logs</h1><p className="page-sub">Past AI recommendations and irrigation records</p></div>
        <button className="btn-primary" onClick={() => setShowLogForm(true)}><Plus size={16} /> Log Irrigation</button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button className={`auth-tab ${tab === 'recs' ? 'active' : ''}`} onClick={() => setTab('recs')} style={{ padding: '9px 20px', borderRadius: 9, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13, background: tab === 'recs' ? 'var(--green)' : 'var(--bg2)', color: tab === 'recs' ? '#fff' : 'var(--text2)' }}>
          AI Recommendations ({recs.length})
        </button>
        <button className={`auth-tab ${tab === 'logs' ? 'active' : ''}`} onClick={() => setTab('logs')} style={{ padding: '9px 20px', borderRadius: 9, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13, background: tab === 'logs' ? 'var(--green)' : 'var(--bg2)', color: tab === 'logs' ? '#fff' : 'var(--text2)' }}>
          Irrigation Logs ({logs.length})
        </button>
      </div>

      {loading ? <div className="center-loader"><Loader2 size={40} className="spin" /></div> : (
        <div className="glass-card">
          {tab === 'recs' && (
            recs.length === 0 ? (
              <div className="empty-state"><History size={44} /><p>No recommendations yet — run the AI Advisor first</p></div>
            ) : (
              <div className="history-table-wrap">
                <table className="history-table">
                  <thead><tr><th>Date</th><th>Field</th><th>Crop</th><th>Priority</th><th>Next Irrigation</th><th>Water (L)</th><th>Efficiency</th></tr></thead>
                  <tbody>
                    {recs.map(r => (
                      <tr key={r.id}>
                        <td>{new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' })}</td>
                        <td style={{ fontWeight: 700 }}>{r.fields?.name || '—'}</td>
                        <td>{r.fields?.crop_type || '—'}</td>
                        <td><span className={`urgency-badge urgency-${r.urgency || 'low'}`} style={{ fontSize: 11, padding: '3px 10px' }}>{r.urgency || 'low'}</span></td>
                        <td style={{ color: 'var(--text2)' }}>{r.next_irrigation_time}</td>
                        <td style={{ fontWeight: 700, color: 'var(--blue)' }}>{r.water_amount_liters?.toLocaleString()}</td>
                        <td><span style={{ color: 'var(--green)', fontWeight: 800 }}>{r.efficiency_score}%</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}

          {tab === 'logs' && (
            logs.length === 0 ? (
              <div className="empty-state"><Droplets size={44} /><p>No irrigation logs yet — click "Log Irrigation" to record one</p></div>
            ) : (
              <div className="history-table-wrap">
                <table className="history-table">
                  <thead><tr><th>Date & Time</th><th>Field</th><th>Crop</th><th>Duration (min)</th><th>Water (L)</th><th>Notes</th></tr></thead>
                  <tbody>
                    {logs.map(l => (
                      <tr key={l.id}>
                        <td>{new Date(l.irrigated_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' })}</td>
                        <td style={{ fontWeight: 700 }}>{l.fields?.name || '—'}</td>
                        <td>{l.fields?.crop_type || '—'}</td>
                        <td style={{ textAlign: 'center', fontWeight: 700 }}>{l.duration_minutes}</td>
                        <td style={{ fontWeight: 700, color: 'var(--blue)' }}>{l.water_liters?.toLocaleString()}</td>
                        <td style={{ color: 'var(--text2)' }}>{l.notes || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      )}

      {showLogForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowLogForm(false)}>
          <div className="modal-box" style={{ maxWidth: 480 }}>
            <div className="modal-header"><h2>Log Irrigation Event</h2><button onClick={() => setShowLogForm(false)}>✕</button></div>
            <form onSubmit={saveLog} className="modal-form">
              <div className="form-group">
                <label>Field *</label>
                <select value={logForm.field_id} onChange={e => upd('field_id', e.target.value)} required>
                  <option value="">Select Field</option>
                  {fields.map(f => <option key={f.id} value={f.id}>{f.name} — {f.crop_type}</option>)}
                </select>
              </div>
              <div className="form-row-2">
                <div className="form-group"><label>Duration (minutes)</label><input type="number" min="1" placeholder="45" value={logForm.duration_minutes} onChange={e => upd('duration_minutes', e.target.value)} required /></div>
                <div className="form-group"><label>Water Used (litres)</label><input type="number" min="1" placeholder="5000" value={logForm.water_liters} onChange={e => upd('water_liters', e.target.value)} required /></div>
              </div>
              <div className="form-group"><label>Notes (optional)</label><textarea rows={2} placeholder="e.g. Drip irrigation, morning session..." value={logForm.notes} onChange={e => upd('notes', e.target.value)} style={{ resize: 'vertical' }} /></div>
              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={() => setShowLogForm(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? <><Loader2 size={14} className="spin" /> Saving...</> : 'Save Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
