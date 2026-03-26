export async function fetchWeather(latitude, longitude) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,rain,wind_speed_10m,weather_code,apparent_temperature&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,rain_sum,wind_speed_10m_max,et0_fao_evapotranspiration&timezone=auto&forecast_days=7`
    const res = await fetch(url)
    const data = await res.json()
    return {
      current: {
        temperature: data.current.temperature_2m,
        feelsLike: data.current.apparent_temperature,
        humidity: data.current.relative_humidity_2m,
        precipitation: data.current.precipitation,
        rain: data.current.rain,
        windSpeed: data.current.wind_speed_10m,
        weatherCode: data.current.weather_code,
        condition: getWeatherCondition(data.current.weather_code),
        icon: getWeatherIcon(data.current.weather_code),
      },
      daily: data.daily.time.map((date, i) => ({
        date,
        tempMax: data.daily.temperature_2m_max[i],
        tempMin: data.daily.temperature_2m_min[i],
        precipitationSum: data.daily.precipitation_sum[i],
        rainSum: data.daily.rain_sum[i],
        windSpeedMax: data.daily.wind_speed_10m_max[i],
        evapotranspiration: data.daily.et0_fao_evapotranspiration[i],
      })),
    }
  } catch {
    return getMockWeather()
  }
}

export async function geocodeCity(city) {
  try {
    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`)
    const data = await res.json()
    if (data.results?.[0]) return { latitude: data.results[0].latitude, longitude: data.results[0].longitude, name: data.results[0].name }
    return null
  } catch { return null }
}

function getWeatherCondition(code) {
  if (code === 0) return 'Clear Sky'
  if (code <= 3) return 'Partly Cloudy'
  if (code <= 49) return 'Foggy'
  if (code <= 67) return 'Rainy'
  if (code <= 77) return 'Snowy'
  if (code <= 82) return 'Rain Showers'
  if (code <= 99) return 'Thunderstorm'
  return 'Clear'
}

function getWeatherIcon(code) {
  if (code === 0) return '☀️'
  if (code <= 3) return '⛅'
  if (code <= 49) return '🌫️'
  if (code <= 67) return '🌧️'
  if (code <= 77) return '❄️'
  if (code <= 82) return '🌦️'
  if (code <= 99) return '⛈️'
  return '🌡️'
}

function getMockWeather() {
  return {
    current: { temperature: 28, feelsLike: 31, humidity: 65, precipitation: 0, rain: 0, windSpeed: 12, weatherCode: 0, condition: 'Clear Sky', icon: '☀️' },
    daily: Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() + i * 86400000).toISOString().split('T')[0],
      tempMax: 30 + Math.random() * 5, tempMin: 20 + Math.random() * 3,
      precipitationSum: Math.random() * 5, rainSum: Math.random() * 3,
      windSpeedMax: 10 + Math.random() * 10, evapotranspiration: 4 + Math.random() * 2,
    })),
  }
}
