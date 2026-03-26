'use client'
import { useState, useEffect, createContext, useContext } from 'react'

const LANGUAGES = {
  en: { name: 'English', flag: '🇬🇧' },
  kn: { name: 'ಕನ್ನಡ', flag: '🇮🇳' },
}

const T = {
  en: {
    // Nav
    dashboard: 'Dashboard', myFields: 'My Fields', aiAdvisor: 'AI Advisor',
    schedule: 'Schedule', history: 'History', settings: 'Settings', signOut: 'Sign Out',
    language: 'Language',
    // Dashboard
    welcomeBack: 'Welcome back', farmSub: 'FAO-56 AI Irrigation Management',
    totalFields: 'Total Fields', waterSaved: 'Water Saved', efficiency: 'Efficiency',
    activeAlerts: 'Active Alerts', fields: 'fields', litres: 'litres', alerts: 'alerts',
    vsFlood: 'vs flood irrigation', faoOptimised: 'FAO-56 Optimised',
    liveWeather: 'Live Weather', soilMoistureTrend: 'Soil Moisture Trend (7-Day)',
    simulatedIoT: 'Simulated IoT', soilMoisture: 'Soil Moisture', optimal: 'Optimal (65%)',
    rainfall: 'Rainfall', myFieldsCard: 'My Fields', viewAll: 'View All →',
    noFields: 'No fields yet', addField: 'Add Field', recentRecs: 'Recent AI Recommendations',
    runAnalysis: 'Run Analysis →', noRecs: 'No recommendations yet', getAiAdvice: 'Get AI Advice',
    getAiRec: 'Get AI Recommendation',
    // Fields
    myFieldsTitle: 'My Fields', myFieldsSub: 'Manage fields · Soil health · Yield & market value',
    addNewField: 'Add Field', noFieldsYet: 'No fields added yet',
    noFieldsDesc: 'Add your first field to get AI-powered irrigation recommendations based on FAO-56 standards',
    addFirstField: 'Add First Field', crop: 'Crop', area: 'Area', soil: 'Soil', stage: 'Stage',
    soilHealth: 'Soil Health', estYield: 'Est. Yield', moisture: 'Moisture',
    critical: '⚠️ Critical', monitor: '⚡ Monitor', adequate: '✅ Adequate',
    editField: 'Edit Field', addNewFieldTitle: 'Add New Field',
    fieldName: 'Field Name *', areaHa: 'Area (hectares) *', cropType: 'Crop Type *',
    growthStage: 'Growth Stage', soilType: 'Soil Type *', location: 'Location',
    iotData: 'IoT Soil Sensor Data', moisturePct: 'Moisture (%)', phLevel: 'pH Level',
    tempC: 'Temp (°C)', nitrogen: 'Nitrogen (ppm)', phosphorus: 'Phosphorus (ppm)',
    potassium: 'Potassium (ppm)', cancel: 'Cancel', updateField: 'Update Field', saving: 'Saving...',
    deleteConfirm: 'Delete this field and all its data?',
    // Advisor
    aiAdvisorTitle: 'AI Crop Advisor',
    aiAdvisorSub: 'Irrigation Analysis · Python ML models · Real-time weather integration',
    analysisInput: 'Analysis Input', selectField: 'My Fields', customInput: 'Custom Input',
    runAiAnalysis: 'Run AI Analysis', runningML: 'Running ML Models...',
    fetchingWeather: 'Fetching weather · Analyzing irrigation data',
    readyForAnalysis: 'Ready for Analysis', readyDesc: 'Select a field or enter custom inputs, then click Run AI Analysis.',
    analysisFailed: 'Analysis Failed', tryAgain: 'Try Again',
    irrigateNow: '💧 Irrigate Now', holdIrrigation: '✋ Hold Irrigation', next: 'Next:',
    totalLitres: 'Total Litres (week)', duration: 'Duration (min)', netIrr: 'Net Irr. (mm/week)',
    scientificMetrics: 'Scientific Metrics (FAO-56)', irrigationSchedule: 'Irrigation Schedule',
    aiAnalysis: 'AI Analysis', alertsTitle: 'Alerts', pestRiskTitle: '🐛 Pest Risk Analysis',
    riskScore: 'Risk Score', scoutEvery: 'Scout Every', basedOnWeather: 'Based on Live Weather:',
    humidity: 'Humidity', pythonActive: '🤖 Python ML API Active', fallbackMode: '📐 Fallback Mode (ML server offline)',
    // Schedule
    scheduleTitle: '7-Day Irrigation Schedule', scheduleSub: 'Daily ETc balance — FAO-56 Penman-Monteith',
    selectFieldLabel: 'Select Field', generatePlan: 'Generate Plan', generating: 'Generating...',
    irrigationDays: 'Irrigation Days', weeklySchedule: 'Weekly Schedule', etcBased: 'ETc-based',
    date: 'Date', et0: 'ET₀ (mm)', etc: 'ETc (mm)', rain: 'Rain (mm)', netIrrCol: 'Net Irr (mm)',
    temp: 'Temp', action: 'Action', irrigate: 'Irrigate', hold: 'Hold',
    methodology: 'Methodology:', generatePrompt: 'Generate a schedule to see your 7-day irrigation plan',
    // History
    historyTitle: 'History & Logs', historySub: 'Past AI recommendations and irrigation records',
    logIrrigation: 'Log Irrigation', aiRecs: 'AI Recommendations', irrigationLogs: 'Irrigation Logs',
    noRecsYet: 'No recommendations yet — run the AI Advisor first',
    noLogsYet: 'No irrigation logs yet — click "Log Irrigation" to record one',
    dateCol: 'Date', fieldCol: 'Field', cropCol: 'Crop', priorityCol: 'Priority',
    nextIrrCol: 'Next Irrigation', waterCol: 'Water (L)', efficiencyCol: 'Efficiency',
    dateTimeCol: 'Date & Time', durationCol: 'Duration (min)', notesCol: 'Notes',
    logIrrigationEvent: 'Log Irrigation Event', fieldRequired: 'Field *', selectFieldOpt: 'Select Field',
    durationMin: 'Duration (minutes)', waterUsed: 'Water Used (litres)', notesOpt: 'Notes (optional)',
    saveLog: 'Save Log',
    // Settings
    settingsTitle: 'Settings', settingsSub: 'Manage your farm profile and preferences',
    farmProfile: 'Farm Profile', fullName: 'Full Name', farmName: 'Farm Name',
    locationCity: 'Location / City', locationHint: 'Used to fetch live weather for your farm',
    email: 'Email', saveChanges: 'Save Changes', saved: 'Saved!',
    mlModelInfo: '🤖 ML Model Info',
    // Yield Price
    yieldPrice: 'Yield & Market Value', yieldPriceSub: 'Per-crop yield estimates · MSP/APMC 2024-25 market rates · Efficiency-adjusted',
    totalYieldTonnes: 'Total Est. Yield', marketValueTotal: 'Total Market Value', fieldsTracked: 'Fields Tracked',
    mspSource: 'Based on MSP/APMC rates', tonnesUnit: 'tonnes', yieldEmptyDesc: 'Add fields in "My Fields" to see yield and market value estimates.',
    priceSource: 'Price Source', yieldNote: 'Yield adjusted for FAO-56 irrigation efficiency',
    quintalPrice: 'Quintal Price', totalQuintals: 'Total Quintals', totalRevenue: 'Total Revenue',
    marketValue: 'Market Value',
    // Soil Health Page
    soilHealthTitle: 'Soil Health Dashboard', soilHealthSub: 'Per-field soil health analysis · pH · NPK · Moisture · Actionable recommendations',
    avgSoilHealth: 'Avg. Soil Health', fieldMonitored: 'Fields Monitored', needsAttention: 'Needs Attention',
    overallSoilHealth: 'Overall Soil Health', recommendations: 'Recommendations',
    soilEmptyDesc: 'Add fields in "My Fields" to see soil health analysis.',
    // Pest Monitor
    pestMonitorTitle: 'Pest Risk Monitor', pestMonitorSub: 'Real-time pest risk from live weather · Humidity & temperature based · Per-field analysis',
    refresh: '⟳ Refresh', refreshing: 'Refreshing...', highRiskFields: 'High Risk Fields',
    currentHumidity: 'Current Humidity', weatherPestNote: 'Weather conditions driving pest risk',
    scouting: 'Scouting Frequency', pestEmptyDesc: 'Add fields in "My Fields" to monitor pest risk.',
    riskLevel: 'Pest Risk Level',
  },
  kn: {
    // Nav
    dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್', myFields: 'ನನ್ನ ಹೊಲಗಳು', aiAdvisor: 'AI ಸಲಹೆಗಾರ',
    schedule: 'ವೇಳಾಪಟ್ಟಿ', history: 'ಇತಿಹಾಸ', settings: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು', signOut: 'ಸೈನ್ ಔಟ್',
    language: 'ಭಾಷೆ',
    // Dashboard
    welcomeBack: 'ಮತ್ತೆ ಸ್ವಾಗತ', farmSub: 'FAO-56 AI ನೀರಾವರಿ ನಿರ್ವಹಣೆ',
    totalFields: 'ಒಟ್ಟು ಹೊಲಗಳು', waterSaved: 'ನೀರು ಉಳಿತಾಯ', efficiency: 'ದಕ್ಷತೆ',
    activeAlerts: 'ಸಕ್ರಿಯ ಎಚ್ಚರಿಕೆಗಳು', fields: 'ಹೊಲಗಳು', litres: 'ಲೀಟರ್', alerts: 'ಎಚ್ಚರಿಕೆಗಳು',
    vsFlood: 'ಪ್ರವಾಹ ನೀರಾವರಿಗೆ ಹೋಲಿಸಿ', faoOptimised: 'FAO-56 ಅನುಕೂಲಿತ',
    liveWeather: 'ನೇರ ಹವಾಮಾನ', soilMoistureTrend: 'ಮಣ್ಣಿನ ತೇವ ಟ್ರೆಂಡ್ (7 ದಿನ)',
    simulatedIoT: 'ಅನುಕರಣ IoT', soilMoisture: 'ಮಣ್ಣಿನ ತೇವ', optimal: 'ಆದರ್ಶ (65%)',
    rainfall: 'ಮಳೆ', myFieldsCard: 'ನನ್ನ ಹೊಲಗಳು', viewAll: 'ಎಲ್ಲ ನೋಡಿ →',
    noFields: 'ಇನ್ನೂ ಹೊಲಗಳಿಲ್ಲ', addField: 'ಹೊಲ ಸೇರಿಸಿ', recentRecs: 'ಇತ್ತೀಚಿನ AI ಶಿಫಾರಸುಗಳು',
    runAnalysis: 'ವಿಶ್ಲೇಷಣೆ ಚಲಾಯಿಸಿ →', noRecs: 'ಇನ್ನೂ ಶಿಫಾರಸುಗಳಿಲ್ಲ', getAiAdvice: 'AI ಸಲಹೆ ಪಡೆಯಿರಿ',
    getAiRec: 'AI ಶಿಫಾರಸು ಪಡೆಯಿರಿ',
    // Fields
    myFieldsTitle: 'ನನ್ನ ಹೊಲಗಳು', myFieldsSub: 'ಹೊಲ ನಿರ್ವಹಣೆ · ಮಣ್ಣು ಆರೋಗ್ಯ · ಇಳುವರಿ & ಮಾರುಕಟ್ಟೆ ಮೌಲ್ಯ',
    addNewField: 'ಹೊಲ ಸೇರಿಸಿ', noFieldsYet: 'ಇನ್ನೂ ಯಾವ ಹೊಲವೂ ಸೇರಿಸಿಲ್ಲ',
    noFieldsDesc: 'FAO-56 ಆಧಾರದ AI ನೀರಾವರಿ ಶಿಫಾರಸು ಪಡೆಯಲು ನಿಮ್ಮ ಮೊದಲ ಹೊಲ ಸೇರಿಸಿ',
    addFirstField: 'ಮೊದಲ ಹೊಲ ಸೇರಿಸಿ', crop: 'ಬೆಳೆ', area: 'ವಿಸ್ತೀರ್ಣ', soil: 'ಮಣ್ಣು', stage: 'ಹಂತ',
    soilHealth: 'ಮಣ್ಣು ಆರೋಗ್ಯ', estYield: 'ಅಂದಾಜು ಇಳುವರಿ', moisture: 'ತೇವ',
    critical: '⚠️ ತುರ್ತು', monitor: '⚡ ಮೇಲ್ವಿಚಾರಣೆ', adequate: '✅ ಸಮರ್ಪಕ',
    editField: 'ಹೊಲ ಸಂಪಾದಿಸಿ', addNewFieldTitle: 'ಹೊಲ ಸೇರಿಸಿ',
    fieldName: 'ಹೊಲದ ಹೆಸರು *', areaHa: 'ವಿಸ್ತೀರ್ಣ (ಹೆಕ್ಟೇರ್) *', cropType: 'ಬೆಳೆ ಪ್ರಕಾರ *',
    growthStage: 'ಬೆಳವಣಿಗೆ ಹಂತ', soilType: 'ಮಣ್ಣಿನ ಪ್ರಕಾರ *', location: 'ಸ್ಥಳ',
    iotData: 'IoT ಮಣ್ಣು ಸಂವೇದಕ ಡೇಟಾ', moisturePct: 'ತೇವ (%)', phLevel: 'pH ಮಟ್ಟ',
    tempC: 'ತಾಪ (°C)', nitrogen: 'ಸಾರಜನಕ (ppm)', phosphorus: 'ರಂಜಕ (ppm)',
    potassium: 'ಪೊಟ್ಯಾಸಿಯಮ್ (ppm)', cancel: 'ರದ್ದು', updateField: 'ಹೊಲ ನವೀಕರಿಸಿ', saving: 'ಉಳಿಸಲಾಗುತ್ತಿದೆ...',
    deleteConfirm: 'ಈ ಹೊಲ ಮತ್ತು ಎಲ್ಲ ಡೇಟಾ ಅಳಿಸಬೇಕೇ?',
    // Advisor
    aiAdvisorTitle: 'AI ಬೆಳೆ ಸಲಹೆಗಾರ',
    aiAdvisorSub: 'ನೀರಾವರಿ ವಿಶ್ಲೇಷಣೆ · Python ML ಮಾದರಿಗಳು · ನೇರ ಹವಾಮಾನ ಸಂಯೋಜನೆ',
    analysisInput: 'ವಿಶ್ಲೇಷಣೆ ನಮೂದು', selectField: 'ನನ್ನ ಹೊಲಗಳು', customInput: 'ಕಸ್ಟಮ್ ನಮೂದು',
    runAiAnalysis: 'AI ವಿಶ್ಲೇಷಣೆ ಚಲಾಯಿಸಿ', runningML: 'ML ಮಾದರಿ ಚಲಿಸುತ್ತಿದೆ...',
    fetchingWeather: 'ಹವಾಮಾನ ಪಡೆಯಲಾಗುತ್ತಿದೆ · ನೀರಾವರಿ ದತ್ತಾಂಶ ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ',
    readyForAnalysis: 'ವಿಶ್ಲೇಷಣೆಗೆ ಸಿದ್ಧ', readyDesc: 'ಹೊಲ ಆಯ್ಕೆ ಮಾಡಿ ಅಥವಾ ಕಸ್ಟಮ್ ನಮೂದು ಮಾಡಿ, ನಂತರ AI ವಿಶ್ಲೇಷಣೆ ಚಲಾಯಿಸಿ ಕ್ಲಿಕ್ ಮಾಡಿ.',
    analysisFailed: 'ವಿಶ್ಲೇಷಣೆ ವಿಫಲ', tryAgain: 'ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ',
    irrigateNow: '💧 ಈಗ ನೀರಾವರಿ ಮಾಡಿ', holdIrrigation: '✋ ನೀರಾವರಿ ತಡೆಹಿಡಿಯಿರಿ', next: 'ಮುಂದೆ:',
    totalLitres: 'ಒಟ್ಟು ಲೀಟರ್ (ವಾರ)', duration: 'ಅವಧಿ (ನಿಮಿಷ)', netIrr: 'ನಿವ್ವಳ ನೀರಾವರಿ (mm/ವಾರ)',
    scientificMetrics: 'ವೈಜ್ಞಾನಿಕ ಮಾನದಂಡಗಳು (FAO-56)', irrigationSchedule: 'ನೀರಾವರಿ ವೇಳಾಪಟ್ಟಿ',
    aiAnalysis: 'AI ವಿಶ್ಲೇಷಣೆ', alertsTitle: 'ಎಚ್ಚರಿಕೆಗಳು', pestRiskTitle: '🐛 ಕೀಟ ಅಪಾಯ ವಿಶ್ಲೇಷಣೆ',
    riskScore: 'ಅಪಾಯ ಸ್ಕೋರ್', scoutEvery: 'ಪ್ರತಿ ಬಾರಿ ಗಮನಿಸಿ', basedOnWeather: 'ನೇರ ಹವಾಮಾನ ಆಧಾರಿತ:',
    humidity: 'ಆರ್ದ್ರತೆ', pythonActive: '🤖 Python ML API ಸಕ್ರಿಯ', fallbackMode: '📐 ಫಾಲ್‌ಬ್ಯಾಕ್ ಮೋಡ್ (ML ಸರ್ವರ್ ಆಫ್‌ಲೈನ್)',
    // Schedule
    scheduleTitle: '7 ದಿನದ ನೀರಾವರಿ ವೇಳಾಪಟ್ಟಿ', scheduleSub: 'ದೈನಿಕ ETc ಸಮತೋಲನ — FAO-56 ಪೆನ್ಮನ್-ಮಾಂಟಿತ್',
    selectFieldLabel: 'ಹೊಲ ಆಯ್ಕೆ ಮಾಡಿ', generatePlan: 'ಯೋಜನೆ ರಚಿಸಿ', generating: 'ರಚಿಸಲಾಗುತ್ತಿದೆ...',
    irrigationDays: 'ನೀರಾವರಿ ದಿನಗಳು', weeklySchedule: 'ವಾರದ ವೇಳಾಪಟ್ಟಿ', etcBased: 'ETc ಆಧಾರಿತ',
    date: 'ದಿನಾಂಕ', et0: 'ET₀ (mm)', etc: 'ETc (mm)', rain: 'ಮಳೆ (mm)', netIrrCol: 'ನಿವ್ವಳ ನೀರಾ (mm)',
    temp: 'ತಾಪ', action: 'ಕ್ರಿಯೆ', irrigate: 'ನೀರಾವರಿ', hold: 'ತಡೆ',
    methodology: 'ವಿಧಾನ:', generatePrompt: '7 ದಿನದ ನೀರಾವರಿ ಯೋಜನೆ ನೋಡಲು ಯೋಜನೆ ರಚಿಸಿ',
    // History
    historyTitle: 'ಇತಿಹಾಸ & ದಾಖಲೆಗಳು', historySub: 'ಹಿಂದಿನ AI ಶಿಫಾರಸುಗಳು ಮತ್ತು ನೀರಾವರಿ ದಾಖಲೆಗಳು',
    logIrrigation: 'ನೀರಾವರಿ ದಾಖಲಿಸಿ', aiRecs: 'AI ಶಿಫಾರಸುಗಳು', irrigationLogs: 'ನೀರಾವರಿ ದಾಖಲೆಗಳು',
    noRecsYet: 'ಇನ್ನೂ ಶಿಫಾರಸುಗಳಿಲ್ಲ — ಮೊದಲು AI ಸಲಹೆಗಾರ ಚಲಾಯಿಸಿ',
    noLogsYet: 'ಇನ್ನೂ ನೀರಾವರಿ ದಾಖಲೆಗಳಿಲ್ಲ — "ನೀರಾವರಿ ದಾಖಲಿಸಿ" ಕ್ಲಿಕ್ ಮಾಡಿ',
    dateCol: 'ದಿನಾಂಕ', fieldCol: 'ಹೊಲ', cropCol: 'ಬೆಳೆ', priorityCol: 'ಆದ್ಯತೆ',
    nextIrrCol: 'ಮುಂದಿನ ನೀರಾವರಿ', waterCol: 'ನೀರು (L)', efficiencyCol: 'ದಕ್ಷತೆ',
    dateTimeCol: 'ದಿನಾಂಕ & ಸಮಯ', durationCol: 'ಅವಧಿ (ನಿಮಿಷ)', notesCol: 'ಟಿಪ್ಪಣಿಗಳು',
    logIrrigationEvent: 'ನೀರಾವರಿ ಘಟನೆ ದಾಖಲಿಸಿ', fieldRequired: 'ಹೊಲ *', selectFieldOpt: 'ಹೊಲ ಆಯ್ಕೆ ಮಾಡಿ',
    durationMin: 'ಅವಧಿ (ನಿಮಿಷ)', waterUsed: 'ಬಳಸಿದ ನೀರು (ಲೀಟರ್)', notesOpt: 'ಟಿಪ್ಪಣಿಗಳು (ಐಚ್ಛಿಕ)',
    saveLog: 'ದಾಖಲೆ ಉಳಿಸಿ',
    // Settings
    settingsTitle: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು', settingsSub: 'ನಿಮ್ಮ ಫಾರ್ಮ್ ಪ್ರೊಫೈಲ್ ಮತ್ತು ಆದ್ಯತೆಗಳನ್ನು ನಿರ್ವಹಿಸಿ',
    farmProfile: 'ಫಾರ್ಮ್ ಪ್ರೊಫೈಲ್', fullName: 'ಪೂರ್ಣ ಹೆಸರು', farmName: 'ಫಾರ್ಮ್ ಹೆಸರು',
    locationCity: 'ಸ್ಥಳ / ನಗರ', locationHint: 'ನಿಮ್ಮ ಫಾರ್ಮ್‌ಗೆ ನೇರ ಹವಾಮಾನ ಪಡೆಯಲು ಬಳಸಲಾಗುತ್ತದೆ',
    email: 'ಇಮೇಲ್', saveChanges: 'ಬದಲಾವಣೆಗಳನ್ನು ಉಳಿಸಿ', saved: 'ಉಳಿಸಲಾಗಿದೆ!',
    mlModelInfo: '🤖 ML ಮಾದರಿ ಮಾಹಿತಿ',
    // Yield Price
    yieldPrice: 'ಇಳುವರಿ & ಮಾರುಕಟ್ಟೆ ಮೌಲ್ಯ', yieldPriceSub: 'ಬೆಳೆವಾರು ಇಳುವರಿ ಅಂದಾಜು · MSP/APMC 2024-25 ಬೆಲೆಗಳು · ದಕ್ಷತೆ ಆಧಾರಿತ',
    totalYieldTonnes: 'ಒಟ್ಟು ಅಂದಾಜು ಇಳುವರಿ', marketValueTotal: 'ಒಟ್ಟು ಮಾರುಕಟ್ಟೆ ಮೌಲ್ಯ', fieldsTracked: 'ಹೊಲಗಳ ಸಂಖ್ಯೆ',
    mspSource: 'MSP/APMC ದರ ಆಧಾರಿತ', tonnesUnit: 'ಟನ್', yieldEmptyDesc: 'ಇಳುವರಿ ಮತ್ತು ಮಾರುಕಟ್ಟೆ ಮೌಲ್ಯ ನೋಡಲು "ನನ್ನ ಹೊಲಗಳು"ನಲ್ಲಿ ಹೊಲ ಸೇರಿಸಿ.',
    priceSource: 'ಬೆಲೆ ಮೂಲ', yieldNote: 'FAO-56 ನೀರಾವರಿ ದಕ್ಷತೆಗೆ ಅನುಗುಣವಾಗಿ ಇಳುವರಿ ಲೆಕ್ಕ',
    quintalPrice: 'ಕ್ವಿಂಟಾಲ್ ಬೆಲೆ', totalQuintals: 'ಒಟ್ಟು ಕ್ವಿಂಟಾಲ್', totalRevenue: 'ಒಟ್ಟು ಆದಾಯ',
    marketValue: 'ಮಾರುಕಟ್ಟೆ ಮೌಲ್ಯ',
    // Soil Health Page
    soilHealthTitle: 'ಮಣ್ಣು ಆರೋಗ್ಯ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್', soilHealthSub: 'ಹೊಲವಾರು ಮಣ್ಣು ಆರೋಗ್ಯ ವಿಶ್ಲೇಷಣೆ · pH · NPK · ತೇವ · ಶಿಫಾರಸುಗಳು',
    avgSoilHealth: 'ಸರಾಸರಿ ಮಣ್ಣು ಆರೋಗ್ಯ', fieldMonitored: 'ಮೇಲ್ವಿಚಾರಣೆ ಹೊಲಗಳು', needsAttention: 'ಗಮನ ಅಗತ್ಯ',
    overallSoilHealth: 'ಒಟ್ಟಾರೆ ಮಣ್ಣು ಆರೋಗ್ಯ', recommendations: 'ಶಿಫಾರಸುಗಳು',
    soilEmptyDesc: 'ಮಣ್ಣು ಆರೋಗ್ಯ ವಿಶ್ಲೇಷಣೆ ನೋಡಲು "ನನ್ನ ಹೊಲಗಳು"ನಲ್ಲಿ ಹೊಲ ಸೇರಿಸಿ.',
    // Pest Monitor
    pestMonitorTitle: 'ಕೀಟ ಅಪಾಯ ಮಾನಿಟರ್', pestMonitorSub: 'ನೇರ ಹವಾಮಾನ ಆಧಾರಿತ ಕೀಟ ಅಪಾಯ · ಆರ್ದ್ರತೆ & ತಾಪ ಆಧಾರಿತ · ಹೊಲವಾರು ವಿಶ್ಲೇಷಣೆ',
    refresh: '⟳ ನವೀಕರಿಸಿ', refreshing: 'ನವೀಕರಿಸಲಾಗುತ್ತಿದೆ...', highRiskFields: 'ಹೆಚ್ಚು ಅಪಾಯದ ಹೊಲಗಳು',
    currentHumidity: 'ಪ್ರಸ್ತುತ ಆರ್ದ್ರತೆ', weatherPestNote: 'ಕೀಟ ಅಪಾಯ ನಿರ್ಧರಿಸುವ ಹವಾಮಾನ ಸ್ಥಿತಿಗಳು',
    scouting: 'ಗಮನಿಸುವ ಆವರ್ತನ', pestEmptyDesc: 'ಕೀಟ ಅಪಾಯ ಮೇಲ್ವಿಚಾರಣೆಗಾಗಿ "ನನ್ನ ಹೊಲಗಳು"ನಲ್ಲಿ ಹೊಲ ಸೇರಿಸಿ.',
    riskLevel: 'ಕೀಟ ಅಪಾಯ ಮಟ್ಟ',
  },
}

const I18nContext = createContext({ t: (k) => k, lang: 'en', setLang: () => {}, languages: LANGUAGES })

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState('en')

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('soilsage_lang') : null
    if (saved && T[saved]) setLangState(saved)
  }, [])

  function setLang(code) {
    setLangState(code)
    if (typeof window !== 'undefined') localStorage.setItem('soilsage_lang', code)
  }

  function t(key) { return T[lang]?.[key] || T.en[key] || key }

  return <I18nContext.Provider value={{ t, lang, setLang, languages: LANGUAGES }}>{children}</I18nContext.Provider>
}

export function useTranslation() { return useContext(I18nContext) }
