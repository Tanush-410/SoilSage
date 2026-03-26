'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle, Droplets, Bug, TrendingUp, Activity } from 'lucide-react';

export default function FarmVisualization({ field }) {
  const [pestDetection, setPestDetection] = useState(null);
  const [cropHealth, setCropHealth] = useState('good');
  const [gridData, setGridData] = useState([]);

  // Generate 2D grid for field visualization (8x6 zones)
  useEffect(() => {
    if (field) {
      let grid = [];

      // If field has a layout plan, use it
      if (field.layout_zones) {
        try {
          const layoutZones = JSON.parse(field.layout_zones);
          const rows = field.layout_rows || 6;
          const cols = field.layout_cols || 8;

          for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
              const configuredZone = layoutZones.find((z) => z.row === i && z.col === j);
              const distanceFromCenter = Math.abs(i - 2.5) + Math.abs(j - 3.5);
              const moisture = field.soil_moisture || 50;
              const baseNeed = 100 - moisture;
              const zoneNeed = Math.max(0, baseNeed + (distanceFromCenter * 3));
              const stressLevel = Math.max(0, zoneNeed - 50);
              const pestRisk = stressLevel > 30 ? Math.random() : Math.random() * 0.3;

              grid.push({
                id: `${i}-${j}`,
                row: i,
                col: j,
                moisture: Math.max(0, moisture - (distanceFromCenter * 2)),
                irrigationNeed: Math.min(100, zoneNeed),
                pestRisk: pestRisk,
                temperature: field.soil_temperature || 28,
                ph: field.soil_ph || 7,
                zoneConfig: configuredZone,
              });
            }
          }
        } catch (e) {
          console.error('Error parsing layout zones:', e);
          grid = generateDefaultGrid(field);
        }
      } else {
        grid = generateDefaultGrid(field);
      }

      setGridData(grid);

      // Calculate crop health based on soil metrics
      const avgMoisture = grid.reduce((a, b) => a + b.moisture, 0) / grid.length;
      const pH = field.soil_ph || 7;
      const temp = field.soil_temperature || 28;
      const avgPestRisk = grid.reduce((a, b) => a + b.pestRisk, 0) / grid.length;

      let health = 'good';
      let score = 100;

      if (avgMoisture < 30 || avgMoisture > 80) score -= 20;
      if (pH < 6 || pH > 8) score -= 15;
      if (temp < 15 || temp > 35) score -= 10;
      if (avgPestRisk > 0.5) score -= 25;

      if (score >= 80) health = 'excellent';
      else if (score >= 60) health = 'good';
      else if (score >= 40) health = 'fair';
      else health = 'poor';

      setCropHealth(health);

      // Pest detection summary
      const affectedZones = grid.filter((z) => z.pestRisk > 0.6).length;
      if (affectedZones > 0) {
        setPestDetection({
          detected: true,
          affectedZones: affectedZones,
          pestTypes: ['Aphids', 'Spider Mites', 'Whiteflies'][Math.floor(Math.random() * 3)],
          severity: affectedZones > 8 ? 'high' : 'moderate',
        });
      } else {
        setPestDetection({ detected: false });
      }
    }
  }, [field]);

  function generateDefaultGrid(field) {
    const rows = 6;
    const cols = 8;
    const grid = [];

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const irrigationNeed = Math.random() * 100;
        const moisture = field.soil_moisture || 50;
        const baseNeed = 100 - moisture;

        const distanceFromCenter = Math.abs(i - 2.5) + Math.abs(j - 3.5);
        const zoneNeed = Math.max(0, baseNeed + (distanceFromCenter * 3));

        const stressLevel = Math.max(0, zoneNeed - 50);
        const pestRisk = stressLevel > 30 ? Math.random() : Math.random() * 0.3;

        grid.push({
          id: `${i}-${j}`,
          row: i,
          col: j,
          moisture: Math.max(0, moisture - (distanceFromCenter * 2)),
          irrigationNeed: Math.min(100, zoneNeed),
          pestRisk: pestRisk,
          temperature: field.soil_temperature || 28,
          ph: field.soil_ph || 7,
          zoneConfig: null,
        });
      }
    }
    return grid;
  }

  const getHealthColor = (health) => {
    switch (health) {
      case 'excellent':
        return 'text-green-600';
      case 'good':
        return 'text-green-500';
      case 'fair':
        return 'text-yellow-500';
      case 'poor':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  const getHealthBgColor = (health) => {
    switch (health) {
      case 'excellent':
        return 'bg-green-50';
      case 'good':
        return 'bg-green-50';
      case 'fair':
        return 'bg-yellow-50';
      case 'poor':
        return 'bg-red-50';
      default:
        return 'bg-gray-50';
    }
  };

  if (!field) {
    return <div className="text-center py-8">Select a field to view 2D visualization</div>;
  }

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow">
      {/* Title */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Farm 2D Visualization</h2>
        <div className={`px-4 py-2 rounded-full ${getHealthBgColor(cropHealth)}`}>
          <p className={`font-semibold ${getHealthColor(cropHealth)} capitalize`}>
            Crop Health: {cropHealth}
          </p>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-3 gap-4">
        {/* Irrigation Status */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <Droplets className="text-blue-600" size={24} />
            <h3 className="font-semibold text-gray-800">Irrigation Status</h3>
          </div>
          <p className="text-sm text-gray-600">
            {gridData.filter((z) => z.irrigationNeed > 60).length} zones need urgent irrigation
          </p>
          <p className="text-2xl font-bold text-blue-600 mt-2">
            {field.soil_moisture || 0}%
          </p>
          <p className="text-xs text-gray-500">Current soil moisture</p>
        </div>

        {/* Crop Health Status */}
        <div className={`bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg`}>
          <div className="flex items-center gap-3 mb-2">
            <Activity className="text-green-600" size={24} />
            <h3 className="font-semibold text-gray-800">Crop Health</h3>
          </div>
          <p className={`text-sm font-medium ${getHealthColor(cropHealth)} capitalize`}>
            {cropHealth}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Temp: {field.soil_temperature || 28}°C | pH: {field.soil_ph || 7}
          </p>
        </div>

        {/* Pest Detection */}
        <div className={`p-4 rounded-lg ${pestDetection?.detected ? 'bg-gradient-to-br from-red-50 to-red-100' : 'bg-gradient-to-br from-green-50 to-green-100'}`}>
          <div className="flex items-center gap-3 mb-2">
            <Bug className={pestDetection?.detected ? 'text-red-600' : 'text-green-600'} size={24} />
            <h3 className="font-semibold text-gray-800">Pest Detection</h3>
          </div>
          {pestDetection?.detected ? (
            <>
              <p className="text-sm font-semibold text-red-600">
                {pestDetection.pestTypes} Detected
              </p>
              <p className="text-xs text-gray-600">
                {pestDetection.affectedZones} zones affected ({pestDetection.severity})
              </p>
            </>
          ) : (
            <p className="text-sm font-semibold text-green-600">No pests detected</p>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-3">Legend</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-semibold mb-2 text-gray-700">Irrigation Need (Color)</div>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-600 rounded"></div>
                <span>Critical - Needs irrigation NOW</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-600 rounded"></div>
                <span>High - Needs irrigation soon</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-500 rounded"></div>
                <span>Medium - Monitor moisture</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-400 rounded"></div>
                <span>Low - Adequate moisture</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-400 rounded"></div>
                <span>Minimal - Good moisture level</span>
              </div>
            </div>
          </div>
          <div>
            <div className="text-sm font-semibold mb-2 text-gray-700">Pest Risk (Border)</div>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-green-400 rounded"></div>
                <span>Green - No pest risk</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-yellow-400 rounded"></div>
                <span>Yellow - Moderate risk</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-red-500 rounded"></div>
                <span>Red - High pest risk</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2D Farm Grid */}
      <div className="bg-gray-50 p-6 rounded-lg overflow-x-auto">
        <h3 className="font-semibold text-gray-800 mb-4">Field Map ({field.name})</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '8px', width: 'fit-content' }}>
          {gridData.map((zone) => (
            <div
              key={zone.id}
              style={{
                width: '70px',
                height: '70px',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                backgroundColor: zone.zoneConfig ? zone.zoneConfig.color : (zone.irrigationNeed < 20 ? '#2563eb' : zone.irrigationNeed < 40 ? '#60a5fa' : zone.irrigationNeed < 60 ? '#facc15' : zone.irrigationNeed < 80 ? '#f97316' : '#dc2626'),
                border: zone.pestRisk < 0.3 ? '2px solid #4ade80' : zone.pestRisk < 0.6 ? '2px solid #facc15' : '2px solid #ef4444',
              }}
              title={zone.zoneConfig ?
                `${zone.zoneConfig.name}\nCrop: ${zone.zoneConfig.crop_type}\nIrrigation: ${zone.zoneConfig.irrigation_type}\nMoisture: ${Math.round(zone.moisture)}%\nPest Risk: ${(zone.pestRisk * 100).toFixed(0)}%` :
                `Row ${zone.row + 1}, Col ${zone.col + 1}\nMoisture: ${Math.round(zone.moisture)}%\nIrrigation Need: ${Math.round(zone.irrigationNeed)}%\nPest Risk: ${(zone.pestRisk * 100).toFixed(0)}%`
              }
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <div style={{ textAlign: 'center' }}>
                {zone.zoneConfig ? (
                  <>
                    <div style={{ fontSize: '10px' }}>{zone.zoneConfig.name.substring(0, 5)}</div>
                    <div>{Math.round(zone.moisture)}%</div>
                  </>
                ) : (
                  <div>{Math.round(zone.moisture)}%</div>
                )}
                {zone.pestRisk > 0.6 && <Bug size={14} style={{ marginTop: '4px' }} />}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <div className="flex gap-3">
          <AlertCircle className="text-blue-600 flex-shrink-0" size={20} />
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Recommendations</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              {gridData.filter((z) => z.irrigationNeed > 60).length > 0 && (
                <li>
                  • Prioritize irrigation for the {gridData.filter((z) => z.irrigationNeed > 60).length} red/orange zones
                </li>
              )}
              {pestDetection?.detected && (
                <li>• Apply pest management treatment to affected zones: {pestDetection.pestTypes}</li>
              )}
              {cropHealth === 'poor' && (
                <li>• Crop health is declining - check soil pH, temperature, and nutrient levels</li>
              )}
              {field.soil_ph && (field.soil_ph < 6 || field.soil_ph > 8) && (
                <li>• Soil pH is out of optimal range ({field.soil_ph}) - consider amendment</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
