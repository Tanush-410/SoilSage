'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, Grid3X3, Map as MapIcon, BarChart3, Palette, Droplet, Leaf, Wind, Zap, Info, Download } from 'lucide-react';

export default function FieldLayoutEditor({ field, onSave, onClose }) {
  const [layoutType, setLayoutType] = useState('grid');
  const [rows, setRows] = useState(6);
  const [cols, setCols] = useState(8);
  const [zones, setZones] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);
  const [zoneForm, setZoneForm] = useState({
    name: '',
    crop_type: '',
    irrigation_type: 'drip',
    color: '#00e87a',
    soil_moisture: 60,
    soil_ph: 6.8,
    nitrogen: 50,
  });
  const [saving, setSaving] = useState(false);
  const [showStats, setShowStats] = useState(true);

  const colors = [
    { name: 'Green', value: '#2d8a4e' },
    { name: 'Yellow', value: '#f59e0b' },
    { name: 'Blue', value: '#1a6fb5' },
    { name: 'Purple', value: '#6b46c1' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Orange', value: '#d97706' },
  ];

  const cropIcons = {
    Rice: '🍚',
    Wheat: '🌾',
    Corn: '🌽',
    Sugarcane: '🥕',
    Tomato: '🍅',
    Potato: '🥔',
  };

  const cropData = {
    Rice: { water: 'High', season: 'Kharif', yield: '5500kg' },
    Wheat: { water: 'Medium', season: 'Rabi', yield: '5000kg' },
    Corn: { water: 'Medium', season: 'Kharif', yield: '8500kg' },
    Sugarcane: { water: 'Very High', season: 'Year-round', yield: '65000kg' },
    Tomato: { water: 'High', season: 'Rabi', yield: '70000kg' },
    Potato: { water: 'Medium', season: 'Rabi', yield: '22000kg' },
  };

  const handleAddZone = () => {
    if (zoneForm.name && selectedCell) {
      const newZone = {
        id: Date.now(),
        ...zoneForm,
        row: selectedCell.row,
        col: selectedCell.col,
        area: 0.25, // 0.25 hectares per cell
      };
      setZones([...zones, newZone]);
      setZoneForm({ name: '', crop_type: '', irrigation_type: 'drip', color: '#2d8a4e', soil_moisture: 60, soil_ph: 6.8, nitrogen: 50 });
      setSelectedCell(null);
    }
  };

  const handleDeleteZone = (id) => {
    setZones(zones.filter((z) => z.id !== id));
    setSelectedZone(null);
  };

  const handleSave = async () => {
    setSaving(true);
    if (onSave) {
      const layoutData = {
        layout_type: layoutType,
        layout_rows: rows,
        layout_cols: cols,
        layout_zones: JSON.stringify(zones),
      };
      await onSave(layoutData);
    }
    setSaving(false);
  };

  // Calculate statistics
  const totalArea = (rows * cols) * 0.25;
  const coveredArea = zones.length * 0.25;
  const cropCount = {};
  const irrigationCount = {};
  const avgMoisture = zones.length > 0 ? Math.round(zones.reduce((sum, z) => sum + z.soil_moisture, 0) / zones.length) : 0;
  const avgPH = zones.length > 0 ? (zones.reduce((sum, z) => sum + z.soil_ph, 0) / zones.length).toFixed(1) : 0;

  zones.forEach(z => {
    cropCount[z.crop_type] = (cropCount[z.crop_type] || 0) + 1;
    irrigationCount[z.irrigation_type] = (irrigationCount[z.irrigation_type] || 0) + 1;
  });

  return (
    <div className="page">
      {/* Header with Stats */}
      <div className="page-header" style={{ marginBottom: 28 }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #2d8a4e, #f59e0b)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MapIcon size={22} color="white" />
            </div>
            2D Farm Map & Layout
          </h1>
          <p className="page-sub" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Grid3X3 size={14} />
            Interactive farm layout with {zones.length} zones
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button 
            onClick={() => setShowStats(!showStats)}
            style={{
              background: showStats ? 'linear-gradient(135deg, #2d8a4e, #f59e0b)' : '#f5f6f8',
              color: showStats ? 'white' : '#8aab96',
              border: '1px solid ' + (showStats ? 'transparent' : '#d1e3bb'),
              padding: '8px 16px',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 14
            }}
          >
            <BarChart3 size={16} style={{ display: 'inline', marginRight: 6 }} />
            Stats
          </button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? '💾 Saving...' : '💾 Save Layout'}
          </button>
          {onClose && (
            <button onClick={onClose} style={{
              background: '#f5f6f8',
              border: '1px solid #d1e3bb',
              color: '#8aab96',
              padding: '8px 16px',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 14
            }}>
              Close
            </button>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      {showStats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
          <div className="glass-card" style={{ borderColor: '#2d8a4e', background: '#e8f5ee' }}>
            <p style={{ fontSize: 11, color: '#8aab96', fontWeight: 500, marginBottom: 4 }}>Farm Area</p>
            <p style={{ fontSize: 20, fontWeight: 800, color: '#2d8a4e' }}>{totalArea.toFixed(2)} ha</p>
            <p style={{ fontSize: 9, color: '#8aab96', marginTop: 4 }}>Rows: {rows} × Cols: {cols}</p>
          </div>

          <div className="glass-card" style={{ borderColor: '#f59e0b', background: '#fef3cd' }}>
            <p style={{ fontSize: 11, color: '#8aab96', fontWeight: 500, marginBottom: 4 }}>Covered</p>
            <p style={{ fontSize: 20, fontWeight: 800, color: '#b45309' }}>{zones.length} zones</p>
            <p style={{ fontSize: 9, color: '#8aab96', marginTop: 4 }}>{coveredArea.toFixed(2)} ha used</p>
          </div>

          <div className="glass-card" style={{ borderColor: '#1a6fb5', background: '#e8f0fb' }}>
            <p style={{ fontSize: 11, color: '#8aab96', fontWeight: 500, marginBottom: 4 }}>Avg Moisture</p>
            <p style={{ fontSize: 20, fontWeight: 800, color: '#1a6fb5' }}>{avgMoisture}%</p>
            <p style={{ fontSize: 9, color: '#8aab96', marginTop: 4 }}>Soil condition</p>
          </div>

          <div className="glass-card" style={{ borderColor: '#6b46c1', background: '#f0ebff' }}>
            <p style={{ fontSize: 11, color: '#8aab96', fontWeight: 500, marginBottom: 4 }}>Avg pH</p>
            <p style={{ fontSize: 20, fontWeight: 800, color: '#6b46c1' }}>{avgPH}</p>
            <p style={{ fontSize: 9, color: '#8aab96', marginTop: 4 }}>Soil pH level</p>
          </div>
        </div>
      )}

      {/* Layout Selection */}
      <div className="glass-card" style={{ marginBottom: 24, borderColor: '#b45309' }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a2e1a', marginBottom: 12 }}>Field Layout Type</h3>
        <div style={{ display: 'flex', gap: 12 }}>
          {[
            { id: 'grid', label: '📊 Grid Layout', desc: 'Uniform rectangular zones' },
            { id: 'custom', label: '🎨 Custom Zones', desc: 'Irregular polygon zones' },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setLayoutType(type.id)}
              style={{
                flex: 1,
                padding: 14,
                background: layoutType === type.id ? 'linear-gradient(135deg, #e8f5ee, #f0f8f5)' : '#f5f6f8',
                border: layoutType === type.id ? '2px solid #2d8a4e' : '1px solid #d1e3bb',
                borderRadius: 8,
                cursor: 'pointer',
                fontWeight: 600,
                color: layoutType === type.id ? '#2d8a4e' : '#8aab96',
                transition: 'all 0.2s'
              }}
            >
              {type.label}
              <p style={{ fontSize: 11, color: layoutType === type.id ? '#2d8a4e' : '#8aab96', fontWeight: 400, marginTop: 4 }}>
                {type.desc}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Grid Configuration */}
      {layoutType === 'grid' && (
        <div className="glass-card" style={{ marginBottom: 24, borderColor: '#1a6fb5', background: 'linear-gradient(135deg, #e8f0fb, #f0f6ff)' }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a2e1a', marginBottom: 14 }}>Grid Configuration</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#1a2e1a', marginBottom: 6 }}>Rows</label>
              <input
                type="number"
                min="2"
                max="20"
                value={rows}
                onChange={(e) => setRows(Math.min(20, Math.max(2, parseInt(e.target.value))))}
                style={{
                  width: '100%',
                  padding: 10,
                  border: '1px solid #d1e3bb',
                  borderRadius: 6,
                  fontSize: 14,
                  fontFamily: 'inherit'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#1a2e1a', marginBottom: 6 }}>Columns</label>
              <input
                type="number"
                min="2"
                max="20"
                value={cols}
                onChange={(e) => setCols(Math.min(20, Math.max(2, parseInt(e.target.value))))}
                style={{
                  width: '100%',
                  padding: 10,
                  border: '1px solid #d1e3bb',
                  borderRadius: 6,
                  fontSize: 14,
                  fontFamily: 'inherit'
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 24, marginBottom: 24 }}>
        {/* Form */}
        <div className="glass-card" style={{ borderColor: '#2d8a4e' }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a2e1a', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Plus size={16} color="#2d8a4e" />
            Create Zone
          </h3>
          {!selectedCell ? (
            <div style={{ padding: 20, background: '#f0f8f5', borderRadius: 8, textAlign: 'center', color: '#8aab96' }}>
              <Grid3X3 size={24} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
              <p style={{ fontSize: 12 }}>Click on a grid cell to select it</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#1a2e1a', marginBottom: 6 }}>Zone Name</label>
                <input type="text" placeholder="e.g. North Field, Zone A" value={zoneForm.name} onChange={(e) => setZoneForm({ ...zoneForm, name: e.target.value })} style={{ width: '100%', padding: 10, border: '1px solid #d1e3bb', borderRadius: 6, fontSize: 13, fontFamily: 'inherit' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#1a2e1a', marginBottom: 6 }}>Crop Type</label>
                <select value={zoneForm.crop_type} onChange={(e) => setZoneForm({ ...zoneForm, crop_type: e.target.value })} style={{ width: '100%', padding: 10, border: '1px solid #d1e3bb', borderRadius: 6, fontSize: 13, fontFamily: 'inherit' }}>
                  <option value="">Select crop</option>
                  {Object.keys(cropIcons).map(crop => <option key={crop} value={crop}>{cropIcons[crop]} {crop}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#1a2e1a', marginBottom: 6 }}>Irrigation Type</label>
                <select value={zoneForm.irrigation_type} onChange={(e) => setZoneForm({ ...zoneForm, irrigation_type: e.target.value })} style={{ width: '100%', padding: 10, border: '1px solid #d1e3bb', borderRadius: 6, fontSize: 13, fontFamily: 'inherit' }}>
                  <option value="drip">💧 Drip</option>
                  <option value="flood">🌊 Flood</option>
                  <option value="spray">🚿 Spray</option>
                  <option value="none">🚫 None</option>
                </select>
              </div>

              {/* Soil Data */}
              <div style={{ padding: 10, background: '#f5f6f8', borderRadius: 6 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#1a2e1a', marginBottom: 8 }}>💧 Soil Moisture: {zoneForm.soil_moisture}%</p>
                <input type="range" min="0" max="100" value={zoneForm.soil_moisture} onChange={(e) => setZoneForm({ ...zoneForm, soil_moisture: parseInt(e.target.value) })} style={{ width: '100%', marginBottom: 8 }} />
                
                <p style={{ fontSize: 11, fontWeight: 600, color: '#1a2e1a', marginBottom: 8 }}>⚗️ Soil pH: {zoneForm.soil_ph}</p>
                <input type="range" min="5" max="8" step="0.1" value={zoneForm.soil_ph} onChange={(e) => setZoneForm({ ...zoneForm, soil_ph: parseFloat(e.target.value) })} style={{ width: '100%', marginBottom: 8 }} />
                
                <p style={{ fontSize: 11, fontWeight: 600, color: '#1a2e1a', marginBottom: 8 }}>🌾 Nitrogen: {zoneForm.nitrogen} ppm</p>
                <input type="range" min="0" max="150" value={zoneForm.nitrogen} onChange={(e) => setZoneForm({ ...zoneForm, nitrogen: parseInt(e.target.value) })} style={{ width: '100%' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#1a2e1a', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Palette size={14} />
                  Zone Color
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {colors.map((color) => (
                    <button key={color.value} onClick={() => setZoneForm({ ...zoneForm, color: color.value })} style={{ width: '100%', height: 40, background: color.value, border: zoneForm.color === color.value ? '3px solid #1a2e1a' : '1px solid rgba(0,0,0,0.1)', borderRadius: 6, cursor: 'pointer', transition: 'all 0.2s' }} title={color.name} />
                  ))}
                </div>
              </div>

              <button onClick={handleAddZone} disabled={!zoneForm.name} style={{ padding: 10, background: zoneForm.name ? 'linear-gradient(135deg, #2d8a4e, #f59e0b)' : '#d1e3bb', color: 'white', border: 'none', borderRadius: 6, fontWeight: 600, cursor: zoneForm.name ? 'pointer' : 'not-allowed', fontSize: 13 }}>
                <Plus size={14} style={{ marginRight: 6, display: 'inline' }} />
                Create Zone
              </button>
            </div>
          )}
        </div>

        {/* 2D Grid Visualization */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Main Grid */}
          <div className="glass-card" style={{ borderColor: '#b45309' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a2e1a', marginBottom: 14 }}>Farm Layout: {rows}×{cols} Grid</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${Math.min(cols, 10)}, 1fr)`,
              gap: 3,
              background: 'linear-gradient(135deg, #f0f8f5, #fef3cd)',
              padding: 12,
              borderRadius: 8
            }}>
              {Array.from({ length: Math.min(rows * cols, 100) }).map((_, idx) => {
                const row = Math.floor(idx / cols);
                const col = idx % cols;
                const zone = zones.find((z) => z.row === row && z.col === col);
                const isSelected = selectedCell?.row === row && selectedCell?.col === col;

                return (
                  <button
                    key={`${row}-${col}`}
                    onClick={() => setSelectedCell({ row, col })}
                    style={{
                      aspectRatio: '1',
                      background: zone ? zone.color : '#ffffff',
                      border: isSelected ? '2px solid #1a2e1a' : '1px solid #d1e3bb',
                      borderRadius: 4,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 10,
                      fontWeight: 600,
                      color: zone ? (zone.color === '#f59e0b' ? '#1a2e1a' : 'white') : '#8aab96',
                      opacity: zone ? 1 : 0.6,
                      boxShadow: isSelected ? '0 0 0 2px rgba(45,138,78,0.3)' : 'none'
                    }}
                    title={zone ? `${zone.name}\n${cropIcons[zone.crop_type]} ${zone.crop_type}` : `Cell (${row + 1}, ${col + 1})`}
                  >
                    {zone ? cropIcons[zone.crop_type] || '+' : '+'}
                  </button>
                );
              })}
            </div>
            <p style={{ fontSize: 10, color: '#8aab96', marginTop: 10, textAlign: 'center' }}>
              {zones.length > 0 ? `${zones.length} zones mapped • ${coveredArea.toFixed(2)}ha covered` : 'Click cells to add zones'}
            </p>
          </div>

          {/* Zone Analytics */}
          {zones.length > 0 && (
            <div className="glass-card" style={{ borderColor: '#2d8a4e', background: 'linear-gradient(135deg, #e8f5ee, #f0f8f5)' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a2e1a', marginBottom: 12 }}>Field Analytics</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <p style={{ fontSize: 11, color: '#8aab96', fontWeight: 600, marginBottom: 8 }}>Crop Distribution</p>
                  {Object.entries(cropCount).map(([crop, count]) => (
                    <div key={crop} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#1a2e1a', marginBottom: 4 }}>
                      <span>{cropIcons[crop]} {crop}</span>
                      <span style={{ fontWeight: 600 }}>{count} zones</span>
                    </div>
                  ))}
                </div>
                <div>
                  <p style={{ fontSize: 11, color: '#8aab96', fontWeight: 600, marginBottom: 8 }}>Irrigation Methods</p>
                  {Object.entries(irrigationCount).map(([method, count]) => (
                    <div key={method} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#1a2e1a', marginBottom: 4 }}>
                      <span>{method.charAt(0).toUpperCase() + method.slice(1)}</span>
                      <span style={{ fontWeight: 600 }}>{count} zones</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Zones Details */}
      {zones.length > 0 && (
        <div className="glass-card" style={{ borderColor: '#2d8a4e', marginBottom: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a2e1a', marginBottom: 14 }}>Zones Details ({zones.length})</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
            {zones.map((zone) => (
              <div 
                key={zone.id} 
                onClick={() => setSelectedZone(selectedZone?.id === zone.id ? null : zone)}
                style={{
                  padding: 14,
                  background: `linear-gradient(135deg, ${zone.color}15, ${zone.color}05)`,
                  borderLeft: `4px solid ${zone.color}`,
                  borderRadius: 8,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  border: selectedZone?.id === zone.id ? `2px solid ${zone.color}` : '1px solid rgba(0,0,0,0.1)',
                  boxShadow: selectedZone?.id === zone.id ? `0 0 0 2px ${zone.color}30` : 'none'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 10 }}>
                  <div>
                    <p style={{ fontWeight: 700, color: '#1a2e1a', fontSize: 13 }}>
                      {cropIcons[zone.crop_type]} {zone.name}
                    </p>
                    <p style={{ fontSize: 10, color: '#8aab96', marginTop: 2 }}>
                      Row {zone.row + 1}, Col {zone.col + 1}
                    </p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteZone(zone.id); }} style={{ background: 'rgba(192,57,43,0.1)', border: 'none', color: '#c0392b', padding: '4px 8px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
                    <Trash2 size={14} />
                  </button>
                </div>

                {selectedZone?.id === zone.id && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, paddingTop: 10, borderTop: `1px solid ${zone.color}30` }}>
                    <div>
                      <p style={{ fontSize: 9, color: '#8aab96', fontWeight: 600 }}>🌾 Crop</p>
                      <p style={{ fontSize: 11, color: '#1a2e1a', fontWeight: 600 }}>{zone.crop_type}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: 9, color: '#8aab96', fontWeight: 600 }}>💧 Water Need</p>
                      <p style={{ fontSize: 11, color: '#1a2e1a', fontWeight: 600 }}>{cropData[zone.crop_type]?.water}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: 9, color: '#8aab96', fontWeight: 600 }}>💧 Moisture</p>
                      <p style={{ fontSize: 11, color: '#1a2e1a', fontWeight: 600 }}>{zone.soil_moisture}%</p>
                    </div>
                    <div>
                      <p style={{ fontSize: 9, color: '#8aab96', fontWeight: 600 }}>⚗️ pH</p>
                      <p style={{ fontSize: 11, color: '#1a2e1a', fontWeight: 600 }}>{zone.soil_ph}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: 9, color: '#8aab96', fontWeight: 600 }}>🌾 Nitrogen</p>
                      <p style={{ fontSize: 11, color: '#1a2e1a', fontWeight: 600 }}>{zone.nitrogen} ppm</p>
                    </div>
                    <div>
                      <p style={{ fontSize: 9, color: '#8aab96', fontWeight: 600 }}>💦 Irrigation</p>
                      <p style={{ fontSize: 11, color: '#1a2e1a', fontWeight: 600 }}>{zone.irrigation_type}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
