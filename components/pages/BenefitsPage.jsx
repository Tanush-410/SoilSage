'use client'
import { useState, useMemo } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useTranslation } from '@/lib/i18n'
import { getAllApplicableSchemes, getSchemesForCrop } from '@/lib/government-schemes'
import { Search, TrendingUp, Leaf } from 'lucide-react'
import GovernmentSchemeCard from '../GovernmentSchemeCard'

export default function BenefitsPage({ onNavigate }) {
  const { profile } = useAuth()
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedIndex, setExpandedIndex] = useState(null)
  const allSchemes = getAllApplicableSchemes()

  // Get recommended schemes based on farmer profile
  const recommendedSchemes = useMemo(() => {
    if (!allSchemes || allSchemes.length === 0) return []
    
    let recommended = []
    
    // PM-KISAN is universal for all farmers - ALWAYS include
    const pmKisan = allSchemes.find(s => s.id === 'PM-KISAN')
    if (pmKisan) recommended.push(pmKisan)
    
    // Add insurance (universal) - ALWAYS include
    const insurance = allSchemes.find(s => s.id === 'PMFBY')
    if (insurance && !recommended.find(s => s.id === insurance.id)) {
      recommended.push(insurance)
    }
    
    // Add soil health card (universal) - ALWAYS include
    const soilHealth = allSchemes.find(s => s.id === 'Soil Health Card')
    if (soilHealth && !recommended.find(s => s.id === soilHealth.id)) {
      recommended.push(soilHealth)
    }
    
    // Add crop-specific schemes if crop is available
    if (profile?.crop_type) {
      try {
        const cropSchemes = getSchemesForCrop(profile.crop_type)
        if (Array.isArray(cropSchemes)) {
          cropSchemes.forEach(scheme => {
            if (!recommended.find(s => s.id === scheme.id)) {
              recommended.push(scheme)
            }
          })
        }
      } catch (e) {
        console.error('Error fetching crop schemes:', e)
      }
    }
    
    // If still empty, add a few more universal schemes
    if (recommended.length < 3) {
      const rkvy = allSchemes.find(s => s.id === 'RKVY-RAFTAAR')
      if (rkvy && !recommended.find(s => s.id === rkvy.id)) {
        recommended.push(rkvy)
      }
    }
    
    return recommended.slice(0, 4) // Top 4 recommendations
  }, [profile?.crop_type, allSchemes])

  // Filter other schemes (exclude recommended)
  const otherSchemes = useMemo(() => {
    if (!allSchemes || allSchemes.length === 0) return []
    
    let other = allSchemes.filter(s => !recommendedSchemes.find(r => r.id === s.id))
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      other = other.filter(s => 
        s.name.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query) ||
        s.benefit.toLowerCase().includes(query)
      )
    }
    
    return other
  }, [searchQuery, allSchemes, recommendedSchemes])

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Government Benefits & Schemes</h1>
          <p className="page-sub">Explore schemes available for farmers in {profile?.location || 'Karnataka'}</p>
        </div>
      </div>

      {/* Recommended Schemes Section */}
      {recommendedSchemes.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <TrendingUp size={24} color="#2d8a4e" />
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1a2e1a', margin: 0 }}>
              Recommended for You
            </h2>
            <span style={{
              background: '#2d8a4e',
              color: 'white',
              borderRadius: 4,
              padding: '4px 8px',
              fontSize: 11,
              fontWeight: 700
            }}>
              {recommendedSchemes.length} match
            </span>
          </div>
          <p style={{ fontSize: 13, color: '#666', margin: '0 0 16px 0' }}>
            Based on your crop type, location, and eligibility
          </p>
          <div style={{ display: 'grid', gap: 16, marginBottom: 24 }}>
            {recommendedSchemes.map((scheme, idx) => (
              <GovernmentSchemeCard 
                key={scheme.id}
                scheme={scheme}
                isExpanded={expandedIndex === `rec-${idx}`}
                onToggle={() => setExpandedIndex(expandedIndex === `rec-${idx}` ? null : `rec-${idx}`)}
              />
            ))}
          </div>
          <div style={{ height: 2, background: 'linear-gradient(90deg, #2d8a4e, transparent)', marginBottom: 24 }} />
        </div>
      )}

      {/* All Other Schemes Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Leaf size={24} color="#2d8a4e" />
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1a2e1a', margin: 0 }}>
            All Other Schemes
          </h2>
          <span style={{
            background: '#e8e8e8',
            color: '#333',
            borderRadius: 4,
            padding: '4px 8px',
            fontSize: 11,
            fontWeight: 700
          }}>
            {allSchemes.length - recommendedSchemes.length} schemes
          </span>
        </div>

        {/* Search Box */}
        <div style={{ 
          background: 'white',
          border: '2px solid #2d8a4e',
          borderRadius: 8,
          padding: 12,
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}>
          <Search size={20} color="#2d8a4e" />
          <input
            type="text"
            placeholder="Search schemes by name, benefit, or eligibility..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: 14,
              fontFamily: 'inherit'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 18,
                padding: 4
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Schemes Grid */}
        {otherSchemes.length > 0 ? (
          <div style={{ display: 'grid', gap: 16 }}>
            {otherSchemes.map((scheme, idx) => (
              <div key={scheme.id}>
                <GovernmentSchemeCard 
                  scheme={scheme}
                  isExpanded={expandedIndex === `other-${idx}`}
                  onToggle={() => setExpandedIndex(expandedIndex === `other-${idx}` ? null : `other-${idx}`)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            background: '#f5f5f5',
            border: '2px dashed #ddd',
            borderRadius: 12,
            padding: 40,
            textAlign: 'center',
            color: '#666'
          }}>
            <p style={{ fontSize: 16, fontWeight: 600, margin: '0 0 8px 0' }}>
              No other schemes found
            </p>
            <p style={{ fontSize: 13, margin: 0 }}>
              Try adjusting your search to find more schemes.
            </p>
          </div>
        )}
      </div>

      {/* Help Section */}
      <div style={{
        background: '#e8f5ee',
        border: '2px solid #2d8a4e',
        borderRadius: 8,
        padding: 20,
        marginTop: 24,
        textAlign: 'center'
      }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#2d8a4e', margin: '0 0 8px 0' }}>
          🆘 Need Emergency Help?
        </p>
        <p style={{ fontSize: 12, color: '#1a2e1a', margin: '0 0 12px 0' }}>
          If you're facing a crisis like floods, pests, or droughts, get immediate action steps and helpline numbers.
        </p>
        <button
          onClick={() => onNavigate?.('emergency')}
          style={{
            background: '#2d8a4e',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            padding: '10px 20px',
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.background = '#1f6037'}
          onMouseLeave={(e) => e.target.style.background = '#2d8a4e'}
        >
          Go to Emergency Help →
        </button>
      </div>
    </div>
  )
}
