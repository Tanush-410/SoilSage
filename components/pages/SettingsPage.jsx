'use client'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { useTranslation } from '../../lib/i18n'
import { Loader2, User, MapPin, Building2, CheckCircle } from 'lucide-react'

export default function SettingsPage() {
  const { profile, user } = useAuth()
  const { t } = useTranslation()
  const [form, setForm] = useState({ full_name: profile?.full_name || '', farm_name: profile?.farm_name || '', location: profile?.location || '' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function save(e) {
    e.preventDefault()
    setSaving(true)
    await supabase.from('profiles').update(form).eq('id', user.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="page">
      <div className="page-header">
        <div><h1 className="page-title">{t('settingsTitle')}</h1><p className="page-sub">{t('settingsSub')}</p></div>
      </div>
      <div style={{ maxWidth: 560 }}>
        <div className="glass-card">
          <div className="card-header"><h3><User size={16} style={{ display: 'inline', marginRight: 6 }} />{t('farmProfile')}</h3></div>
          <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group"><label>{t('fullName')}</label><input placeholder={t('fullName')} value={form.full_name} onChange={e => upd('full_name', e.target.value)} /></div>
            <div className="form-group"><label><Building2 size={12} style={{ display: 'inline', marginRight: 4 }} />{t('farmName')}</label><input placeholder={t('farmName')} value={form.farm_name} onChange={e => upd('farm_name', e.target.value)} /></div>
            <div className="form-group">
              <label><MapPin size={12} style={{ display: 'inline', marginRight: 4 }} />{t('locationCity')}</label>
              <input placeholder="City name for weather (e.g. Pune)" value={form.location} onChange={e => upd('location', e.target.value)} />
              <p style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>{t('locationHint')}</p>
            </div>
            <div className="form-group"><label>{t('email')}</label><input value={user?.email || ''} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} /></div>
            <button type="submit" className="btn-primary" disabled={saving} style={{ alignSelf: 'flex-start' }}>
              {saving ? <><Loader2 size={14} className="spin" /> {t('saving')}</> : saved ? <><CheckCircle size={14} /> {t('saved')}</> : t('saveChanges')}
            </button>
          </form>
        </div>

        <div className="glass-card" style={{ marginTop: 20 }}>
          <div className="card-header"><h3>{t('mlModelInfo')}</h3></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              ['Model Type', 'RandomForest + GradientBoosting Ensemble'],
              ['Training Samples', '12,000 FAO-56 based synthetic records'],
              ['Features', '23 agronomic + weather variables'],
              ['Outputs', 'Irrigate decision · Urgency · Water volume · Efficiency'],
              ['Standard', 'FAO Irrigation & Drainage Paper No. 56'],
              ['API Endpoint', process.env.NEXT_PUBLIC_ML_API_URL ? `${process.env.NEXT_PUBLIC_ML_API_URL}/predict` : 'http://localhost:5000/predict'],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border2)', fontSize: 13 }}>
                <span style={{ color: 'var(--text2)', fontWeight: 600 }}>{k}</span>
                <span style={{ color: 'var(--text)', fontWeight: 700, textAlign: 'right', maxWidth: '60%' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
