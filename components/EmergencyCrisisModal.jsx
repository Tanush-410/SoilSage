'use client'
import { useState } from 'react'
import { X, Phone, AlertCircle, CheckCircle, Clock, MapPin } from 'lucide-react'
import { EMERGENCY_SOLUTIONS } from '@/lib/emergency-solutions'

export default function EmergencyCrisisModal({ isOpen, onClose, emergencyType = 'flood' }) {
  const [selectedEmergency, setSelectedEmergency] = useState(emergencyType)
  const emergency = EMERGENCY_SOLUTIONS[selectedEmergency]

  if (!isOpen || !emergency) return null

  const severityColors = {
    critical: '#c0392b',
    high: '#e74c3c',
    medium: '#f39c12'
  }

  const callHelpline = (number) => {
    window.open(`tel:${number.replace(/[^0-9]/g, '')}`)
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: 16
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'white',
          borderRadius: 16,
          maxWidth: 600,
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: '#f5f5f5',
            border: 'none',
            borderRadius: '50%',
            width: 40,
            height: 40,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10
          }}
        >
          <X size={20} color="#666" />
        </button>

        {/* Header */}
        <div
          style={{
            background: emergency.color,
            color: 'white',
            padding: 24,
            borderRadius: '16px 16px 0 0'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <span style={{ fontSize: 40 }}>{emergency.icon}</span>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>{emergency.name}</h2>
              <p style={{ fontSize: 13, margin: '4px 0 0 0', opacity: 0.9 }}>
                ⚠️ {emergency.severity.toUpperCase()} PRIORITY
              </p>
            </div>
          </div>
        </div>

        {/* Emergency Selector */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            padding: 16,
            borderBottom: '1px solid #e0e0e0',
            overflowX: 'auto'
          }}
        >
          {Object.values(EMERGENCY_SOLUTIONS).map((emerg) => (
            <button
              key={emerg.id}
              onClick={() => setSelectedEmergency(emerg.id)}
              style={{
                padding: '8px 12px',
                borderRadius: 6,
                border: selectedEmergency === emerg.id ? `2px solid ${emerg.color}` : '1px solid #ddd',
                background: selectedEmergency === emerg.id ? emerg.color : '#f5f5f5',
                color: selectedEmergency === emerg.id ? 'white' : '#333',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 12,
                whiteSpace: 'nowrap',
                transition: 'all 0.2s'
              }}
            >
              {emerg.icon} {emerg.name.split(' ')[0]}
            </button>
          ))}
        </div>

        <div style={{ padding: 24 }}>
          {/* Critical Alert */}
          {emergency.severity === 'critical' && (
            <div
              style={{
                background: '#fdecea',
                border: '2px solid #c0392b',
                padding: 12,
                borderRadius: 8,
                marginBottom: 16,
                display: 'flex',
                gap: 10,
                alignItems: 'flex-start'
              }}
            >
              <AlertCircle size={20} color="#c0392b" style={{ flexShrink: 0 }} />
              <div>
                <p style={{ fontWeight: 700, color: '#c0392b', margin: '0 0 4px 0', fontSize: 13 }}>
                  IMMEDIATE ACTION REQUIRED
                </p>
                <p style={{ fontSize: 12, color: '#a02d22', margin: 0 }}>
                  Act within the next 2-4 hours to minimize crop loss
                </p>
              </div>
            </div>
          )}

          {/* Action Steps */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1a2e1a', marginBottom: 16 }}>
              📋 Step-by-Step Action Plan:
            </h3>
            {emergency.steps.map((step, idx) => (
              <div
                key={idx}
                style={{
                  background: idx % 2 === 0 ? '#f9f9f9' : 'white',
                  border: '1px solid #e0e0e0',
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 12,
                  borderLeft: `4px solid ${emergency.color}`
                }}
              >
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div
                    style={{
                      background: emergency.color,
                      color: 'white',
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: 14,
                      flexShrink: 0
                    }}
                  >
                    {step.no}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, color: '#1a2e1a', margin: '0 0 4px 0', fontSize: 13 }}>
                      {step.action}
                    </p>
                    <p style={{ fontSize: 12, color: '#666', margin: '0 0 6px 0' }}>{step.details}</p>
                    <p
                      style={{
                        fontSize: 11,
                        color: emergency.color,
                        fontWeight: 600,
                        margin: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      <Clock size={14} /> {step.duration}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Emergency Contacts */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1a2e1a', marginBottom: 12 }}>
              📞 Emergency Contacts:
            </h3>
            <div style={{ display: 'grid', gap: 10 }}>
              {emergency.contacts.map((contact, idx) => (
                <div
                  key={idx}
                  style={{
                    background: '#f0f0f0',
                    border: `1px solid ${emergency.color}30`,
                    borderRadius: 8,
                    padding: 12,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <p style={{ fontWeight: 700, color: '#1a2e1a', margin: '0 0 4px 0', fontSize: 12 }}>
                      {contact.type}
                    </p>
                    <p style={{ fontSize: 11, color: '#666', margin: 0 }}>{contact.description}</p>
                  </div>
                  <button
                    onClick={() => callHelpline(contact.number)}
                    style={{
                      background: emergency.color,
                      color: 'white',
                      border: 'none',
                      borderRadius: 6,
                      padding: '8px 12px',
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: 11,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <Phone size={14} /> Call
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Resources */}
          {emergency.resources && (
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1a2e1a', marginBottom: 12 }}>
                🔗 Helpful Resources:
              </h3>
              <div style={{ background: '#e8f5ee', padding: 12, borderRadius: 8, borderLeft: `4px solid ${emergency.color}` }}>
                {emergency.resources.map((resource, idx) => (
                  <p key={idx} style={{ fontSize: 12, color: '#1a2e1a', margin: '8px 0', paddingLeft: 16 }}>
                    • {resource}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Prevention Tips */}
          {emergency.prevention && (
            <div
              style={{
                background: '#e8f5ee',
                border: '2px solid #2d8a4e',
                padding: 12,
                borderRadius: 8,
                display: 'flex',
                gap: 10,
                alignItems: 'flex-start'
              }}
            >
              <CheckCircle size={20} color="#2d8a4e" style={{ flexShrink: 0 }} />
              <div>
                <p style={{ fontWeight: 700, color: '#2d8a4e', margin: '0 0 4px 0', fontSize: 12 }}>
                  🛡️ Prevention for Next Time:
                </p>
                <p style={{ fontSize: 11, color: '#1a2e1a', margin: 0 }}>{emergency.prevention}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Action */}
        <div style={{ background: '#f5f5f5', padding: 16, borderTop: '1px solid #e0e0e0', borderRadius: '0 0 16px 16px' }}>
          <button
            onClick={onClose}
            style={{
              width: '100%',
              padding: 12,
              background: emergency.color,
              color: 'white',
              border: 'none',
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer'
            }}
          >
            Close & Take Action ✓
          </button>
        </div>
      </div>
    </div>
  )
}
