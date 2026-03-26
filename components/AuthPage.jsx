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

  async function handleGoogle() {
    try {
      setLoading(true)
      const { error: oe } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
      })
      if (oe) throw oe
    } catch (err) {
      setError(err.message || 'Google Auth failed')
      setLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    // Input Validation
    const emailStr = form.email.trim()
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!validEmail.test(emailStr)) {
      setError('Please enter a valid email address.')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    if (mode === 'register') {
      if (form.fullName.trim().length < 2) {
        setError('Please enter your full name.')
        return
      }
      if (form.farmName.trim().length < 3) {
        setError('Please enter a valid farm name.')
        return
      }
    }

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
            <h1 className="logo-title">SoilSage</h1>
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
            {loading ? <><Loader2 size={16} className="spin" /> Processing...</> : mode === 'login' ? 'Sign In to SoilSage' : 'Create Account'}
          </button>
          
          <div style={{ textAlign: 'center', margin: '14px 0', fontSize: 13, color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }}></div>
            <span>or</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }}></div>
          </div>

          <button type="button" onClick={handleGoogle} className="btn-ghost btn-full" disabled={loading} style={{ border: '1px solid var(--border2)', display: 'flex', justifyContent: 'center', gap: 8 }}>
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
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
