'use client'
import { useState } from 'react'
import { MapPin, Phone, ExternalLink, Info, Copy, Check } from 'lucide-react'

export default function GovernmentSchemeCard({ scheme, onApply, isExpanded: propsExpanded, onToggle }) {
  const [copied, setCopied] = useState(false)
  const [localExpanded, setLocalExpanded] = useState(false)
  
  // Use prop-controlled state if provided, otherwise use local state
  const expanded = propsExpanded !== undefined ? propsExpanded : localExpanded
  const handleToggle = onToggle ? onToggle : () => setLocalExpanded(!localExpanded)

  const copyHelpline = () => {
    navigator.clipboard.writeText(scheme.helpline)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const callHelpline = () => {
    window.open(`tel:${scheme.helpline.replace(/[^0-9]/g, '')}`)
  }

  return (
    <div
      className="scheme-card"
      style={{
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        border: '2px solid #2d8a4e',
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
        transition: 'all 0.3s ease',
        cursor: 'pointer'
      }}
      onClick={() => handleToggle()}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <span style={{ fontSize: 28 }}>{scheme.icon}</span>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1a2e1a', margin: 0 }}>
                {scheme.name}
              </h3>
              <p style={{ fontSize: 12, color: '#2d8a4e', margin: '4px 0 0 0', fontWeight: 600 }}>
                {scheme.description}
              </p>
            </div>
          </div>
        </div>
        <span style={{ fontSize: 20, color: '#2d8a4e' }}>{expanded ? '▼' : '▶'}</span>
      </div>

      {/* Benefit Highlight */}
      <div
        style={{
          background: '#e8f5ee',
          padding: 12,
          borderRadius: 8,
          marginTop: 12,
          marginBottom: expanded ? 12 : 0,
          borderLeft: '4px solid #2d8a4e'
        }}
      >
        <p style={{ fontSize: 13, fontWeight: 700, color: '#2d8a4e', margin: 0 }}>
          💰 {scheme.benefit}
        </p>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #d1e3bb' }}>
          {/* Eligibility */}
          {scheme.eligibility && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#1a2e1a', marginBottom: 8 }}>
                ✓ Eligibility:
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {scheme.eligibility.map((el, i) => (
                  <span
                    key={i}
                    style={{
                      background: '#f0f0f0',
                      padding: '4px 10px',
                      borderRadius: 4,
                      fontSize: 11,
                      color: '#1a2e1a'
                    }}
                  >
                    {el}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Crops (if applicable) */}
          {scheme.crops && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#1a2e1a', marginBottom: 8 }}>
                🌾 Applicable Crops:
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {scheme.crops.map((crop, i) => (
                  <span key={i} style={{ fontSize: 11, color: '#2d8a4e', fontWeight: 600 }}>
                    {crop}
                    {i < scheme.crops.length - 1 && ', '}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* What's Covered */}
          {scheme.whatsCovered && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#1a2e1a', marginBottom: 8 }}>
                ✓ Covers:
              </p>
              <p style={{ fontSize: 11, color: '#666', margin: 0 }}>{scheme.whatsCovered}</p>
            </div>
          )}

          {/* Criteria */}
          {scheme.criteria && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#1a2e1a', marginBottom: 8 }}>
                📋 Required Documents:
              </p>
              <p style={{ fontSize: 11, color: '#666', margin: 0 }}>{scheme.criteria}</p>
            </div>
          )}

          {/* Premium */}
          {scheme.premium && (
            <div style={{ marginBottom: 16, background: '#fff9e6', padding: 10, borderRadius: 6 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#b45309', marginBottom: 4 }}>
                💳 Premium: {scheme.premium}
              </p>
            </div>
          )}

          {/* Helpline */}
          {scheme.helpline && (
            <div
              style={{
                background: '#e8f5ee',
                padding: 12,
                borderRadius: 8,
                marginBottom: 12,
                borderLeft: '4px solid #2d8a4e'
              }}
            >
              <p style={{ fontSize: 11, fontWeight: 700, color: '#2d8a4e', marginBottom: 8 }}>
                📞 Helpline:
              </p>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'white',
                  padding: 8,
                  borderRadius: 6
                }}
              >
                <Phone size={16} color="#2d8a4e" />
                <code style={{ fontSize: 13, fontWeight: 700, color: '#1a2e1a', flex: 1 }}>
                  {scheme.helpline}
                </code>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    callHelpline()
                  }}
                  style={{
                    background: '#2d8a4e',
                    color: 'white',
                    border: 'none',
                    padding: '6px 10px',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: 11,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  <Phone size={12} /> Call
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    copyHelpline()
                  }}
                  style={{
                    background: '#f0f0f0',
                    border: 'none',
                    padding: '6px 10px',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: 11,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                </button>
              </div>
            </div>
          )}

          {/* Resources */}
          {scheme.resources && (
            <div style={{ marginBottom: 12 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#1a2e1a', marginBottom: 8 }}>
                📚 Resources:
              </p>
              {scheme.resources.map((res, i) => (
                <p key={i} style={{ fontSize: 11, color: '#666', margin: '4px 0', paddingLeft: 16 }}>
                  • {res}
                </p>
              ))}
            </div>
          )}

          {/* Prevention/Next Steps */}
          {scheme.prevention && (
            <div style={{ marginBottom: 12, background: '#f5f5f5', padding: 10, borderRadius: 6 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#1a2e1a', marginBottom: 4 }}>
                💡 Next Step:
              </p>
              <p style={{ fontSize: 11, color: '#666', margin: 0 }}>{scheme.prevention}</p>
            </div>
          )}

          {scheme.nextStep && (
            <div style={{ marginBottom: 12, background: '#f5f5f5', padding: 10, borderRadius: 6 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#1a2e1a', marginBottom: 4 }}>
                📌 Next Step:
              </p>
              <p style={{ fontSize: 11, color: '#666', margin: 0 }}>{scheme.nextStep}</p>
            </div>
          )}

          {/* Application Button */}
          {scheme.applicationLink && (
            <a
              href={scheme.applicationLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                width: '100%',
                padding: 12,
                background: '#2d8a4e',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: 13,
                textDecoration: 'none',
                textAlign: 'center'
              }}
            >
              <ExternalLink size={16} /> Apply Online
            </a>
          )}
        </div>
      )}
    </div>
  )
}
