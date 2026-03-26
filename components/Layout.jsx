'use client'
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from '../lib/i18n'
import { LayoutDashboard, Sprout, Brain, Calendar, History, LogOut, Droplets, Menu, X, ChevronRight, Settings, Globe, BarChart3, Bug, Activity } from 'lucide-react'
import Dashboard from './pages/Dashboard'
import Fields from './pages/Fields'
import Advisor from './pages/Advisor'
import Schedule from './pages/Schedule'
import HistoryPage from './pages/HistoryPage'
import SettingsPage from './pages/SettingsPage'
import YieldPricePage from './pages/YieldPricePage'
import SoilHealthPage from './pages/SoilHealthPage'
import PestControlPage from './pages/PestControlPage'

export default function Layout() {
  const { t, lang, setLang, languages } = useTranslation()
  const [page, setPage] = useState('dashboard')
  const [collapsed, setCollapsed] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [langMenuOpen, setLangMenuOpen] = useState(false)
  const langRef = useRef(null)
  const { profile, signOut } = useAuth()

  const navItems = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { id: 'fields', label: t('myFields'), icon: Sprout },
    { id: 'yield-price', label: t('yieldPrice'), icon: BarChart3 },
    { id: 'soil-health', label: t('soilHealth'), icon: Activity },
    { id: 'pest-control', label: 'Pest Monitor', icon: Bug },
    { id: 'advisor', label: t('aiAdvisor'), icon: Brain },
    { id: 'schedule', label: t('schedule'), icon: Calendar },
    { id: 'history', label: t('history'), icon: History },
  ]

  const pages = {
    dashboard: Dashboard,
    fields: Fields,
    'yield-price': YieldPricePage,
    'soil-health': SoilHealthPage,
    'pest-control': PestControlPage,
    advisor: Advisor,
    schedule: Schedule,
    history: HistoryPage,
    settings: SettingsPage,
  }
  const PageComponent = pages[page] || Dashboard

  useEffect(() => {
    if (!mobileNavOpen) return
    const handleResize = () => { if (window.innerWidth > 900) setMobileNavOpen(false) }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [mobileNavOpen])

  // Close lang menu on outside click
  useEffect(() => {
    function handler(e) { if (langRef.current && !langRef.current.contains(e.target)) setLangMenuOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function navigateTo(nextPage) { setPage(nextPage); setMobileNavOpen(false) }

  return (
    <div className="app-shell">
      {mobileNavOpen && <button className="sidebar-backdrop" onClick={() => setMobileNavOpen(false)} aria-label="Close navigation" />}

      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileNavOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-icon" style={{ width: 36, height: 36, borderRadius: 10 }}><Droplets size={18} /></div>
            {!collapsed && <span className="sidebar-brand">SoilSage</span>}
          </div>
          <button className="sidebar-toggle" onClick={() => setCollapsed(p => !p)}>
            {collapsed ? <Menu size={18} /> : <X size={18} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button key={id} className={`nav-item ${page === id ? 'active' : ''}`} onClick={() => navigateTo(id)} title={collapsed ? label : undefined}>
              <Icon size={20} />
              {!collapsed && <span>{label}</span>}
              {!collapsed && page === id && <ChevronRight size={14} className="nav-arrow" />}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          {!collapsed && (
            <div className="sidebar-user">
              <div className="user-avatar">{profile?.full_name?.[0]?.toUpperCase() || '🌾'}</div>
              <div className="user-info">
                <p className="user-name">{profile?.full_name || 'Farmer'}</p>
                <p className="user-farm">{profile?.farm_name || 'My Farm'}</p>
              </div>
            </div>
          )}
          <button className="nav-item" onClick={() => navigateTo('settings')} title={t('settings')}>
            <Settings size={18} />
            {!collapsed && <span>{t('settings')}</span>}
          </button>
          <button className="nav-item danger" onClick={() => { setMobileNavOpen(false); signOut() }} title={t('signOut')}>
            <LogOut size={18} />
            {!collapsed && <span>{t('signOut')}</span>}
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div className="topbar">
          <div className="topbar-left">
            <button className="mobile-menu-btn" onClick={() => setMobileNavOpen(true)} aria-label="Open navigation">
              <Menu size={18} />
            </button>
            <div className="live-indicator">Live</div>
            <span className="topbar-date">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>

          {/* Language selector — government-website style, top-right */}
          <div ref={langRef} style={{ position: 'relative', marginLeft: 'auto' }}>
            <button
              onClick={() => setLangMenuOpen(p => !p)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'var(--green)', color: '#fff', border: 'none',
                borderRadius: 8, padding: '7px 14px', cursor: 'pointer',
                fontWeight: 700, fontSize: 13, fontFamily: 'var(--font)',
                boxShadow: '0 2px 8px rgba(45,138,78,0.25)',
              }}
              aria-label="Change language"
            >
              <Globe size={15} />
              <span>{languages[lang]?.name}</span>
              <span style={{ fontSize: 10, opacity: 0.75 }}>▾</span>
            </button>

            {langMenuOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 500,
                background: '#fff', border: '1px solid var(--border2)',
                borderRadius: 12, boxShadow: '0 8px 28px rgba(0,0,0,0.13)',
                minWidth: 180, overflow: 'hidden',
              }}>
                <div style={{ padding: '8px 14px 6px', fontSize: 10, fontWeight: 800, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 1 }}>
                  {t('language')}
                </div>
                {Object.entries(languages).map(([code, { name, flag }]) => (
                  <button
                    key={code}
                    onClick={() => { setLang(code); setLangMenuOpen(false) }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      width: '100%', padding: '10px 16px', border: 'none', cursor: 'pointer',
                      background: lang === code ? 'var(--green-light)' : '#fff',
                      color: lang === code ? 'var(--green)' : 'var(--text)',
                      fontSize: 14, fontWeight: lang === code ? 700 : 500,
                      fontFamily: 'var(--font)', textAlign: 'left',
                      borderLeft: lang === code ? '3px solid var(--green)' : '3px solid transparent',
                    }}
                  >
                    <span>{flag}</span>
                    <span>{name}</span>
                    {lang === code && <span style={{ marginLeft: 'auto', fontSize: 12 }}>✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="page-content">
          <PageComponent onNavigate={navigateTo} />
        </div>
      </main>
    </div>
  )
}
