'use client'
import { useState } from 'react'
import { ChevronRight, TrendingUp, ExternalLink } from 'lucide-react'
import { getSchemesForCrop, getAllApplicableSchemes } from '@/lib/government-schemes'
import GovernmentSchemeCard from './GovernmentSchemeCard'

export default function SchemeRecommendations({ crop, region = 'Karnataka' }) {
  const [expandedIndex, setExpandedIndex] = useState(null)
  const [showAll, setShowAll] = useState(false)

  // Get schemes relevant to the crop
  const relevantSchemes = crop ? getSchemesForCrop(crop) : []
  const allSchemes = getAllApplicableSchemes()
  
  const schemesToShow = showAll ? allSchemes : relevantSchemes.slice(0, 3)
  const hasMore = relevantSchemes.length > 3 && !showAll

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(46, 125, 50, 0.05) 0%, rgba(76, 175, 80, 0.05) 100%)',
      borderRadius: 12,
      padding: 20,
      border: '1px solid rgba(76, 175, 80, 0.2)',
      marginBottom: 20
    }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 24 }}>💰</span>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1a2e1a', margin: 0 }}>
            Government Benefits & Schemes
          </h3>
          <span style={{
            background: '#2d8a4e',
            color: 'white',
            borderRadius: 4,
            padding: '4px 8px',
            fontSize: 11,
            fontWeight: 700,
            marginLeft: 'auto'
          }}>
            {region}
          </span>
        </div>
        <p style={{ fontSize: 13, color: '#666', margin: 0 }}>
          {crop 
            ? `${schemesToShow.length} schemes available for ${crop}` 
            : 'All government schemes for farmers'}
        </p>
      </div>

      {/* Schemes List */}
      {schemesToShow.length > 0 ? (
        <div style={{ display: 'grid', gap: 12, marginBottom: 16 }}>
          {schemesToShow.map((scheme, idx) => (
            <GovernmentSchemeCard 
              key={scheme.id} 
              scheme={scheme}
              isExpanded={expandedIndex === idx}
              onToggle={() => setExpandedIndex(expandedIndex === idx ? null : idx)}
            />
          ))}
        </div>
      ) : (
        <div style={{
          background: '#f5f5f5',
          padding: 16,
          borderRadius: 8,
          textAlign: 'center',
          color: '#666',
          fontSize: 13
        }}>
          {crop ? `No specific schemes found for ${crop}` : 'No schemes available'}
        </div>
      )}

      {/* Show More Button */}
      {hasMore && (
        <button
          onClick={() => setShowAll(true)}
          style={{
            width: '100%',
            padding: 12,
            background: '#2d8a4e',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.background = '#1f6037'}
          onMouseLeave={(e) => e.target.style.background = '#2d8a4e'}
        >
          View All {relevantSchemes.length} Schemes
          <ChevronRight size={16} />
        </button>
      )}

      {/* Quick Benefits Summary */}
      {schemesToShow.length > 0 && (
        <div style={{
          background: 'white',
          border: '1px solid rgba(76, 175, 80, 0.2)',
          borderRadius: 8,
          padding: 12,
          marginTop: 16
        }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#2d8a4e', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
            ✓ Total Benefits Available
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {schemesToShow.slice(0, 2).map((scheme) => (
              <div key={scheme.id}>
                <p style={{ fontSize: 12, color: '#666', margin: '0 0 4px 0' }}>
                  {scheme.name.split('(')[0].trim()}
                </p>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#2d8a4e', margin: 0 }}>
                  {scheme.benefit}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Box */}
      <div style={{
        background: 'rgba(76, 175, 80, 0.05)',
        border: '1px solid rgba(76, 175, 80, 0.2)',
        borderRadius: 8,
        padding: 12,
        marginTop: 16,
        fontSize: 11,
        color: '#1a2e1a',
        lineHeight: 1.6
      }}>
        <p style={{ margin: '0 0 8px 0', fontWeight: 700 }}>📌 How to Apply:</p>
        <ul style={{ margin: 0, paddingLeft: 20, color: '#666' }}>
          <li>Click on any scheme card to expand details</li>
          <li>Click "Call" button to contact the scheme authority</li>
          <li>Click "Apply Online" to visit official portal</li>
          <li>Most require proof of land ownership & Aadhaar</li>
        </ul>
      </div>
    </div>
  )
}
