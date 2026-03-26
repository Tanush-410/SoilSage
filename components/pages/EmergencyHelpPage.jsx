'use client'
import { useState, useMemo } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useTranslation } from '@/lib/i18n'
import { EMERGENCY_SOLUTIONS, checkWeatherEmergency } from '@/lib/emergency-solutions'
import { Phone, AlertCircle, CheckCircle2, Clock, MapPin, BookOpen } from 'lucide-react'
import EmergencyCrisisModal from '../EmergencyCrisisModal'

export default function EmergencyHelpPage() {
  const { profile } = useAuth()
  const { t } = useTranslation()
  const [selectedEmergency, setSelectedEmergency] = useState('flood')
  const [showModal, setShowModal] = useState(false)

  const emergency = EMERGENCY_SOLUTIONS[selectedEmergency]
  const emergencies = Object.values(EMERGENCY_SOLUTIONS)

  const callHelpline = (number) => {
    window.open(`tel:${number.replace(/[^0-9]/g, '')}`)
  }

  return (
    <div className="page">
      {/* Critical Alert Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #c0392b 0%, #e74c3c 100%)',
        color: 'white',
        borderRadius: 12,
        padding: 20,
        marginBottom: 24,
        display: 'flex',
        gap: 16,
        alignItems: 'flex-start'
      }}>
        <AlertCircle size={32} style={{ flexShrink: 0 }} />
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 8px 0' }}>
            Emergency Crisis Help Center
          </h2>
          <p style={{ fontSize: 13, margin: '0 0 8px 0', opacity: 0.95 }}>
            If you're experiencing a farming crisis (floods, pests, disease, drought, or heatwave), select the type below to get immediate action steps and emergency contacts.
          </p>
          <p style={{ fontSize: 12, margin: 0, opacity: 0.85, fontStyle: 'italic' }}>
            ⏱️ Act quickly. Most crises require action within 2-24 hours to minimize crop loss.
          </p>
        </div>
      </div>

      {/* Crisis Type Selector */}
      <div style={{
        background: 'white',
        border: '1px solid #e0e0e0',
        borderRadius: 12,
        padding: 20,
        marginBottom: 24
      }}>
        <h3 style={{ fontSize: 15, fontWeight: 800, color: '#1a2e1a', margin: '0 0 16px 0' }}>
          🔴 Select Crisis Type:
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
          {emergencies.map((emerg) => (
            <button
              key={emerg.id}
              onClick={() => setSelectedEmergency(emerg.id)}
              style={{
                padding: 16,
                borderRadius: 8,
                border: selectedEmergency === emerg.id ? `3px solid ${emerg.color}` : '1px solid #ddd',
                background: selectedEmergency === emerg.id ? emerg.color : '#f9f9f9',
                color: selectedEmergency === emerg.id ? 'white' : '#1a2e1a',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8
              }}
              onMouseEnter={(e) => {
                if (selectedEmergency !== emerg.id) {
                  e.currentTarget.style.borderColor = emerg.color
                  e.currentTarget.style.background = emerg.color + '15'
                }
              }}
              onMouseLeave={(e) => {
                if (selectedEmergency !== emerg.id) {
                  e.currentTarget.style.borderColor = '#ddd'
                  e.currentTarget.style.background = '#f9f9f9'
                }
              }}
            >
              <span style={{ fontSize: 28 }}>{emerg.icon}</span>
              <span style={{ fontSize: 13 }}>{emerg.name}</span>
              <span style={{ fontSize: 10, opacity: 0.8, textTransform: 'uppercase' }}>
                {emerg.severity}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Emergency Details */}
      {emergency && (
        <div style={{
          background: 'white',
          borderRadius: 12,
          overflow: 'hidden',
          border: `2px solid ${emergency.color}`
        }}>
          {/* Header */}
          <div style={{
            background: emergency.color,
            color: 'white',
            padding: 20
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <span style={{ fontSize: 40 }}>{emergency.icon}</span>
              <div>
                <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>
                  {emergency.name}
                </h2>
                <p style={{ fontSize: 12, margin: '4px 0 0 0', opacity: 0.9 }}>
                  ⏰ {emergency.severity === 'critical' ? 'ACT WITHIN 2-4 HOURS' : 'Act within 24 hours'}
                </p>
              </div>
            </div>
          </div>

          <div style={{ padding: 24 }}>
            {/* Critical Alert */}
            {emergency.severity === 'critical' && (
              <div style={{
                background: '#fdecea',
                border: '2px solid #c0392b',
                padding: 12,
                borderRadius: 8,
                marginBottom: 20,
                display: 'flex',
                gap: 10,
                alignItems: 'flex-start'
              }}>
                <AlertCircle size={20} color="#c0392b" style={{ flexShrink: 0 }} />
                <div>
                  <p style={{ fontWeight: 700, color: '#c0392b', margin: '0 0 4px 0', fontSize: 13 }}>
                    This is a CRITICAL situation
                  </p>
                  <p style={{ fontSize: 12, color: '#a02d22', margin: 0 }}>
                    Immediate action is required to prevent major crop loss. Call the emergency helpline first.
                  </p>
                </div>
              </div>
            )}

            {/* Action Steps */}
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1a2e1a', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle2 size={20} color={emergency.color} />
                Step-by-Step Action Plan:
              </h3>
              <div style={{ display: 'grid', gap: 12 }}>
                {emergency.steps.map((step, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: '#f9f9f9',
                      border: `2px solid ${emergency.color}30`,
                      borderLeft: `4px solid ${emergency.color}`,
                      borderRadius: 8,
                      padding: 16
                    }}
                  >
                    <div style={{ display: 'flex', gap: 12 }}>
                      <div style={{
                        background: emergency.color,
                        color: 'white',
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: 16,
                        flexShrink: 0
                      }}>
                        {step.no}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 700, color: '#1a2e1a', margin: '0 0 4px 0', fontSize: 14 }}>
                          {step.action}
                        </p>
                        <p style={{ fontSize: 13, color: '#666', margin: '0 0 8px 0' }}>
                          {step.details}
                        </p>
                        <p style={{
                          fontSize: 12,
                          color: emergency.color,
                          fontWeight: 600,
                          margin: 0,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6
                        }}>
                          <Clock size={14} /> {step.duration}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Emergency Contacts */}
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1a2e1a', marginBottom: 12 }}>
                📞 Emergency Contacts (Call Immediately):
              </h3>
              <div style={{ display: 'grid', gap: 10 }}>
                {emergency.contacts.map((contact, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: '#f5f5f5',
                      border: `2px solid ${emergency.color}30`,
                      borderRadius: 8,
                      padding: 14,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 700, color: '#1a2e1a', margin: '0 0 4px 0', fontSize: 13 }}>
                        📲 {contact.type}
                      </p>
                      <p style={{ fontSize: 12, color: '#666', margin: '0 0 4px 0' }}>
                        {contact.description}
                      </p>
                      <p style={{ fontSize: 12, fontWeight: 700, color: emergency.color, margin: 0 }}>
                        {contact.number}
                      </p>
                    </div>
                    <button
                      onClick={() => callHelpline(contact.number)}
                      style={{
                        background: emergency.color,
                        color: 'white',
                        border: 'none',
                        borderRadius: 6,
                        padding: '10px 16px',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: 12,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        whiteSpace: 'nowrap'
                      }}
                      onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                      onMouseLeave={(e) => e.target.style.opacity = '1'}
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
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1a2e1a', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <BookOpen size={18} color={emergency.color} />
                  Helpful Resources:
                </h3>
                <div style={{
                  background: '#f0f8f5',
                  border: `2px solid ${emergency.color}40`,
                  borderRadius: 8,
                  padding: 14
                }}>
                  {emergency.resources.map((resource, idx) => (
                    <p key={idx} style={{
                      fontSize: 12,
                      color: '#1a2e1a',
                      margin: idx === 0 ? '0 0 8px 0' : idx === emergency.resources.length - 1 ? '8px 0 0 0' : '8px 0',
                      paddingLeft: 20,
                      position: 'relative'
                    }}>
                      <span style={{ position: 'absolute', left: 4 }}>•</span>
                      {resource}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Prevention Tips */}
            {emergency.prevention && (
              <div style={{
                background: '#e8f5ee',
                border: `2px solid ${emergency.color}60`,
                borderRadius: 8,
                padding: 16,
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start'
              }}>
                <span style={{ fontSize: 24 }}>🛡️</span>
                <div>
                  <p style={{ fontWeight: 700, color: '#2d8a4e', margin: '0 0 8px 0', fontSize: 13 }}>
                    Prevention for Future:
                  </p>
                  <p style={{ fontSize: 12, color: '#1a2e1a', margin: 0, lineHeight: 1.6 }}>
                    {emergency.prevention}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{
            background: '#f5f5f5',
            padding: 16,
            borderTop: '1px solid #e0e0e0',
            display: 'flex',
            gap: 10,
            justifyContent: 'center'
          }}>
            <button
              style={{
                background: emergency.color,
                color: 'white',
                border: 'none',
                borderRadius: 6,
                padding: '12px 24px',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.target.style.opacity = '0.9'}
              onMouseLeave={(e) => e.target.style.opacity = '1'}
            >
              ✓ I will take action
            </button>
          </div>
        </div>
      )}

      {/* Additional Info */}
      <div style={{ marginTop: 24, padding: 8 }}>
        <p style={{ fontSize: 11, color: '#999', margin: 0, textAlign: 'center' }}>
          ℹ️ All contact numbers are verified government helplines for Karnataka.
          <br />
          In case of life-threatening situations, call 112 (Emergency) or 108 (Ambulance).
        </p>
      </div>
    </div>
  )
}
