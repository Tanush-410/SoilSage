'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { CheckCircle, AlertCircle } from 'lucide-react'
import { calculateSoilHealthFromObservations } from '@/lib/no-sensor-advisor'

export default function SoilObservationForm({ fieldId, region, onSaved }) {
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  
  const [form, setForm] = useState({
    color: 'brown',
    texture: 'loamy',
    drainage: 'good',
    organic_matter: 'moderate',
    compaction: 'medium',
    earthworm_level: 'moderate',
    surface_crust: false,
    notes: ''
  })

  async function handleSubmit() {
    setLoading(true)
    
    try {
      // Calculate health from observations
      const health = calculateSoilHealthFromObservations(form, region)
      
      // Prepare data
      const observationData = {
        field_id: fieldId,
        observation_date: new Date().toISOString(),
        observation_type: 'soil_health',
        color: form.color,
        texture: form.texture,
        drainage: form.drainage,
        organic_matter: form.organic_matter,
        compaction: form.compaction,
        earthworm_level: form.earthworm_level,
        surface_crust: form.surface_crust,
        notes: form.notes,
        calculated_score: health.overallScore,
        estimated_nitrogen: health.estimatedNutrients.nitrogen,
        estimated_phosphorus: health.estimatedNutrients.phosphorus,
        estimated_potassium: health.estimatedNutrients.potassium,
        data_source: 'manual_observation'
      }

      // Try to save to database
      const { error } = await supabase.from('field_observations').insert(observationData)
      
      setLoading(false)
      
      if (error) {
        // If table doesn't exist, store locally and show helpful message
        if (error.message && error.message.includes('field_observations')) {
          console.log('Storing observation locally (table not created yet)')
          // Store in localStorage as fallback
          const obs = JSON.parse(localStorage.getItem('soilObservations') || '[]')
          obs.push(observationData)
          localStorage.setItem('soilObservations', JSON.stringify(obs))
          
          setMessage(`✅ Soil Health Calculated!\n\nScore: ${health.overallScore}/100\n\n(Note: Database table not set up yet. Data stored locally. Run the SQL migration in Supabase to sync data.)`)
          
          setTimeout(() => {
            setShowForm(false)
            onSaved?.(health)
          }, 3000)
        } else {
          setMessage(`Error: ${error.message}`)
        }
      } else {
        setMessage(`✅ Observation saved successfully!\n\nSoil Health Score: ${health.overallScore}/100`)
        setTimeout(() => {
          setShowForm(false)
          onSaved?.(health)
        }, 2000)
      }
    } catch (err) {
      setLoading(false)
      setMessage(`Error: ${err.message}`)
    }
  }

  if (!showForm) {
    return (
      <button 
        onClick={() => setShowForm(true)}
        className="btn-primary sm"
        style={{ marginBottom: 16 }}
      >
        📝 Add Soil Observation
      </button>
    )
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #e8f5ee, #f0f8f5)',
      border: '2px solid #2d8a4e',
      borderRadius: 12,
      padding: 24,
      marginBottom: 24
    }}>
      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#1a2e1a' }}>
        🔍 Soil Health Observation (No Sensors Needed)
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16, marginBottom: 16 }}>
        
        {/* Color */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#8aab96', marginBottom: 6, display: 'block' }}>
            🌱 Soil Color (indicates organic matter)
          </label>
          <select 
            value={form.color}
            onChange={(e) => setForm({...form, color: e.target.value})}
            style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #d1e3bb', fontFamily: 'inherit' }}
          >
            <option value="very_dark_brown">Very Dark Brown (Excellent OM)</option>
            <option value="dark_brown">Dark Brown (Good OM)</option>
            <option value="brown">Brown (Moderate OM)</option>
            <option value="light_brown">Light Brown (Low OM)</option>
            <option value="light">Light/Gray (Very Low OM)</option>
          </select>
        </div>

        {/* Texture */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#8aab96', marginBottom: 6, display: 'block' }}>
            🟫 Soil Texture (feel with hand)
          </label>
          <select 
            value={form.texture}
            onChange={(e) => setForm({...form, texture: e.target.value})}
            style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #d1e3bb', fontFamily: 'inherit' }}
          >
            <option value="loamy">Loamy (Ideal - balanced)</option>
            <option value="clay_loam">Clay Loam (Good)</option>
            <option value="sandy_loam">Sandy Loam (Fair)</option>
            <option value="clayey">Clayey (Can be heavy)</option>
            <option value="sandy">Sandy (Drains quickly)</option>
          </select>
        </div>

        {/* Drainage */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#8aab96', marginBottom: 6, display: 'block' }}>
            💧 Drainage (after watering)
          </label>
          <select 
            value={form.drainage}
            onChange={(e) => setForm({...form, drainage: e.target.value})}
            style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #d1e3bb', fontFamily: 'inherit' }}
          >
            <option value="excellent">Excellent (Dries fast)</option>
            <option value="good">Good (Normal)</option>
            <option value="moderate">Moderate (Somewhat slow)</option>
            <option value="poor">Poor (Waterlogging risk)</option>
          </select>
        </div>

        {/* Organic Matter */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#8aab96', marginBottom: 6, display: 'block' }}>
            ♻️ Visible Organic Matter (compost, roots)
          </label>
          <select 
            value={form.organic_matter}
            onChange={(e) => setForm({...form, organic_matter: e.target.value})}
            style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #d1e3bb', fontFamily: 'inherit' }}
          >
            <option value="high">High (Lots of visible OM)</option>
            <option value="moderate">Moderate (Some visible)</option>
            <option value="low">Low (Very little OM)</option>
          </select>
        </div>

        {/* Compaction */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#8aab96', marginBottom: 6, display: 'block' }}>
            ⛏️ Soil Compaction (spade test)
          </label>
          <select 
            value={form.compaction}
            onChange={(e) => setForm({...form, compaction: e.target.value})}
            style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #d1e3bb', fontFamily: 'inherit' }}
          >
            <option value="loose">Loose (Spade penetrates easily)</option>
            <option value="medium">Medium (Normal resistance)</option>
            <option value="hard">Hard (Difficult to penetrate)</option>
          </select>
        </div>

        {/* Earthworms */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#8aab96', marginBottom: 6, display: 'block' }}>
            🪱 Earthworms (per sq foot when digging)
          </label>
          <select 
            value={form.earthworm_level}
            onChange={(e) => setForm({...form, earthworm_level: e.target.value})}
            style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #d1e3bb', fontFamily: 'inherit' }}
          >
            <option value="many">Many (&gt;20, Excellent biodiversity)</option>
            <option value="moderate">Moderate (10-20)</option>
            <option value="few">Few (5-10)</option>
            <option value="none">None (0, Poor soil life)</option>
          </select>
        </div>
      </div>

      {/* Surface Crust */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#8aab96', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
          <input 
            type="checkbox"
            checked={form.surface_crust}
            onChange={(e) => setForm({...form, surface_crust: e.target.checked})}
            style={{ width: 18, height: 18, cursor: 'pointer' }}
          />
          ⛓️ Surface Crust Present (hard layer after rain)
        </label>
      </div>

      {/* Notes */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#8aab96', marginBottom: 6, display: 'block' }}>
          📝 Additional Notes (optional)
        </label>
        <textarea
          value={form.notes}
          onChange={(e) => setForm({...form, notes: e.target.value})}
          placeholder="Any observations about recent weather, crop health, pest issues..."
          style={{ 
            width: '100%', 
            padding: 10, 
            borderRadius: 6, 
            border: '1px solid #d1e3bb', 
            fontFamily: 'inherit',
            minHeight: 60,
            resize: 'vertical'
          }}
        />
      </div>

      {/* Message */}
      {message && (
        <div style={{
          padding: 12,
          background: message.includes('Error') ? '#fdecea' : '#e8f5ee',
          border: `1px solid ${message.includes('Error') ? '#c0392b' : '#2d8a4e'}`,
          borderRadius: 6,
          marginBottom: 16,
          fontSize: 12,
          color: message.includes('Error') ? '#c0392b' : '#2d8a4e',
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          {message.includes('Error') ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
          {message}
        </div>
      )}

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="btn-primary"
          style={{ flex: 1 }}
        >
          {loading ? '💾 Saving...' : '✅ Save Observation'}
        </button>
        <button
          onClick={() => setShowForm(false)}
          style={{
            flex: 1,
            padding: 10,
            background: '#f5f6f8',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontWeight: 600,
            color: '#8aab96'
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
