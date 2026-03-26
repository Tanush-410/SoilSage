'use client'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Droplets, Eye, EyeOff, Loader2 } from 'lucide-react'

export default function AuthPage() {
  const [mode, setMode] = useState('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPw, setShowPw] = useState(false)
  const { signIn, signUp } = useAuth()
  const [form, setForm] = useState({ email: '', password: '', fullName: '', farmName: '', location: '' })
  const update = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') await signIn({ email: form.email, password: form.password })
      else await signUp({ email: form.email, password: form.password, fullName: form.fullName, farmName: form.farmName, location: form.location })
    } catch (err) { setError(err.message || 'Authentication failed') }
    finally { setLoading(false) }
  }

  return (
    <div className="auth-container">
      <div className="auth-bg-grid" />
      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-icon"><Droplets size={28} /></div>
          <div>
            <h1 className="logo-title">AquaAI</h1>
            <p className="logo-sub">Smart Irrigation System</p>
          </div>
        </div>
        <div className="auth-tabs">
          <button className={`auth-tab ${mode === 'login' ? 'active' : ''}`} onClick={() => { setMode('login'); setError('') }}>Sign In</button>
          <button className={`auth-tab ${mode === 'register' ? 'active' : ''}`} onClick={() => { setMode('register'); setError('') }}>Register</button>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'register' && (
            <>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" placeholder="John Farmer" value={form.fullName} onChange={e => update('fullName', e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Farm Name</label>
                <input type="text" placeholder="Green Acres Farm" value={form.farmName} onChange={e => update('farmName', e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Location / City</label>
                <input type="text" placeholder="Pune, Maharashtra" value={form.location} onChange={e => update('location', e.target.value)} />
              </div>
            </>
          )}
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" placeholder="farmer@example.com" value={form.email} onChange={e => update('email', e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <div className="input-icon-wrap">
              <input type={showPw ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={e => update('password', e.target.value)} required minLength={6} style={{ width: '100%' }} />
              <button type="button" className="input-icon-btn" onClick={() => setShowPw(p => !p)}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          {error && <div className="auth-error">{error}</div>}
          <button type="submit" className="btn-primary btn-full" disabled={loading}>
            {loading ? <><Loader2 size={16} className="spin" /> Processing...</> : mode === 'login' ? 'Sign In to AquaAI' : 'Create Account'}
          </button>
        </form>
        <p className="auth-footer">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button className="link-btn" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}>
            {mode === 'login' ? 'Register' : 'Sign In'}
          </button>
        </p>
        <div className="auth-features">
          <span>🌾 FAO-56 AI</span><span>💧 Water Efficient</span><span>📡 IoT Ready</span><span>⚡ Real-time</span>
        </div>
      </div>
    </div>
  )
}
