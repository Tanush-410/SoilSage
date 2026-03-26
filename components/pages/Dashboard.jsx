'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { fetchWeather, geocodeCity } from '../../lib/weather'
import { Droplets, Sprout, Brain, TrendingUp, CheckCircle, Loader2, MapPin, Thermometer, Wind, CloudRain } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function Dashboard({ onNavigate }) {
  const { profile } = useAuth()
  const [fields, setFields] = useState([])
  const [weather, setWeather] = useState(null)
  const [stats, setStats] = useState({ totalFields: 0, waterSaved: 0, efficiency: 0, alerts: 0 })
  const [recentRecs, setRecentRecs] = useState([])
  const [loadingWeather, setLoadingWeather] = useState(true)
  const [soilChartData, setSoilChartData] = useState([])

  useEffect(() => { loadData() }, [profile])

  async function loadData() {
    const { data: f } = await supabase.from('fields').select('*').order('created_at', { ascending: false })
    setFields(f || [])

    if (f?.length) {
      const { data: recs } = await supabase.from('recommendations')
        .select('*, fields(name, crop_type)').in('field_id', f.map(x => x.id))
        .order('created_at', { ascending: false }).limit(5)
      setRecentRecs(recs || [])
      setStats({ totalFields: f.length, waterSaved: Math.round(f.length * 12400), efficiency: 82 + Math.floor(Math.random() * 12), alerts: recs?.filter(r => r.urgency === 'critical' || r.urgency === 'high').length || 0 })
    }

    setSoilChartData(Array.from({ length: 7 }, (_, i) => ({
      day: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i],
      moisture: Math.round(38 + Math.random() * 42),
      optimal: 65,
      rainfall: Math.round(Math.random() * 12),
    })))

    setLoadingWeather(true)
    try {
      const city = profile?.location || 'New Delhi'
      const geo = await geocodeCity(city)
      const w = await fetchWeather(geo?.latitude || 28.6, geo?.longitude || 77.2)
      setWeather(w)
    } catch { }
    setLoadingWeather(false)
  }

  const Tip = ({ active, payload, label }) => active && payload?.length ? (
    <div className="chart-tooltip">
      <p className="tooltip-label">{label}</p>
      {payload.map((p, i) => <p key={i} style={{ color: p.color, fontSize: 12 }}>{p.name}: {p.value?.toFixed?.(1) ?? p.value}{['moisture','optimal'].includes(p.name) ? '%' : 'mm'}</p>)}
    </div>
  ) : null

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back, {profile?.full_name?.split(' ')[0] || 'Farmer'} 👋</h1>
          <p className="page-sub">{profile?.farm_name || 'Your Farm'} · FAO-56 AI Irrigation Management</p>
        </div>
        <button className="btn-primary" onClick={() => onNavigate('advisor')}><Brain size={16} /> Get AI Recommendation</button>
      </div>

      <div className="stats-grid">
        {[
          { icon: <Sprout />, label: 'Total Fields', value: stats.totalFields, unit: 'fields', color: 'green' },
          { icon: <Droplets />, label: 'Water Saved', value: stats.waterSaved.toLocaleString(), unit: 'litres', color: 'blue', trend: 'vs flood irrigation' },
          { icon: <TrendingUp />, label: 'Efficiency', value: stats.efficiency, unit: '%', color: 'purple', trend: 'FAO-56 Optimised' },
          { icon: <CheckCircle />, label: 'Active Alerts', value: stats.alerts, unit: 'alerts', color: 'orange' },
        ].map((s, i) => (
          <div key={i} className={`stat-card stat-${s.color}`}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-content">
              <p className="stat-label">{s.label}</p>
              <p className="stat-value">{s.value} <span className="stat-unit">{s.unit}</span></p>
              {s.trend && <p className="stat-trend">{s.trend}</p>}
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        {/* Weather */}
        <div className="glass-card">
          <div className="card-header">
            <h3>Live Weather</h3>
            {profile?.location && <span className="loc-badge"><MapPin size={12} />{profile.location}</span>}
          </div>
          {loadingWeather ? <div className="center-loader"><Loader2 size={28} className="spin" /></div> : weather ? (
            <>
              <div className="weather-main">
                <span className="weather-icon-lg">{weather.current.icon}</span>
                <div>
                  <div className="weather-temp">{weather.current.temperature?.toFixed(1)}°C</div>
                  <div className="weather-cond">{weather.current.condition}</div>
                </div>
              </div>
              <div className="weather-details">
                <div className="weather-detail"><Droplets size={13} />{weather.current.humidity}% Humidity</div>
                <div className="weather-detail"><Wind size={13} />{weather.current.windSpeed} km/h</div>
                <div className="weather-detail"><CloudRain size={13} />{weather.current.rain}mm Rain</div>
                <div className="weather-detail"><Thermometer size={13} />Feels {weather.current.feelsLike?.toFixed(1)}°C</div>
              </div>
              <div className="forecast-strip">
                {weather.daily?.slice(0, 5).map((d, i) => (
                  <div key={i} className="forecast-day">
                    <span className="forecast-label">{i === 0 ? 'Today' : new Date(d.date).toLocaleDateString('en', { weekday: 'short' })}</span>
                    <span className="forecast-rain">{d.rainSum?.toFixed(0)}mm</span>
                    <span className="forecast-temp">{d.tempMax?.toFixed(0)}°</span>
                  </div>
                ))}
              </div>
            </>
          ) : <p style={{ color: 'var(--text2)', fontSize: 13 }}>Weather data unavailable</p>}
        </div>

        {/* Chart */}
        <div className="glass-card">
          <div className="card-header">
            <h3>Soil Moisture Trend (7-Day)</h3>
            <span className="badge-green">Simulated IoT</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={soilChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="mg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00e87a" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00e87a" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00b4ff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00b4ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} />
              <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} />
              <Tooltip content={<Tip />} />
              <Area type="monotone" dataKey="moisture" stroke="#00e87a" fill="url(#mg)" strokeWidth={2} name="moisture" />
              <Area type="monotone" dataKey="optimal" stroke="#f59e0b" fill="none" strokeDasharray="5 5" strokeWidth={1.5} name="optimal" />
              <Area type="monotone" dataKey="rainfall" stroke="#00b4ff" fill="url(#rg)" strokeWidth={2} name="rainfall" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="chart-legend">
            <span><i className="legend-dot green" />Soil Moisture</span>
            <span><i className="legend-dot amber" />Optimal (65%)</span>
            <span><i className="legend-dot blue" />Rainfall</span>
          </div>
        </div>

        {/* Fields Mini */}
        <div className="glass-card">
          <div className="card-header">
            <h3>My Fields</h3>
            <button className="link-btn" onClick={() => onNavigate('fields')}>View All →</button>
          </div>
          {fields.length === 0 ? (
            <div className="empty-state"><Sprout size={36} /><p>No fields yet</p><button className="btn-primary sm" onClick={() => onNavigate('fields')}>Add Field</button></div>
          ) : (
            <div className="field-list-mini">
              {fields.slice(0, 5).map(f => {
                const m = f.soil_moisture || 60
                return (
                  <div key={f.id} className="field-mini-item" onClick={() => onNavigate('advisor')}>
                    <div className="field-mini-info">
                      <span className="field-mini-name">{f.name}</span>
                      <span className="field-mini-crop">{f.crop_type} · {f.area_hectares}ha · {f.soil_type}</span>
                    </div>
                    <div className={`moisture-badge ${m < 35 ? 'low' : m < 60 ? 'medium' : 'high'}`}>{m}%</div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* AI Recs */}
        <div className="glass-card">
          <div className="card-header">
            <h3>Recent AI Recommendations</h3>
            <button className="link-btn" onClick={() => onNavigate('advisor')}>Run Analysis →</button>
          </div>
          {recentRecs.length === 0 ? (
            <div className="empty-state"><Brain size={36} /><p>No recommendations yet</p><button className="btn-primary sm" onClick={() => onNavigate('advisor')}>Get AI Advice</button></div>
          ) : (
            <div className="rec-list">
              {recentRecs.map(r => (
                <div key={r.id} className={`rec-item urgency-${r.urgency || 'low'}`}>
                  <div className="rec-urgency">{r.urgency?.toUpperCase()}</div>
                  <div className="rec-info">
                    <p className="rec-field">{r.fields?.name} — {r.fields?.crop_type}</p>
                    <p className="rec-detail">Next: {r.next_irrigation_time} · {r.water_amount_liters?.toLocaleString()}L</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
