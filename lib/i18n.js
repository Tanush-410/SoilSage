'use client'
import { useState, useEffect, createContext, useContext } from 'react'

const LANGUAGES = {
  en: { name: 'English', flag: '🇬🇧' },
  hi: { name: 'हिंदी', flag: '🇮🇳' },
  mr: { name: 'मराठी', flag: '🇮🇳' },
  pa: { name: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  ta: { name: 'தமிழ்', flag: '🇮🇳' },
  te: { name: 'తెలుగు', flag: '🇮🇳' },
  kn: { name: 'ಕನ್ನಡ', flag: '🇮🇳' },
}

const TRANSLATIONS = {
  en: {
    dashboard: 'Dashboard', myFields: 'My Fields', yieldPrice: 'Yield & Price',
    pestControl: 'Pest Control', soilHealth: 'Soil Health', aiAdvisor: 'AI Advisor',
    schedule: 'Schedule', history: 'History', settings: 'Settings', signOut: 'Sign Out',
    addField: 'Add Field', editField: 'Edit Field', deleteField: 'Delete',
    runAnalysis: 'Run AI Analysis', generatePlan: 'Generate Plan',
    totalFields: 'Total Fields', waterSaved: 'Water Saved', efficiency: 'Efficiency', activeAlerts: 'Active Alerts',
    liveWeather: 'Live Weather', soilMoistureTrend: 'Soil Moisture Trend (7-Day)',
    recentRecs: 'Recent AI Recommendations', myFieldsCard: 'My Fields',
    irrigateNow: 'Irrigate Now', holdIrrigation: 'Hold Irrigation',
    runningModels: 'Running ML Models...', readyForAnalysis: 'Ready for Analysis',
    analysisFailed: 'Analysis Failed', tryAgain: 'Try Again',
    pestRisk: 'Pest Risk', soilAnalysis: 'Soil Analysis', weatherImpact: 'Weather Impact',
    cropAdvice: 'Crop Advice', fertigation: 'Fertigation', irrigationMethod: 'Method',
    alerts: 'Alerts', irrigationSchedule: 'Irrigation Schedule',
    yieldEstimate: 'Yield Estimate', marketValue: 'Market Value',
    soilHealthScore: 'Soil Health', language: 'Language',
    welcomeBack: 'Welcome back',
  },
  hi: {
    dashboard: 'डैशबोर्ड', myFields: 'मेरे खेत', yieldPrice: 'उपज & मूल्य',
    pestControl: 'कीट नियंत्रण', soilHealth: 'मिट्टी स्वास्थ्य', aiAdvisor: 'AI सलाहकार',
    schedule: 'कार्यक्रम', history: 'इतिहास', settings: 'सेटिंग्स', signOut: 'साइन आउट',
    addField: 'खेत जोड़ें', editField: 'खेत संपादित करें', deleteField: 'हटाएं',
    runAnalysis: 'AI विश्लेषण चलाएं', generatePlan: 'योजना बनाएं',
    totalFields: 'कुल खेत', waterSaved: 'पानी बचत', efficiency: 'दक्षता', activeAlerts: 'सक्रिय अलर्ट',
    liveWeather: 'लाइव मौसम', soilMoistureTrend: 'मिट्टी नमी ट्रेंड (7 दिन)',
    recentRecs: 'हालिया AI सिफ़ारिशें', myFieldsCard: 'मेरे खेत',
    irrigateNow: 'अभी सिंचाई करें', holdIrrigation: 'सिंचाई रोकें',
    runningModels: 'ML मॉडल चल रहा है...', readyForAnalysis: 'विश्लेषण के लिए तैयार',
    analysisFailed: 'विश्लेषण विफल', tryAgain: 'पुनः प्रयास',
    pestRisk: 'कीट जोखिम', soilAnalysis: 'मिट्टी विश्लेषण', weatherImpact: 'मौसम प्रभाव',
    cropAdvice: 'फसल सलाह', fertigation: 'उर्वरक सिंचाई', irrigationMethod: 'विधि',
    alerts: 'अलर्ट', irrigationSchedule: 'सिंचाई कार्यक्रम',
    yieldEstimate: 'उपज अनुमान', marketValue: 'बाजार मूल्य',
    soilHealthScore: 'मिट्टी स्वास्थ्य', language: 'भाषा',
    welcomeBack: 'वापसी पर स्वागत',
  },
  mr: {
    dashboard: 'डॅशबोर्ड', myFields: 'माझी शेतं', yieldPrice: 'उत्पन्न & किंमत',
    pestControl: 'कीड नियंत्रण', soilHealth: 'मातीचे आरोग्य', aiAdvisor: 'AI सल्लागार',
    schedule: 'वेळापत्रक', history: 'इतिहास', settings: 'सेटिंग्ज', signOut: 'साइन आउट',
    addField: 'शेत जोडा', editField: 'शेत संपादित करा', deleteField: 'हटवा',
    runAnalysis: 'AI विश्लेषण चालवा', generatePlan: 'योजना तयार करा',
    totalFields: 'एकूण शेतं', waterSaved: 'पाणी बचत', efficiency: 'कार्यक्षमता', activeAlerts: 'सक्रिय इशारे',
    liveWeather: 'थेट हवामान', soilMoistureTrend: 'माती ओलावा ट्रेंड (७ दिवस)',
    recentRecs: 'अलीकडील AI शिफारसी', myFieldsCard: 'माझी शेतं',
    irrigateNow: 'आत्ता सिंचन करा', holdIrrigation: 'सिंचन थांबवा',
    runningModels: 'ML मॉडेल चालू आहे...', readyForAnalysis: 'विश्लेषणासाठी तयार',
    analysisFailed: 'विश्लेषण अयशस्वी', tryAgain: 'पुन्हा प्रयत्न करा',
    pestRisk: 'कीड धोका', soilAnalysis: 'माती विश्लेषण', weatherImpact: 'हवामान परिणाम',
    cropAdvice: 'पिक सल्ला', fertigation: 'खत सिंचन', irrigationMethod: 'पद्धत',
    alerts: 'इशारे', irrigationSchedule: 'सिंचन वेळापत्रक',
    yieldEstimate: 'उत्पन्न अंदाज', marketValue: 'बाजार मूल्य',
    soilHealthScore: 'माती आरोग्य', language: 'भाषा',
    welcomeBack: 'परत स्वागत',
  },
  pa: {
    dashboard: 'ਡੈਸ਼ਬੋਰਡ', myFields: 'ਮੇਰੇ ਖੇਤ', yieldPrice: 'ਝਾੜ & ਕੀਮਤ',
    pestControl: 'ਕੀਟ ਨਿਯੰਤਰਣ', soilHealth: 'ਮਿੱਟੀ ਸਿਹਤ', aiAdvisor: 'AI ਸਲਾਹਕਾਰ',
    schedule: 'ਸਮਾਂ-ਸਾਰਣੀ', history: 'ਇਤਿਹਾਸ', settings: 'ਸੈਟਿੰਗਾਂ', signOut: 'ਸਾਈਨ ਆਊਟ',
    addField: 'ਖੇਤ ਜੋੜੋ', editField: 'ਖੇਤ ਸੋਧੋ', deleteField: 'ਮਿਟਾਓ',
    runAnalysis: 'AI ਵਿਸ਼ਲੇਸ਼ਣ ਚਲਾਓ', generatePlan: 'ਯੋਜਨਾ ਬਣਾਓ',
    totalFields: 'ਕੁਲ ਖੇਤ', waterSaved: 'ਪਾਣੀ ਬਚਾਇਆ', efficiency: 'ਕੁਸ਼ਲਤਾ', activeAlerts: 'ਸਰਗਰਮ ਚੇਤਾਵਨੀਆਂ',
    liveWeather: 'ਲਾਈਵ ਮੌਸਮ', soilMoistureTrend: 'ਮਿੱਟੀ ਨਮੀ ਰੁਝਾਨ (7 ਦਿਨ)',
    recentRecs: 'ਹਾਲੀਆ AI ਸਿਫ਼ਾਰਸ਼ਾਂ', myFieldsCard: 'ਮੇਰੇ ਖੇਤ',
    irrigateNow: 'ਹੁਣੇ ਸਿੰਚਾਈ ਕਰੋ', holdIrrigation: 'ਸਿੰਚਾਈ ਰੋਕੋ',
    runningModels: 'ML ਮਾਡਲ ਚੱਲ ਰਿਹਾ ਹੈ...', readyForAnalysis: 'ਵਿਸ਼ਲੇਸ਼ਣ ਲਈ ਤਿਆਰ',
    analysisFailed: 'ਵਿਸ਼ਲੇਸ਼ਣ ਅਸਫਲ', tryAgain: 'ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ',
    pestRisk: 'ਕੀਟ ਜੋਖਮ', soilAnalysis: 'ਮਿੱਟੀ ਵਿਸ਼ਲੇਸ਼ਣ', weatherImpact: 'ਮੌਸਮ ਪ੍ਰਭਾਵ',
    cropAdvice: 'ਫਸਲ ਸਲਾਹ', fertigation: 'ਖਾਦ ਸਿੰਚਾਈ', irrigationMethod: 'ਤਰੀਕਾ',
    alerts: 'ਚੇਤਾਵਨੀਆਂ', irrigationSchedule: 'ਸਿੰਚਾਈ ਸਮਾਂ-ਸਾਰਣੀ',
    yieldEstimate: 'ਝਾੜ ਅਨੁਮਾਨ', marketValue: 'ਬਾਜ਼ਾਰ ਮੁੱਲ',
    soilHealthScore: 'ਮਿੱਟੀ ਸਿਹਤ', language: 'ਭਾਸ਼ਾ',
    welcomeBack: 'ਵਾਪਸੀ ਤੇ ਜੀ ਆਇਆਂ',
  },
  ta: {
    dashboard: 'டாஷ்போர்டு', myFields: 'என் வயல்கள்', yieldPrice: 'விளைச்சல் & விலை',
    pestControl: 'பூச்சி கட்டுப்பாடு', soilHealth: 'மண் ஆரோக்கியம்', aiAdvisor: 'AI ஆலோசகர்',
    schedule: 'அட்டவணை', history: 'வரலாறு', settings: 'அமைப்புகள்', signOut: 'வெளியேறு',
    addField: 'வயல் சேர்', editField: 'வயல் திருத்து', deleteField: 'நீக்கு',
    runAnalysis: 'AI பகுப்பாய்வு இயக்கு', generatePlan: 'திட்டம் உருவாக்கு',
    totalFields: 'மொத்த வயல்கள்', waterSaved: 'சேமித்த நீர்', efficiency: 'திறன்', activeAlerts: 'செயலில் எச்சரிக்கைகள்',
    liveWeather: 'நேரடி வானிலை', soilMoistureTrend: 'மண் ஈரப்பதம் போக்கு (7 நாட்கள்)',
    recentRecs: 'சமீபத்திய AI பரிந்துரைகள்', myFieldsCard: 'என் வயல்கள்',
    irrigateNow: 'இப்போது நீர்ப்பாசனம்', holdIrrigation: 'நீர்ப்பாசனம் நிறுத்து',
    runningModels: 'ML மாதிரி இயங்குகிறது...', readyForAnalysis: 'பகுப்பாய்விற்கு தயார்',
    analysisFailed: 'பகுப்பாய்வு தோல்வி', tryAgain: 'மீண்டும் முயற்சி',
    pestRisk: 'பூச்சி ஆபத்து', soilAnalysis: 'மண் பகுப்பாய்வு', weatherImpact: 'வானிலை தாக்கம்',
    cropAdvice: 'பயிர் ஆலோசனை', fertigation: 'உரப் பாசனம்', irrigationMethod: 'முறை',
    alerts: 'எச்சரிக்கைகள்', irrigationSchedule: 'நீர்ப்பாசன அட்டவணை',
    yieldEstimate: 'விளைச்சல் மதிப்பீடு', marketValue: 'சந்தை மதிப்பு',
    soilHealthScore: 'மண் ஆரோக்கியம்', language: 'மொழி',
    welcomeBack: 'மீண்டும் வரவேற்கிறோம்',
  },
  te: {
    dashboard: 'డ్యాష్‌బోర్డ్', myFields: 'నా పొలాలు', yieldPrice: 'దిగుబడి & ధర',
    pestControl: 'చీడ నియంత్రణ', soilHealth: 'నేల ఆరోగ్యం', aiAdvisor: 'AI సలహాదారు',
    schedule: 'షెడ్యూల్', history: 'చరిత్ర', settings: 'సెట్టింగులు', signOut: 'సైన్ అవుట్',
    addField: 'పొలం జోడించు', editField: 'పొలం సవరించు', deleteField: 'తొలగించు',
    runAnalysis: 'AI విశ్లేషణ నడుపు', generatePlan: 'ప్రణాళిక తయారుచేయి',
    totalFields: 'మొత్తం పొలాలు', waterSaved: 'నీరు ఆదా', efficiency: 'సామర్థ్యం', activeAlerts: 'చురుకైన హెచ్చరికలు',
    liveWeather: 'లైవ్ వాతావరణం', soilMoistureTrend: 'నేల తేమ ట్రెండ్ (7 రోజులు)',
    recentRecs: 'ఇటీవలి AI సిఫారసులు', myFieldsCard: 'నా పొలాలు',
    irrigateNow: 'ఇప్పుడు నీటిపారుదల', holdIrrigation: 'నీటిపారుదల ఆపు',
    runningModels: 'ML మోడల్ నడుస్తోంది...', readyForAnalysis: 'విశ్లేషణకు సిద్ధం',
    analysisFailed: 'విశ్లేషణ విఫలమైంది', tryAgain: 'మళ్ళీ ప్రయత్నించు',
    pestRisk: 'చీడ ప్రమాదం', soilAnalysis: 'నేల విశ్లేషణ', weatherImpact: 'వాతావరణ ప్రభావం',
    cropAdvice: 'పంట సలహా', fertigation: 'ఎరువు నీటిపారుదల', irrigationMethod: 'పద్ధతి',
    alerts: 'హెచ్చరికలు', irrigationSchedule: 'నీటిపారుదల షెడ్యూల్',
    yieldEstimate: 'దిగుబడి అంచనా', marketValue: 'మార్కెట్ విలువ',
    soilHealthScore: 'నేల ఆరోగ్యం', language: 'భాష',
    welcomeBack: 'తిరిగి స్వాగతం',
  },
  kn: {
    dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್', myFields: 'ನನ್ನ ಹೊಲಗಳು', yieldPrice: 'ಇಳುವರಿ & ಬೆಲೆ',
    pestControl: 'ಕೀಟ ನಿಯಂತ್ರಣ', soilHealth: 'ಮಣ್ಣಿನ ಆರೋಗ್ಯ', aiAdvisor: 'AI ಸಲಹೆಗಾರ',
    schedule: 'ವೇಳಾಪಟ್ಟಿ', history: 'ಇತಿಹಾಸ', settings: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು', signOut: 'ಸೈನ್ ಔಟ್',
    addField: 'ಹೊಲ ಸೇರಿಸಿ', editField: 'ಹೊಲ ಸಂಪಾದಿಸಿ', deleteField: 'ಅಳಿಸಿ',
    runAnalysis: 'AI ವಿಶ್ಲೇಷಣೆ ಚಲಾಯಿಸಿ', generatePlan: 'ಯೋಜನೆ ರಚಿಸಿ',
    totalFields: 'ಒಟ್ಟು ಹೊಲಗಳು', waterSaved: 'ನೀರು ಉಳಿತಾಯ', efficiency: 'ದಕ್ಷತೆ', activeAlerts: 'ಸಕ್ರಿಯ ಎಚ್ಚರಿಕೆಗಳು',
    liveWeather: 'ನೇರ ಹವಾಮಾನ', soilMoistureTrend: 'ಮಣ್ಣಿನ ತೇವ ಟ್ರೆಂಡ್ (7 ದಿನ)',
    recentRecs: 'ಇತ್ತೀಚಿನ AI ಶಿಫಾರಸುಗಳು', myFieldsCard: 'ನನ್ನ ಹೊಲಗಳು',
    irrigateNow: 'ಈಗ ನೀರಾವರಿ ಮಾಡಿ', holdIrrigation: 'ನೀರಾವರಿ ತಡೆಹಿಡಿಯಿರಿ',
    runningModels: 'ML ಮಾದರಿ ಚಲಿಸುತ್ತಿದೆ...', readyForAnalysis: 'ವಿಶ್ಲೇಷಣೆಗೆ ಸಿದ್ಧ',
    analysisFailed: 'ವಿಶ್ಲೇಷಣೆ ವಿಫಲವಾಗಿದೆ', tryAgain: 'ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ',
    pestRisk: 'ಕೀಟ ಅಪಾಯ', soilAnalysis: 'ಮಣ್ಣು ವಿಶ್ಲೇಷಣೆ', weatherImpact: 'ಹವಾಮಾನ ಪ್ರಭಾವ',
    cropAdvice: 'ಬೆಳೆ ಸಲಹೆ', fertigation: 'ರಸಗೊಬ್ಬರ ನೀರಾವರಿ', irrigationMethod: 'ವಿಧಾನ',
    alerts: 'ಎಚ್ಚರಿಕೆಗಳು', irrigationSchedule: 'ನೀರಾವರಿ ವೇಳಾಪಟ್ಟಿ',
    yieldEstimate: 'ಇಳುವರಿ ಅಂದಾಜು', marketValue: 'ಮಾರುಕಟ್ಟೆ ಮೌಲ್ಯ',
    soilHealthScore: 'ಮಣ್ಣಿನ ಆರೋಗ್ಯ', language: 'ಭಾಷೆ',
    welcomeBack: 'ಮತ್ತೆ ಸ್ವಾಗತ',
  },
}

const I18nContext = createContext({ t: (k) => k, lang: 'en', setLang: () => {} })

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState('en')

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('soilsage_lang') : null
    if (saved && TRANSLATIONS[saved]) setLangState(saved)
  }, [])

  function setLang(code) {
    setLangState(code)
    if (typeof window !== 'undefined') localStorage.setItem('soilsage_lang', code)
  }

  function t(key) {
    return TRANSLATIONS[lang]?.[key] || TRANSLATIONS.en[key] || key
  }

  return <I18nContext.Provider value={{ t, lang, setLang, languages: LANGUAGES }}>{children}</I18nContext.Provider>
}

export function useTranslation() {
  return useContext(I18nContext)
}
