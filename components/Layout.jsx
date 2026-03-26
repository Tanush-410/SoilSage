'use client'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { LayoutDashboard, Sprout, Brain, Calendar, History, LogOut, Droplets, Menu, X, ChevronRight, Settings, Wifi } from 'lucide-react'
import Dashboard from './pages/Dashboard'
import Fields from './pages/Fields'
import Advisor from './pages/Advisor'
import Schedule from './pages/Schedule'
import HistoryPage from './pages/HistoryPage'
import SettingsPage from './pages/SettingsPage'

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'fields', label: 'My Fields', icon: Sprout },
  { id: 'advisor', label: 'AI Advisor', icon: Brain },
  { id: 'schedule', label: 'Schedule', icon: Calendar },
  { id: 'history', label: 'History', icon: History },
]

export default function Layout() {
  const [page, setPage] = useState('dashboard')
  const [collapsed, setCollapsed] = useState(false)
  const { profile, signOut } = useAuth()

  const pages = { dashboard: Dashboard, fields: Fields, advisor: Advisor, schedule: Schedule, history: HistoryPage, settings: SettingsPage }
  const PageComponent = pages[page] || Dashboard

  return (
    <div className="app-shell">
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
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
            <button key={id} className={`nav-item ${page === id ? 'active' : ''}`} onClick={() => setPage(id)} title={collapsed ? label : undefined}>
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
          <button className="nav-item" onClick={() => setPage('settings')} title="Settings">
            <Settings size={18} />
            {!collapsed && <span>Settings</span>}
          </button>
          <button className="nav-item danger" onClick={signOut} title="Logout">
            <LogOut size={18} />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div className="topbar">
          <div className="topbar-left">
            <div className="live-indicator">Live</div>
            <span className="topbar-date">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
          <div className="topbar-right">
            <div className="status-badge">
              <Wifi size={12} /> FAO-56 Engine Online
            </div>
          </div>
        </div>
        <div className="page-content">
          <PageComponent onNavigate={setPage} />
        </div>
      </main>
    </div>
  )
}
