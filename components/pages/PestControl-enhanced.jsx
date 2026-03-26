'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, Grid3X3, Map as MapIcon, BarChart3, Palette, Droplet, Leaf, Wind, Zap, Info, Download, AlertCircle, Bug, Shield, Check } from 'lucide-react';

export default function PestControl({ field }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPest, setSelectedPest] = useState(null);
  const [detectedPests, setDetectedPests] = useState([
    { id: 1, name: 'Armyworm', severity: 'high', zone: 'Zone A', detection: 'Visual inspection', date: '2024-03-20' },
    { id: 2, name: 'Whitefly', severity: 'medium', zone: 'Zone B', detection: 'Sticky trap', date: '2024-03-19' },
  ]);

  // COMPREHENSIVE PEST DATABASE WITH TREATMENTS
  const pestDatabase = [
    {
      name: 'Armyworm',
      description: 'Spodoptera litura - Caterpillar pest affecting multiple crops',
      crops: ['Cotton', 'Corn', 'Tomato', 'Rice', 'Groundnut'],
      risk: 'High humidity (70-80%), temp 25-30°C',
      riskLevel: 'CRITICAL',
      organic: {
        method: 'Neem Oil + Bt Toxin',
        steps: ['Spray 3% neem oil',  'Apply Bacillus thuringiensis', 'Repeat every 7-10 days'],
        cost: '₹500-800',
        days: '7-10'
      },
      chemical: {
        method: 'Chlorpyrifos 20% EC',
        steps: ['Mix 10ml per 10L water', 'Spray in evening', 'Repeat after 15 days if needed'],
        cost: '₹300-500', days: '5-7'
      },
      bioagent: {
        method: 'Parasitoid Wasp (Tetrastichus)',
        steps: ['Release 5000 wasps per hectare', 'Maintain 60-80% RH', 'Monitor weekly'],
        cost: '₹2000-3000',
        days: '20-25'
      },
      preventive: 'Crop rotation, intercropping with maize, light traps, remove crop residue',
      indicator: 'Irregular holes in leaves, dark fecal matter, wilting shoots'
    },
    {
      name: 'Bollworm',
      description: 'Helicoverpa armigera - Major pest of cotton and legumes',
      crops: ['Cotton', 'Chickpea', 'Pigeon pea', 'Tomato', 'Sunflower'],
      risk: 'Warm weather 20-28°C, low rainfall',
      riskLevel: 'CRITICAL',
      organic: {
        method: 'Pheromone Trap + NPV',
        steps: ['Place sex pheromone traps', 'Apply Nuclear Polyhedrosis Virus suspension', '2-3 applications at 10-day intervals'],
        cost: '₹800-1200',
        days: '12-15'
      },
      chemical: {
        method: 'Endosulfan 35% EC',
        steps: ['Mix 7ml per 10L water', 'Spray at dusk', 'Repeat after 21 days'],
        cost: '₹400-600',
        days: '7-10'
      },
      bioagent: {
        method: 'Egg Parasitoid (Trichogramma)',
        steps: ['Release 50,000 cards per hectare', 'Release weekly for 3-4 times', 'Start from 50% egg laying stage'],
        cost: '₹3000-4000',
        days: '25-30'
      },
      preventive: 'Avoid late sowing, remove alternate hosts, collect infested buds weekly',
      indicator: 'Holes in flower buds, fruits with dark spots, frass inside bolls'
    },
    {
      name: 'Whitefly',
      description: 'Bemisia tabaci - Transmits viruses, causes leaf yellowing',
      crops: ['Cotton', 'Okra', 'Tomato', 'Chili', 'Brinjal', 'Cucumber'],
      risk: '70-80% humidity, temperature 25-32°C',
      riskLevel: 'HIGH',
      organic: {
        method: 'Yellow Sticky Trap + Neem',
        steps: ['Install yellow sticky traps 15cm above crop', 'Spray 3% neem oil weekly', 'Remove heavily infested leaves'],
        cost: '₹600-900',
        days: '5-7'
      },
      chemical: {
        method: 'Imidacloprid 17.8% SL',
        steps: ['Mix 3ml per 10L water', 'Spray thoroughly on leaf undersides', 'Avoid application in extreme heat'],
        cost: '₹450-700',
        days: '3-5'
      },
      bioagent: {
        method: 'Entomopathogens (Beauveria bassiana)',
        steps: ['Apply at 10^8 spores/ml', 'Maintain 80-90% RH', 'Repeat every 7-10 days'],
        cost: '₹1000-1500',
        days: '15-20'
      },
      preventive: 'Grow resistant varieties, remove weeds, use reflective mulches, avoid excess nitrogen',
      indicator: 'Yellowing leaves, sticky honeydew, black sooty mold, white adults on leaf undersides'
    },
    {
      name: 'Aphids',
      description: 'Aphis craccivora, Myzus persicae - Sap-feeding insect',
      crops: ['Groundnut', 'Pea', 'Cotton', 'Chili', 'Crucifers', 'Rose'],
      risk: '15-20°C, spring and fall months',
      riskLevel: 'MEDIUM',
      organic: {
        method: 'Spray Insecticide Soap + Ladybugs',
        steps: ['Spray 1% insecticide soap solution', 'Release ladybugs (500/100m²)', 'Repeat spray every 7 days'],
        cost: '₹300-500',
        days: '3-5'
      },
      chemical: {
        method: 'Malathion 50% EC',
        steps: ['Mix 10ml per 10L water', 'Spray in early morning', 'Repeat after 10-15 days if needed'],
        cost: '₹200-350',
        days: '2-3'
      },
      bioagent: {
        method: 'Coccinellid Beetles (Ladybugs)',
        steps: ['Release 100-200 beetles per plant', 'Ensure adequate food source', 'Maintain temperature 15-25°C'],
        cost: '₹1500-2000',
        days: 'Continuous control'
      },
      preventive: 'Encourage natural predators (ladybugs), avoid excessive nitrogen, maintain crop sanitation',
      indicator: 'Curled/yellowed leaves, sticky honeydew, small green/brown insects clustered on stems'
    },
    {
      name: 'Thrips',
      description: 'Thrips palmi, Scirtothrips dorsalis - Tiny rasping insects',
      crops: ['Chili', 'Onion', 'Groundnut', 'Tomato', 'Corn', 'Sunflower'],
      risk: 'Dry weather, high temperature 25-30°C',
      riskLevel: 'HIGH',
      organic: {
        method: 'Neem Oil + Blue Sticky Traps',
        steps: ['Install blue sticky traps', 'Spray 2% neem oil', 'Increase irrigation to raise humidity'],
        cost: '₹400-700',
        days: '7-10'
      },
      chemical: {
        method: 'Spinosad 45% SC',
        steps: ['Mix 3ml per 10L water', 'Spray early morning covering all plant parts', 'Repeat every 10-14 days'],
        cost: '₹550-800',
        days: '5-7'
      },
      bioagent: {
        method: 'Amblyseius mites (Predatory)',
        steps: ['Release 10-20 mites per plant', 'Avoid surfactants', 'Monitor population weekly'],
        cost: '₹2000-3000',
        days: '20-25'
      },
      preventive: 'Avoid water stress, maintain irrigation, reflective mulches, destroy plant debris',
      indicator: 'Silver streaks on leaves, black fecal spots, tiny insects on flower buds and leaves'
    },
    {
      name: 'Leaf Folder',
      description: 'Cnaphalocrocis medinalis - Rice pest folding leaves',
      crops: ['Rice', 'Sugarcane', 'Maize', 'Sorghum'],
      risk: 'High humidity (80-90%), temperature 24-28°C',
      riskLevel: 'CRITICAL',
      organic: {
        method: 'Bt Spray + Egg Parasitoid',
        steps: ['Apply Bt at 2000 IU/mg', 'Release Trichogramma @ 40,000/ha', 'Spray early morning'],
        cost: '₹700-1000',
        days: '10-12'
      },
      chemical: {
        method: 'Cartap Hydrochloride 50% SP',
        steps: ['Mix 8g per 10L water', 'Spray in evening', 'Repeat every 10 days'],
        cost: '₹300-500',
        days: '5-7'
      },
      bioagent: {
        method: 'Egg Parasitoid (Trichogramma)',
        steps: ['Release @ 40,000 parasitized eggs/ha', 'Release at egg-laying stage', 'Release 2-3 times at 10-day intervals'],
        cost: '₹2500-3500',
        days: '20-25'
      },
      preventive: 'Maintain field water level, destroy plant residue, avoid ratooning affected fields',
      indicator: 'Folded leaves with transparent windows, larvae inside rolled leaves, whitish excreta'
    },
    {
      name: 'Mealybug',
      description: 'Maconellicoccus hirsutus - Scale insect with waxy coating',
      crops: ['Sugarcane', 'Grapevine', 'Cotton', 'Sapota', 'Guava'],
      risk: 'Warm & humid, temperature 22-28°C',
      riskLevel: 'HIGH',
      organic: {
        method: 'Organic Horticulture Oil + Soap',
        steps: ['Spray 3-5% neem oil', 'Add insecticide soap', 'Repeat every 15 days for 3 sprays'],
        cost: '₹600-900',
        days: '15-20'
      },
      chemical: {
        method: 'Profenofos 50% EC',
        steps: ['Mix 20ml per 10L water', 'Spray thoroughly covering all affected areas', 'Repeat after 21 days'],
        cost: '₹400-650',
        days: '10-14'
      },
      bioagent: {
        method: 'Cryptolaemus Beetles + Parasitoid Wasp',
        steps: ['Release 50 beetles per plant', 'Release Anagyrus lopezi parasitoid', 'Maintain temperature 22-28°C'],
        cost: '₹3000-4500',
        days: '30-40'
      },
      preventive: 'Remove infested plant parts, improve sanitation, avoid excessive nitrogen fertilizer',
      indicator: 'White cottony masses on stems, yellowing leaves, sticky honeydew, stunted growth'
    },
    {
      name: 'Spider Mite',
      description: 'Tetranychus urticae - Microscopic pest causing bronzing',
      crops: ['Chili', 'Okra', 'Tomato', 'Groundnut', 'Vegetables'],
      risk: 'Hot and dry, temperature 25-35°C, RH <50%',
      riskLevel: 'HIGH',
      organic: {
        method: 'Sulfur Powder + Increase Humidity',
        steps: ['Dust 4% sulfur powder on leaves', 'Increase irrigation frequency', 'Apply sulfur spray (0.5%)'],
        cost: '₹250-450',
        days: '7-10'
      },
      chemical: {
        method: 'Propargite 57% EC',
        steps: ['Mix 15ml per 10L water', 'Spray thoroughly in evening', 'Repeat after 14 days if needed'],
        cost: '₹350-550',
        days: '5-7'
      },
      bioagent: {
        method: 'Predatory Mite (Phytoseiulus persimilis)',
        steps: ['Release 10-15 mites per plant', 'Maintain RH 60-80%', 'Introduce early in pest cycle'],
        cost: '₹2000-3000',
        days: '15-20'
      },
      preventive: 'Avoid water stress, spray water to increase humidity, avoid excessive dust',
      indicator: 'Fine webbing on leaves, yellowing/bronzing, tiny moving dots visible on undersides'
    },
    {
      name: 'Scale Insect',
      description: 'Various scale insects - Immobile pests with protective shell',
      crops: ['Citrus', 'Mango', 'Coconut', 'Coffee', 'Tea'],
      risk: 'Warm weather, temperature 20-32°C',
      riskLevel: 'MEDIUM',
      organic: {
        method: 'Dormant Oil + Soft Soap',
        steps: ['Apply winter dormant oil spray', 'Follow with insecticide soap in spring', 'Brush individually if light infestation'],
        cost: '₹400-700',
        days: '20-30'
      },
      chemical: {
        method: 'Quinalphos 25% EC',
        steps: ['Mix 20ml per 10L water', 'Spray targeting scale insects', 'Repeat every 21 days for 3 sprays'],
        cost: '₹350-600',
        days: '15-20'
      },
      bioagent: {
        method: 'Parasitoid Wasp (Aphytis, Encarsia)',
        steps: ['Release parasitoid wasps', 'Maintain temperature 20-32°C', 'Protect from pesticides'],
        cost: '₹2000-3500',
        days: '30-40'
      },
      preventive: 'Remove infested twigs, improve plant vigor, avoid water stress, prune crowded branches',
      indicator: 'Bumpy brown/white coverings on stems, yellowing leaves, sooty mold, stunted growth'
    },
    {
      name: 'Stem Borer',
      description: 'Chilo suppresalis, Sesamia inferens - Bores inside plant stems',
      crops: ['Rice', 'Sugarcane', 'Corn', 'Sorghum', 'Wheat'],
      risk: 'High humidity, temperature 24-28°C',
      riskLevel: 'CRITICAL',
      organic: {
        method: 'Bt Spray + Pheromone Trap',
        steps: ['Set pheromone traps', 'Spray Bt 1000 IU/mg', 'Remove and destroy infested stems'],
        cost: '₹800-1200',
        days: '15-20'
      },
      chemical: {
        method: 'Monocrotophos 36% SL',
        steps: ['Mix 20ml per 10L water', 'Spray timing crucial (at crop growth stage)', 'Spray in evening'],
        cost: '₹300-500',
        days: '7-10'
      },
      bioagent: {
        method: 'Parasitoid Wasp (Cotesia chilonis)',
        steps: ['Release 2000-5000 parasitoids/ha', 'Release at early egg-laying stage', 'Repeat releases every 7-10 days'],
        cost: '₹2500-3500',
        days: '25-30'
      },
      preventive: 'Crop rotation, plough deep, early transplanting, remove alternate hosts',
      indicator: 'Dead heart (shoot droop), white sawdust-like frass, damaged stems, reduced tillers'
    },
    {
      name: 'Fruit Fly',
      description: 'Bactrocera cucurbitae, Bactrocera tryoni - Maggots in fruits',
      crops: ['Mango', 'Guava', 'Melon', 'Pumpkin', 'Cucumber', 'Chili'],
      risk: 'Warm weather 15-30°C, rainy season',
      riskLevel: 'HIGH',
      organic: {
        method: 'Methyl Eugenol Trap + Biopesticide',
        steps: ['Set methyl eugenol traps', 'Remove infested fruits', 'Apply neem based biopesticide'],
        cost: '₹500-800',
        days: '15-25'
      },
      chemical: {
        method: 'Malathion 50% EC',
        steps: ['Mix 10ml per 10L water', 'Spray on foliage in evening', 'Repeat every 10-15 days'],
        cost: '₹250-450',
        days: '10-15'
      },
      bioagent: {
        method: 'Parasitoid Wasp (Diachasmimorpha longicaudata)',
        steps: ['Release 500-1000 parasitoids/ha', 'Establish parasitoid population', 'Provide protein diet for adults'],
        cost: '₹3000-4500',
        days: '40-50'
      },
      preventive: 'Remove fallen fruits, use protein baits, maintain field sanitation, grow resistant varieties',
      indicator: 'Presence of small eggs/punctures on fruit, rotting fruits, maggots inside fruits'
    },
    {
      name: 'Grasshopper',
      description: 'Acrididae family - Large chewing insect',
      crops: ['Most crops affected', 'Vegetables', 'Grains', 'Pastures'],
      risk: 'Warm & dry, temperature >20°C, erratic rainfall',
      riskLevel: 'MEDIUM',
      organic: {
        method: 'Neem Oil + Hand Collection',
        steps: ['Collect manually early morning/late evening', 'Spray 5% neem oil', 'Collect egg pods from soil'],
        cost: '₹200-400',
        days: '10-20'
      },
      chemical: {
        method: 'Carbaryl 50% WP',
        steps: ['Mix 20g per 10L water', 'Spray in early morning when cool', 'Repeat after 7-10 days'],
        cost: '₹300-500',
        days: '3-5'
      },
      bioagent: {
        method: 'Entomopathogenic Fungus (Metarhizium)',
        steps: ['Apply conidial suspension', 'Maintain soil moisture', 'Apply early morning for effectiveness'],
        cost: '₹1500-2500',
        days: '20-30'
      },
      preventive: 'Flood fields to destroy egg pods, cultural practices, maintain crop vigor, remove weeds',
      indicator: 'Chewed leaf margins, skeletonizing, missing plant parts, presence of droppings'
    },
  ];

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 28 }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #2d8a4e, #f59e0b)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bug size={22} color="white" />
            </div>
            Pest Management System
          </h1>
          <p className="page-sub">
            <Shield size={14} style={{ marginRight: 4, display: 'inline' }} />
            Integrated Pest Management with {pestDatabase.length} common pests
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28, borderBottom: '2px solid #d1e3bb', flexWrap: 'wrap' }}>
        {[
          { id: 'overview', label: '📊 Overview', icon: '📋' },
          { id: 'directory', label: '🗂️ Pest Directory', icon: '📚' },
          { id: 'treatments', label: '💊 Treatment Guide', icon: '💉' },
          { id: 'detected', label: '🔍 Detected Pests', icon: '⚠️' },
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            style={{
              padding: '10px 16px',
              background: activeTab === id ? 'linear-gradient(135deg, #2d8a4e, #f59e0b)' : 'transparent',
              color: activeTab === id ? 'white' : '#8aab96',
              border: activeTab === id ? 'none' : '1px solid #d1e3bb',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 13,
              transition: 'all 0.2s'
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Risk Assessment */}
          <div className="glass-card" style={{ borderColor: '#2d8a4e', background: 'linear-gradient(135deg, #e8f5ee, #f0f8f5)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a2e1a', marginBottom: 16 }}>🎯 Risk Assessment</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12 }}>
              {[
                { label: 'Critical', count: pestDatabase.filter(p => p.riskLevel === 'CRITICAL').length, color: '#c0392b', bg: '#fdecea' },
                { label: 'High', count: pestDatabase.filter(p => p.riskLevel === 'HIGH').length, color: '#b45309', bg: '#fef3cd' },
                { label: 'Medium', count: pestDatabase.filter(p => p.riskLevel === 'MEDIUM').length, color: '#f59e0b', bg: '#fef9e7' },
              ].map(item => (
                <div key={item.label} style={{ padding: 16, background: item.bg, borderRadius: 8, border: `2px solid ${item.color}` }}>
                  <p style={{ fontSize: 12, color: '#8aab96', fontWeight: 600 }}>{item.label}</p>
                  <p style={{ fontSize: 28, fontWeight: 800, color: item.color, marginTop: 8 }}>{item.count}</p>
                  <p style={{ fontSize: 10, color: '#8aab96', marginTop: 4 }}>pests</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Facts */}
          <div className="glass-card" style={{ borderColor: '#1a6fb5', background: 'linear-gradient(135deg, #e8f0fb, #f0f6ff)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a2e1a', marginBottom: 16 }}>📚 Quick Facts</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              <div style={{ padding: 12 }}>
                <p style={{ fontSize: 12, color: '#8aab96', fontWeight: 600, marginBottom: 8 }}>Total Covered Pests</p>
                <p style={{ fontSize: 24, fontWeight: 800, color: '#1a6fb5' }}>{pestDatabase.length}</p>
                <p style={{ fontSize: 11, color: '#8aab96', marginTop: 4 }}>Common agricultural pests in India</p>
              </div>
              <div style={{ padding: 12 }}>
                <p style={{ fontSize: 12, color: '#8aab96', fontWeight: 600, marginBottom: 8 }}>Comprehensive Treatments</p>
                <p style={{ fontSize: 24, fontWeight: 800, color: '#2d8a4e' }}>3x</p>
                <p style={{ fontSize: 11, color: '#8aab96', marginTop: 4 }}>Per pest (Organic, Chemical, Bio)</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PEST DIRECTORY TAB */}
      {activeTab === 'directory' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {pestDatabase.map((pest) => (
            <div
              key={pest.name}
              onClick={() => setSelectedPest(selectedPest?.name === pest.name ? null : pest)}
              className="glass-card"
              style={{
                borderColor: pest.riskLevel === 'CRITICAL' ? '#c0392b' : pest.riskLevel === 'HIGH' ? '#b45309' : '#f59e0b',
                background: pest.riskLevel === 'CRITICAL' ? '#fdecea' : pest.riskLevel === 'HIGH' ? '#fef3cd' : '#fef9e7',
                cursor: 'pointer',
                transition: 'all 0.2s',
                border: selectedPest?.name === pest.name ? '2px solid #1a2e1a' : `1px solid ${pest.riskLevel === 'CRITICAL' ? '#c0392b' : pest.riskLevel === 'HIGH' ? '#b45309' : '#f59e0b'}`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                <div>
                  <p style={{ fontSize: 16, fontWeight: 800, color: '#1a2e1a', marginBottom: 4 }}>🐛 {pest.name}</p>
                  <p style={{ fontSize: 11, color: '#8aab96', fontWeight: 500 }}>{pest.description}</p>
                </div>
                <div style={{ padding: '4px 8px', background: pest.riskLevel === 'CRITICAL' ? '#c0392b' : pest.riskLevel === 'HIGH' ? '#b45309' : '#f59e0b', color: 'white', borderRadius: 4, fontSize: 10, fontWeight: 700 }}>
                  {pest.riskLevel}
                </div>
              </div>

              {/* Crops affected */}
              <div style={{ marginBottom: 12 }}>
                <p style={{ fontSize: 10, color: '#8aab96', fontWeight: 600, marginBottom: 6 }}>Affects Crops:</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {pest.crops.map(crop => (
                    <span key={crop} style={{ padding: '2px 8px', background: '#ffffff', borderRadius: 4, fontSize: 10, color: '#1a2e1a', fontWeight: 500 }}>
                      {crop}
                    </span>
                  ))}
                </div>
              </div>

              {/* Risk conditions */}
              <div style={{ padding: 10, background: 'rgba(0,0,0,0.05)', borderRadius: 6, marginBottom: 12 }}>
                <p style={{ fontSize: 10, color: '#8aab96', fontWeight: 600, marginBottom: 4 }}>⚠️ Risk Conditions:</p>
                <p style={{ fontSize: 10, color: '#1a2e1a' }}>{pest.risk}</p>
              </div>

              {selectedPest?.name === pest.name && (
                <div style={{ paddingTop: 12, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                  <p style={{ fontSize: 11, color: '#1a2e1a', fontWeight: 600, marginBottom: 8 }}>🔍 Identification:</p>
                  <p style={{ fontSize: 10, color: '#1a2e1a', lineHeight: '1.5' }}>{pest.indicator}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* TREATMENTS TAB - SIDE BY SIDE */}
      {activeTab === 'treatments' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {pestDatabase.map((pest) => (
            <div key={pest.name} className="glass-card" style={{ borderColor: '#2d8a4e', borderWidth: 2 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1a2e1a', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                🐛 {pest.name}
                <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 8px', background: pest.riskLevel === 'CRITICAL' ? '#c0392b' : '#b45309', color: 'white', borderRadius: 4 }}>
                  {pest.riskLevel}
                </span>
              </h3>

              {/* Three-column treatment comparison */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16, marginBottom: 16 }}>
                {/* ORGANIC */}
                <div style={{ padding: 14, background: '#e8f5ee', borderRadius: 10, border: '2px solid #2d8a4e' }}>
                  <p style={{ fontSize: 13, fontWeight: 800, color: '#2d8a4e', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    🌿 ORGANIC: {pest.organic.method}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div>
                      <p style={{ fontSize: 10, color: '#8aab96', fontWeight: 600, marginBottom: 4 }}>Steps:</p>
                      {pest.organic.steps.map((step, i) => (
                        <p key={i} style={{ fontSize: 10, color: '#1a2e1a', marginBottom: 4 }}>
                          {i + 1}. {step}
                        </p>
                      ))}
                    </div>
                    <div style={{ padding: 8, background: '#ffffff', borderRadius: 6 }}>
                      <p style={{ fontSize: 9, color: '#8aab96', fontWeight: 600 }}>💰 Cost: <span style={{ color: '#2d8a4e', fontWeight: 800 }}>{pest.organic.cost}</span></p>
                      <p style={{ fontSize: 9, color: '#8aab96', fontWeight: 600 }}>⏱️ Time: <span style={{ color: '#2d8a4e', fontWeight: 800 }}>{pest.organic.days}</span></p>
                    </div>
                  </div>
                </div>

                {/* CHEMICAL */}
                <div style={{ padding: 14, background: '#fef3cd', borderRadius: 10, border: '2px solid #b45309' }}>
                  <p style={{ fontSize: 13, fontWeight: 800, color: '#b45309', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    🧪 CHEMICAL: {pest.chemical.method}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div>
                      <p style={{ fontSize: 10, color: '#8aab96', fontWeight: 600, marginBottom: 4 }}>Steps:</p>
                      {pest.chemical.steps.map((step, i) => (
                        <p key={i} style={{ fontSize: 10, color: '#1a2e1a', marginBottom: 4 }}>
                          {i + 1}. {step}
                        </p>
                      ))}
                    </div>
                    <div style={{ padding: 8, background: '#ffffff', borderRadius: 6 }}>
                      <p style={{ fontSize: 9, color: '#8aab96', fontWeight: 600 }}>💰 Cost: <span style={{ color: '#b45309', fontWeight: 800 }}>{pest.chemical.cost}</span></p>
                      <p style={{ fontSize: 9, color: '#8aab96', fontWeight: 600 }}>⏱️ Time: <span style={{ color: '#b45309', fontWeight: 800 }}>{pest.chemical.days}</span></p>
                    </div>
                  </div>
                </div>

                {/* BIOAGENT */}
                <div style={{ padding: 14, background: '#e8f0fb', borderRadius: 10, border: '2px solid #1a6fb5' }}>
                  <p style={{ fontSize: 13, fontWeight: 800, color: '#1a6fb5', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    🦠 BIOAGENT: {pest.bioagent.method}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div>
                      <p style={{ fontSize: 10, color: '#8aab96', fontWeight: 600, marginBottom: 4 }}>Steps:</p>
                      {pest.bioagent.steps.map((step, i) => (
                        <p key={i} style={{ fontSize: 10, color: '#1a2e1a', marginBottom: 4 }}>
                          {i + 1}. {step}
                        </p>
                      ))}
                    </div>
                    <div style={{ padding: 8, background: '#ffffff', borderRadius: 6 }}>
                      <p style={{ fontSize: 9, color: '#8aab96', fontWeight: 600 }}>💰 Cost: <span style={{ color: '#1a6fb5', fontWeight: 800 }}>{pest.bioagent.cost}</span></p>
                      <p style={{ fontSize: 9, color: '#8aab96', fontWeight: 600 }}>⏱️ Time: <span style={{ color: '#1a6fb5', fontWeight: 800 }}>{pest.bioagent.days}</span></p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preventive & Indicator */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, paddingTop: 12, borderTop: '2px solid #d1e3bb' }}>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#2d8a4e', marginBottom: 8 }}>✅ Preventive Measures:</p>
                  <p style={{ fontSize: 11, color: '#1a2e1a', lineHeight: '1.5' }}>{pest.preventive}</p>
                </div>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#c0392b', marginBottom: 8 }}>🔍 Pest Indicators:</p>
                  <p style={{ fontSize: 11, color: '#1a2e1a', lineHeight: '1.5' }}>{pest.indicator}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DETECTED PESTS TAB */}
      {activeTab === 'detected' && (
        <div className="glass-card" style={{ borderColor: '#2d8a4e' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a2e1a', marginBottom: 16 }}>🔍 Currently Detected Pests</h3>
          {detectedPests.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#8aab96' }}>
              <p style={{ fontSize: 14, fontWeight: 600 }}>✅ No pests detected</p>
              <p style={{ fontSize: 12, marginTop: 8 }}>Your farm is healthy! Continue monitoring with regular field inspections.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              {detectedPests.map(detected => {
                const pestDetail = pestDatabase.find(p => p.name === detected.name);
                return (
                  <div key={detected.id} style={{ padding: 16, background: detected.severity === 'high' ? '#fdecea' : detected.severity === 'medium' ? '#fef3cd' : '#e8f5ee', borderRadius: 10, border: `2px solid ${detected.severity === 'high' ? '#c0392b' : detected.severity === 'medium' ? '#b45309' : '#2d8a4e'}` }}>
                    <p style={{ fontSize: 14, fontWeight: 800, color: '#1a2e1a', marginBottom: 8 }}>🐛 {detected.name}</p>
                    <p style={{ fontSize: 11, color: '#8aab96', marginBottom: 6 }}>Severity: <span style={{ fontWeight: 700, color: detected.severity === 'high' ? '#c0392b' : detected.severity === 'medium' ? '#b45309' : '#2d8a4e' }}>{detected.severity.toUpperCase()}</span></p>
                    <p style={{ fontSize: 11, color: '#8aab96', marginBottom: 6 }}>Location: {detected.zone}</p>
                    <p style={{ fontSize: 10, color: '#8aab96' }}>Detected: {detected.date}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
