'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AuthProvider, useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import AuthPage from '../components/AuthPage'
import { Droplets, Loader2 } from 'lucide-react'

function AppRoot() {
  const { user, loading } = useAuth()
  const router = useRouter()

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="logo-icon" style={{ width: 56, height: 56, borderRadius: 16 }}>
          <Droplets size={28} />
        </div>
        <Loader2 size={24} className="spin" />
        <p style={{ fontSize: 14, color: 'var(--text2)' }}>Initialising SoilSage...</p>
      </div>
    )
  }

  if (!user) return <AuthPage />
  return <Layout />
}

export default function RootPage() {
  return (
    <AuthProvider>
      <AppRoot />
    </AuthProvider>
  )
}
