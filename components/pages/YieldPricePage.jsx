'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { estimateYield, formatRupees } from '../../lib/yield-calculator'
import { useTranslation } from '../../lib/i18n'
import { TrendingUp, Loader2, Sprout, BarChart3 } from 'lucide-react'

export default function YieldPricePage() {
  const { t } = useTranslation()
  const [fields, setFields] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('fields').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      setFields(data || [])
      setLoading(false)
    })
  }, [])

  const allYields = fields.map(f => ({
    ...f,
    yieldData: estimateYield(f.crop_type, parseFloat(f.area_hectares) || 1, 75),
  }))

  const totalRevenue = allYields.reduce((s, f) => s + (f.yieldData?.marketValueRs || 0), 0)
  const totalYield = allYields.reduce((s, f) => s + (f.yieldData?.yieldTonnes || 0), 0)

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title"><BarChart3 size={22} style={{ display: 'inline', marginRight: 8, color: 'var(--blue)' }} />{t('yieldPrice')}</h1>
          <p className="page-sub">Per-crop yield estimates · MSP/APMC 2024-25 market rates · Efficiency-adjusted</p>
        </div>
      </div>

      {/* Summary Cards */}
      {!loading && fields.length > 0 && (
        <div className="stats-grid" style={{ marginBottom: 24 }}>
          <div className="stat-card stat-blue">
            <div className="stat-icon"><TrendingUp /></div>
            <div className="stat-content">
              <p className="stat-label">Total Est. Yield</p>
              <p className="stat-value">{totalYield.toFixed(1)} <span className="stat-unit">tonnes</span></p>
            </div>
          </div>
          <div className="stat-card stat-green">
            <div className="stat-icon"><BarChart3 /></div>
            <div className="stat-content">
              <p className="stat-label">Total Market Value</p>
              <p className="stat-value">{formatRupees(totalRevenue)}</p>
              <p className="stat-trend">Based on MSP/APMC rates</p>
            </div>
          </div>
          <div className="stat-card stat-purple">
            <div className="stat-icon"><Sprout /></div>
            <div className="stat-content">
              <p className="stat-label">Fields Tracked</p>
              <p className="stat-value">{fields.length} <span className="stat-unit">fields</span></p>
            </div>
          </div>
        </div>
      )}

      {loading ? <div className="center-loader"><Loader2 size={40} className="spin" /></div>
        : fields.length === 0 ? (
          <div className="empty-page">
            <BarChart3 size={64} />
            <h2>No Fields Found</h2>
            <p>Add fields in "My Fields" to see yield and market value estimates.</p>
          </div>
        ) : (
          <div className="fields-grid">
            {allYields.map(f => {
              const { yieldData } = f
              if (!yieldData) return null
              return (
                <div key={f.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Sprout size={18} color="var(--green)" />
                      <div>
                        <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)' }}>{f.name}</h3>
                        <span style={{ fontSize: 12, color: 'var(--text2)' }}>{f.crop_type} · {f.area_hectares} ha · {f.soil_type}</span>
                      </div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, background: 'var(--blue-light)', color: 'var(--blue)', padding: '4px 10px', borderRadius: 8 }}>{f.growth_stage || 'Vegetative'}</span>
                  </div>

                  {/* Yield & Revenue */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                    {[
                      { label: 'Est. Yield', value: `${yieldData.yieldTonnes}t`, sub: `${yieldData.yieldPerHa} t/ha`, color: 'var(--green)' },
                      { label: 'Market Value', value: formatRupees(yieldData.marketValueRs), sub: `₹${yieldData.pricePerQuintal?.toLocaleString()}/quintal`, color: 'var(--blue)' },
                      { label: 'Area', value: `${f.area_hectares} ha`, sub: `${(f.area_hectares * 2.47).toFixed(1)} acres`, color: 'var(--amber)' },
                    ].map(({ label, value, sub, color }) => (
                      <div key={label} className="rec-metric" style={{ background: 'var(--bg2)', borderRadius: 12, padding: '12px 14px' }}>
                        <div className="rec-metric-value" style={{ color, fontSize: 18 }}>{value}</div>
                        <div className="rec-metric-label" style={{ marginTop: 2 }}>{label}</div>
                        <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>{sub}</div>
                      </div>
                    ))}
                  </div>

                  {/* Price source */}
                  <div style={{ padding: '8px 12px', background: 'rgba(0,180,255,0.06)', borderRadius: 10, fontSize: 12, color: 'var(--text2)', borderLeft: '3px solid var(--blue)' }}>
                    <strong style={{ color: 'var(--blue)' }}>Price Source:</strong> {yieldData.priceSource} · Yield adjusted for FAO-56 irrigation efficiency
                  </div>

                  {/* Raw market price breakdown */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {[
                      ['Quintal Price', `₹${yieldData.pricePerQuintal?.toLocaleString()}/qtl`],
                      ['Total Quintals', `${(yieldData.yieldTonnes * 10).toFixed(0)} qtl`],
                      ['Total Revenue', `₹${yieldData.marketValueRs?.toLocaleString()}`],
                    ].map(([k, v]) => (
                      <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '6px 0', borderBottom: '1px solid var(--border2)' }}>
                        <span style={{ color: 'var(--text2)' }}>{k}</span>
                        <span style={{ fontWeight: 700 }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
    </div>
  )
}
