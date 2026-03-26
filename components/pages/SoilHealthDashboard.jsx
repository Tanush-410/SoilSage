'use client';

import { useState, useEffect } from 'react';
import { Droplet, Leaf, Zap, Wind, Thermometer, AlertTriangle, TrendingUp, Activity, AlertCircle, CheckCircle } from 'lucide-react';

export default function SoilHealthDashboard({ field }) {
  const [soilData, setSoilData] = useState(null);

  useEffect(() => {
    if (field) {
      const mockSoilData = {
        moisture: field.soil_moisture || 60,
        ph: field.soil_ph || 6.8,
        temperature: field.soil_temperature || 26,
        nitrogen: field.nitrogen || 50,
        phosphorus: field.phosphorus || 35,
        potassium: field.potassium || 40,
        organicMatter: 3.2,
        ec: 0.45,
      };
      setSoilData(mockSoilData);
    }
  }, [field]);

  if (!soilData) return null;

  const getMoistureStatus = (moisture) => {
    if (moisture < 25) return { label: 'Critical', color: '#c0392b', bg: '#fdecea', icon: '⚠️' };
    if (moisture < 40) return { label: 'Low', color: '#e67e22', bg: '#fef3cd', icon: '⚡' };
    if (moisture < 70) return { label: 'Optimal', color: '#2d8a4e', bg: '#e8f5ee', icon: '✓' };
    return { label: 'High', color: '#1a6fb5', bg: '#e8f0fb', icon: '↑' };
  };

  const getPHStatus = (ph) => {
    if (ph < 6.5) return { label: 'Acidic', color: '#c0392b', bg: '#fdecea' };
    if (ph > 7.5) return { label: 'Alkaline', color: '#6b46c1', bg: '#f0ebff' };
    return { label: 'Neutral (Optimal)', color: '#2d8a4e', bg: '#e8f5ee' };
  };

  const getNutrientStatus = (value, target) => {
    const percentage = (value / target) * 100;
    if (percentage >= 80) return { color: '#2d8a4e', label: 'Optimal' };
    if (percentage >= 50) return { color: '#f59e0b', label: 'Moderate' };
    return { color: '#c0392b', label: 'Low' };
  };

  const moistureStatus = getMoistureStatus(soilData.moisture);
  const phStatus = getPHStatus(soilData.ph);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Title */}
      <div>
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #2d8a4e, #f59e0b)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Leaf size={22} color="white" />
          </div>
          Soil Health Profile
        </h1>
        <p className="page-sub" style={{ color: '#8aab96' }}>
          Real-time soil monitoring for {field?.name || 'your field'}
        </p>
      </div>

      {/* Critical Alerts */}
      {soilData.moisture < 25 && (
        <div className="glass-card" style={{ borderColor: '#c0392b', borderWidth: 2, background: '#fdecea' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <AlertTriangle size={24} color="#c0392b" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#c0392b', marginBottom: 4 }}>
                ⚠️ Urgent: Soil Moisture Critical
              </p>
              <p style={{ fontSize: 12, color: '#8aab96' }}>
                Immediate irrigation required to prevent crop stress
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Metrics Grid - 2x2 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        {/* Moisture */}
        <div className="glass-card" style={{ borderColor: moistureStatus.color, background: moistureStatus.bg }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#8aab96' }}>Soil Moisture</p>
            <Droplet size={20} color={moistureStatus.color} />
          </div>
          <p style={{ fontSize: 32, fontWeight: 800, color: moistureStatus.color }}>
            {soilData.moisture}%
          </p>
          <p style={{ fontSize: 11, color: moistureStatus.color, marginTop: 6, fontWeight: 500 }}>
            {moistureStatus.label}
          </p>
          <div style={{ height: 4, background: `${moistureStatus.color}20`, borderRadius: 2, marginTop: 8, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min(soilData.moisture, 100)}%`, background: moistureStatus.color, borderRadius: 2 }} />
          </div>
        </div>

        {/* pH Level */}
        <div className="glass-card" style={{ borderColor: phStatus.color, background: phStatus.bg }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#8aab96' }}>pH Level</p>
            <Zap size={20} color={phStatus.color} />
          </div>
          <p style={{ fontSize: 32, fontWeight: 800, color: phStatus.color }}>
            {soilData.ph}
          </p>
          <p style={{ fontSize: 11, color: phStatus.color, marginTop: 6, fontWeight: 500 }}>
            {phStatus.label}
          </p>
          <div style={{ height: 4, background: `${phStatus.color}20`, borderRadius: 2, marginTop: 8, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.max(0, Math.min(100, (soilData.ph / 8) * 100))}%`, background: phStatus.color, borderRadius: 2 }} />
          </div>
        </div>

        {/* Temperature */}
        <div className="glass-card" style={{ borderColor: '#f59e0b', background: '#fef3cd' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#8aab96' }}>Temperature</p>
            <Thermometer size={20} color="#b45309" />
          </div>
          <p style={{ fontSize: 32, fontWeight: 800, color: '#b45309' }}>
            {soilData.temperature}°C
          </p>
          <p style={{ fontSize: 11, color: '#b45309', marginTop: 6, fontWeight: 500 }}>
            {soilData.temperature >= 20 && soilData.temperature <= 30 ? 'Optimal' : soilData.temperature < 20 ? 'Cool' : 'Warm'}
          </p>
        </div>

        {/* Organic Matter */}
        <div className="glass-card" style={{ borderColor: '#2d8a4e', background: '#e8f5ee' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#8aab96' }}>Organic Matter</p>
            <Leaf size={20} color="#2d8a4e" />
          </div>
          <p style={{ fontSize: 32, fontWeight: 800, color: '#2d8a4e' }}>
            {soilData.organicMatter}%
          </p>
          <p style={{ fontSize: 11, color: '#2d8a4e', marginTop: 6, fontWeight: 500 }}>
            {soilData.organicMatter > 3 ? 'Excellent' : 'Good'} fertility
          </p>
        </div>
      </div>

      {/* Nutrient Levels - NPK Analysis */}
      <div className="glass-card" style={{ borderColor: '#2d8a4e', background: 'linear-gradient(135deg, #e8f5ee, #fef3cd)' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a2e1a', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <TrendingUp size={18} color="#2d8a4e" />
          NPK Nutrient Status
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
          {[
            { name: 'Nitrogen (N)', value: soilData.nitrogen, target: 60, icon: '🌾' },
            { name: 'Phosphorus (P)', value: soilData.phosphorus, target: 40, icon: '🌻' },
            { name: 'Potassium (K)', value: soilData.potassium, target: 50, icon: '🥕' },
          ].map((nutrient) => {
            const percentage = (nutrient.value / nutrient.target) * 100;
            const status = getNutrientStatus(nutrient.value, nutrient.target);
            return (
              <div key={nutrient.name} style={{ padding: 12, background: '#f5f6f8', borderRadius: 10, border: `1px solid ${status.color}30` }}>
                <p style={{ fontSize: 11, color: '#8aab96', fontWeight: 500, marginBottom: 6 }}>
                  {nutrient.icon} {nutrient.name}
                </p>
                <p style={{ fontSize: 18, fontWeight: 800, color: status.color, marginBottom: 6 }}>
                  {nutrient.value} ppm
                </p>
                <div style={{ height: 4, background: `${status.color}20`, borderRadius: 2, overflow: 'hidden', marginBottom: 6 }}>
                  <div style={{ height: '100%', width: `${Math.min(percentage, 100)}%`, background: status.color, borderRadius: 2 }} />
                </div>
                <p style={{ fontSize: 9, color: '#8aab96' }}>
                  {status.label} (Target: {nutrient.target})
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Readings */}
      <div className="glass-card" style={{ borderColor: '#1a6fb5', background: 'linear-gradient(135deg, #e8f0fb, #f0f6ff)' }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a2e1a', marginBottom: 12 }}>
          Detailed Readings
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
          <div style={{ padding: 12, background: '#f5f6f8', borderRadius: 8 }}>
            <p style={{ fontSize: 11, color: '#8aab96', fontWeight: 500, marginBottom: 4 }}>Electrical Conductivity</p>
            <p style={{ fontSize: 16, fontWeight: 800, color: '#1a6fb5' }}>
              {soilData.ec} dS/m
            </p>
            <p style={{ fontSize: 10, color: '#8aab96', marginTop: 4 }}>Soil salinity level</p>
          </div>

          <div style={{ padding: 12, background: '#f5f6f8', borderRadius: 8 }}>
            <p style={{ fontSize: 11, color: '#8aab96', fontWeight: 500, marginBottom: 4 }}>Health Score</p>
            <p style={{ fontSize: 16, fontWeight: 800, color: '#2d8a4e' }}>
              {Math.round((soilData.moisture / 100 + soilData.nitrogen / 60 + soilData.organicMatter / 5) / 3 * 100)}%
            </p>
            <p style={{ fontSize: 10, color: '#8aab96', marginTop: 4 }}>Overall soil quality</p>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="glass-card" style={{ borderColor: '#2d8a4e', background: 'linear-gradient(135deg, #e8f5ee, #f0f8f5)' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a2e1a', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Activity size={18} color="#2d8a4e" />
          Smart Recommendations
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {soilData.moisture < 40 && (
            <div style={{ display: 'flex', gap: 12, padding: 12, background: '#fef3cd', borderRadius: 8, borderLeft: '3px solid #f59e0b' }}>
              <span style={{ fontSize: 20, marginTop: -2 }}>💧</span>
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#b45309', marginBottom: 2 }}>Increase Irrigation</p>
                <p style={{ fontSize: 11, color: '#8aab96' }}>Soil moisture is below optimal - increase irrigation frequency</p>
              </div>
            </div>
          )}

          {soilData.nitrogen < 50 && (
            <div style={{ display: 'flex', gap: 12, padding: 12, background: '#fdecea', borderRadius: 8, borderLeft: '3px solid #c0392b' }}>
              <span style={{ fontSize: 20, marginTop: -2 }}>🌾</span>
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#c0392b', marginBottom: 2 }}>Nitrogen Fertilizer Needed</p>
                <p style={{ fontSize: 11, color: '#8aab96' }}>Apply Urea (46% N) or compost to boost nitrogen levels</p>
              </div>
            </div>
          )}

          {soilData.ph < 6.5 && (
            <div style={{ display: 'flex', gap: 12, padding: 12, background: '#fdecea', borderRadius: 8, borderLeft: '3px solid #c0392b' }}>
              <span style={{ fontSize: 20, marginTop: -2 }}>⚗️</span>
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#c0392b', marginBottom: 2 }}>Soil Acidification</p>
                <p style={{ fontSize: 11, color: '#8aab96' }}>pH is too acidic - apply agricultural lime to neutralize</p>
              </div>
            </div>
          )}

          {soilData.temperature > 35 && (
            <div style={{ display: 'flex', gap: 12, padding: 12, background: '#fef3cd', borderRadius: 8, borderLeft: '3px solid #f59e0b' }}>
              <span style={{ fontSize: 20, marginTop: -2 }}>🌡️</span>
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#b45309', marginBottom: 2 }}>High Soil Temperature</p>
                <p style={{ fontSize: 11, color: '#8aab96' }}>Increase mulching depth and irrigation frequency</p>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, padding: 12, background: '#e8f5ee', borderRadius: 8, borderLeft: '3px solid #2d8a4e' }}>
            <CheckCircle size={20} color="#2d8a4e" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#2d8a4e', marginBottom: 2 }}>Overall Assessment</p>
              <p style={{ fontSize: 11, color: '#8aab96' }}>
                Your soil health is {soilData.organicMatter > 3 ? 'excellent' : 'good'}. Continue with current management practices and monitor regularly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
