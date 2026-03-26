'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { estimateYield } from '../../lib/yield-calculator'
import { CROP_MARKET_DATA, CATEGORIES, formatRs } from '../../lib/crop-market-data'
import { useTranslation } from '../../lib/i18n'
import { TrendingUp, TrendingDown, Minus, BarChart3, Sprout, Loader2, Search } from 'lucide-react'

export default function YieldPricePage() {
  const { t } = useTranslation()
  const [tab, setTab] = useState('overview')
  const [fields, setFields] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')

  useEffect(() => {
    supabase.from('fields').select('*').then(({ data }) => { setFields(data || []); setLoading(false) })
  }, [])

  const fieldYields = fields.map(f => ({ ...f, yieldData: estimateYield(f.crop_type, parseFloat(f.area_hectares) || 1, 75) }))
  const totalRevenue = fieldYields.reduce((s, f) => s + (f.yieldData?.marketValueRs || 0), 0)
  const totalYield = fieldYields.reduce((s, f) => s + (f.yieldData?.yieldTonnes || 0), 0)

  const filteredCrops = CROP_MARKET_DATA.filter(c =>
    (category === 'All' || c.category === category) &&
    c.crop.toLowerCase().includes(search.toLowerCase())
  )

  const trendIcon = tr => tr === 'up' ? <TrendingUp size={14} style={{ color: 'var(--green)' }} /> : tr === 'down' ? <TrendingDown size={14} style={{ color: 'var(--red)' }} /> : <Minus size={14} style={{ color: 'var(--amber)' }} />
  const trendColor = tr => tr === 'up' ? 'var(--green)' : tr === 'down' ? 'var(--red)' : 'var(--amber)'

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title"><BarChart3 size={22} style={{ display: 'inline', marginRight: 8, color: 'var(--blue)' }} />{t('yieldPrice')}</h1>
          <p className="page-sub">{t('yieldPriceSub')}</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { id: 'overview', label: t('tabOverview') },
          { id: 'prices', label: t('tabCropPrices') },
          { id: 'forecast', label: t('tabForecast') },
          { id: 'myYield', label: t('tabMyYield') },
        ].map(tb => (
          <button key={tb.id} onClick={() => setTab(tb.id)} style={{ padding: '9px 18px', borderRadius: 10, border: tab === tb.id ? 'none' : '1px solid var(--border2)', cursor: 'pointer', fontWeight: 700, fontSize: 13, background: tab === tb.id ? 'var(--green)' : 'var(--bg2)', color: tab === tb.id ? '#fff' : 'var(--text2)', transition: 'all 0.2s' }}>
            {tb.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {tab === 'overview' && (
        <>
          <div className="stats-grid" style={{ marginBottom: 24 }}>
            <div className="stat-card stat-blue"><div className="stat-icon"><TrendingUp /></div><div className="stat-content"><p className="stat-label">{t('totalYieldTonnes')}</p><p className="stat-value">{loading ? '—' : totalYield.toFixed(1)} <span className="stat-unit">{t('tonnesUnit')}</span></p></div></div>
            <div className="stat-card stat-green"><div className="stat-icon"><BarChart3 /></div><div className="stat-content"><p className="stat-label">{t('marketValueTotal')}</p><p className="stat-value">{loading ? '—' : formatRs(totalRevenue)}</p><p className="stat-trend">{t('mspSource')}</p></div></div>
            <div className="stat-card stat-purple"><div className="stat-icon"><Sprout /></div><div className="stat-content"><p className="stat-label">{t('fieldsTracked')}</p><p className="stat-value">{fields.length} <span className="stat-unit">{t('fields')}</span></p></div></div>
          </div>
          <div className="glass-card">
            <div className="card-header"><h3>📊 {t('marketOverview')} — {CROP_MARKET_DATA.length} {t('cropsTracked')}</h3></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
              {CATEGORIES.map(cat => {
                const crops = CROP_MARKET_DATA.filter(c => c.category === cat)
                const avgMSP = Math.round(crops.reduce((s, c) => s + c.mspRs, 0) / crops.length)
                const upCount = crops.filter(c => c.forecastTrend === 'up').length
                return (
                  <div key={cat} onClick={() => { setCategory(cat); setTab('prices') }} style={{ padding: '14px', background: 'var(--bg2)', borderRadius: 12, cursor: 'pointer', border: '1px solid var(--border2)', transition: 'border 0.2s' }}>
                    <p style={{ fontSize: 13, fontWeight: 800, marginBottom: 6 }}>{cat}</p>
                    <p style={{ fontSize: 12, color: 'var(--text2)' }}>{crops.length} {t('fields')}</p>
                    <p style={{ fontSize: 11, color: 'var(--green)', marginTop: 4 }}>↑ {upCount} {t('bullish')}</p>
                    <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{t('avgMsp')} ₹{avgMSP}/qtl</p>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}

      {/* CROP PRICES TAB */}
      {tab === 'prices' && (
        <>
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('searchCrop')} style={{ paddingLeft: 30, width: '100%' }} />
            </div>
            <select value={category} onChange={e => setCategory(e.target.value)} style={{ minWidth: 140 }}>
              <option value="All">{t('allCategories')}</option>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="fields-grid">
            {filteredCrops.map(c => (
              <div key={c.crop} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 800 }}>{c.crop}</h3>
                    <span style={{ fontSize: 11, color: 'var(--text3)', background: 'var(--bg2)', padding: '2px 8px', borderRadius: 6 }}>{c.category}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--blue)' }}>₹{c.apmc?.toLocaleString()}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>APMC {c.currency}</div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[
                    [t('msp2024'), `₹${c.mspRs?.toLocaleString()}/qtl`],
                    [t('yieldPerHa'), `${c.yieldPerHa} t/ha`],
                    [t('highSeasonPrice'), `₹${c.highSeasonPrice?.toLocaleString()}`],
                    [t('peakMonth'), c.highSeason],
                  ].map(([k, v]) => (
                    <div key={k} style={{ background: 'var(--bg2)', borderRadius: 8, padding: '8px 10px' }}>
                      <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 2 }}>{k}</div>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <div style={{ flex: 1, height: 6, background: 'var(--bg2)', borderRadius: 3, overflow: 'hidden', alignSelf: 'center' }}>
                    <div style={{ width: `${Math.min(100, ((c.apmc - c.lowSeasonPrice) / (c.highSeasonPrice - c.lowSeasonPrice + 1)) * 100)}%`, height: '100%', background: 'var(--blue)', borderRadius: 3 }} />
                  </div>
                  <span style={{ fontSize: 10, color: 'var(--text3)' }}>₹{c.lowSeasonPrice?.toLocaleString()} → ₹{c.highSeasonPrice?.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* PRICE FORECAST TAB */}
      {tab === 'forecast' && (
        <div className="fields-grid">
          {CROP_MARKET_DATA.map(c => (
            <div key={c.crop} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: 10, border: `1.5px solid ${c.forecastTrend === 'up' ? 'var(--green)' : c.forecastTrend === 'down' ? 'var(--red)' : 'var(--border2)'}30` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 800 }}>{c.crop}</h3>
                  <span style={{ fontSize: 11, color: 'var(--text3)' }}>{c.category}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: c.forecastTrend === 'up' ? 'var(--green-light)' : c.forecastTrend === 'down' ? 'var(--red-light)' : 'var(--amber-light)', borderRadius: 10 }}>
                  {trendIcon(c.forecastTrend)}
                  <span style={{ fontSize: 12, fontWeight: 800, color: trendColor(c.forecastTrend) }}>{c.forecast}</span>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                {[
                  [t('currentPrice'), `₹${c.apmc?.toLocaleString()}`, 'var(--text)'],
                  [t('lowSeason'), `₹${c.lowSeasonPrice?.toLocaleString()}`, 'var(--red)'],
                  [t('highSeasonPrice'), `₹${c.highSeasonPrice?.toLocaleString()}`, 'var(--green)'],
                ].map(([k, v, col]) => (
                  <div key={k} style={{ background: 'var(--bg2)', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: 'var(--text3)' }}>{k}</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: col }}>{v}</div>
                    <div style={{ fontSize: 9, color: 'var(--text3)' }}>/qtl</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text3)', padding: '6px 10px', background: 'var(--bg2)', borderRadius: 8 }}>
                📅 {t('bestWindow')}: <strong style={{ color: 'var(--amber)' }}>{c.highSeason}</strong>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MY YIELD TAB */}
      {tab === 'myYield' && (
        loading ? <div className="center-loader"><Loader2 size={40} className="spin" /></div> :
        fields.length === 0 ? <div className="empty-page"><Sprout size={64} /><h2>{t('noFieldsYet')}</h2><p>{t('yieldEmptyDesc')}</p></div> : (
          <>
            <div className="stats-grid" style={{ marginBottom: 24 }}>
              <div className="stat-card stat-blue"><div className="stat-icon"><TrendingUp /></div><div className="stat-content"><p className="stat-label">{t('totalYieldTonnes')}</p><p className="stat-value">{totalYield.toFixed(1)} <span className="stat-unit">{t('tonnesUnit')}</span></p></div></div>
              <div className="stat-card stat-green"><div className="stat-icon"><BarChart3 /></div><div className="stat-content"><p className="stat-label">{t('marketValueTotal')}</p><p className="stat-value">{formatRs(totalRevenue)}</p></div></div>
            </div>
            <div className="fields-grid">
              {fieldYields.map(f => {
                const { yieldData } = f
                const marketInfo = CROP_MARKET_DATA.find(c => c.crop === f.crop_type)
                if (!yieldData) return null
                return (
                  <div key={f.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Sprout size={18} color="var(--green)" />
                        <div>
                          <h3 style={{ fontSize: 16, fontWeight: 800 }}>{f.name}</h3>
                          <span style={{ fontSize: 12, color: 'var(--text2)' }}>{f.crop_type} · {f.area_hectares}ha</span>
                        </div>
                      </div>
                      <span style={{ fontSize: 20, fontWeight: 900, color: 'var(--green)' }}>{formatRs(yieldData.marketValueRs)}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                      {[
                        [t('estYield'), `${yieldData.yieldTonnes}t`, 'var(--green)'],
                        [t('quintalPrice'), `₹${yieldData.pricePerQuintal?.toLocaleString()}`, 'var(--blue)'],
                        [t('totalRevenue'), formatRs(yieldData.marketValueRs), 'var(--amber)'],
                      ].map(([k, v, col]) => (
                        <div key={k} className="rec-metric" style={{ background: 'var(--bg2)', borderRadius: 10, padding: '10px 12px' }}>
                          <div className="rec-metric-value" style={{ color: col, fontSize: 16 }}>{v}</div>
                          <div className="rec-metric-label">{k}</div>
                        </div>
                      ))}
                    </div>
                    {marketInfo && (
                      <div style={{ padding: '8px 12px', background: marketInfo.forecastTrend === 'up' ? 'var(--green-light)' : 'var(--amber-light)', borderRadius: 10, fontSize: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                        {trendIcon(marketInfo.forecastTrend)}
                        <span style={{ color: trendColor(marketInfo.forecastTrend), fontWeight: 700 }}>{t('priceForecastLabel')}: {marketInfo.forecast}</span>
                        <span style={{ color: 'var(--text3)', marginLeft: 'auto' }}>{t('bestWindow')}: {marketInfo.highSeason}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                      {[[t('quintalPrice'), `₹${yieldData.pricePerQuintal?.toLocaleString()}/qtl`], [t('totalQuintals'), `${(yieldData.yieldTonnes * 10).toFixed(0)} qtl`], [t('priceSource'), yieldData.priceSource]].map(([k, v]) => (
                        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '5px 0', borderBottom: '1px solid var(--border2)' }}>
                          <span style={{ color: 'var(--text2)' }}>{k}</span><span style={{ fontWeight: 700 }}>{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )
      )}
    </div>
  )
}
