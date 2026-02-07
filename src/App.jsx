import { useState, useEffect } from 'react'
import './App.css'

const WEATHER_ICONS = {
  clear: '☀️',
  partlyCloudy: '⛅',
  cloudy: '☁️',
  rain: '🌧️',
  snow: '❄️',
  storm: '⛈️',
  fog: '🌫️',
}

const getWeatherIcon = (condition) => {
  const lower = condition.toLowerCase()
  if (lower.includes('clear') || lower.includes('sunny')) return WEATHER_ICONS.clear
  if (lower.includes('partly')) return WEATHER_ICONS.partlyCloudy
  if (lower.includes('cloudy')) return WEATHER_ICONS.cloudy
  if (lower.includes('rain') || lower.includes('drizzle')) return WEATHER_ICONS.rain
  if (lower.includes('snow') || lower.includes('blizzard')) return WEATHER_ICONS.snow
  if (lower.includes('storm') || lower.includes('thunder')) return WEATHER_ICONS.storm
  if (lower.includes('fog') || lower.includes('haze')) return WEATHER_ICONS.fog
  return WEATHER_ICONS.cloudy
}

function App() {
  const [city, setCity] = useState('')
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [darkMode, setDarkMode] = useState(false)
  const [currentTime, setCurrentTime] = useState('')
  const [currentDate, setCurrentDate] = useState('')

  // Update local time for the selected city
  useEffect(() => {
    if (weather) {
      // Get timezone from the weather data response
      const timezone = weather.timezone || 'UTC'
      const now = new Date()

      // Format time and date for the city
      const timeOptions = {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }
      const dateOptions = {
        timeZone: timezone,
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }

      try {
        setCurrentTime(new Intl.DateTimeFormat('en-US', timeOptions).format(now))
        setCurrentDate(new Intl.DateTimeFormat('en-US', dateOptions).format(now))
      } catch {
        // Fallback if timezone is invalid
        setCurrentTime(now.toLocaleTimeString())
        setCurrentDate(now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))
      }
    }
  }, [weather])

  const fetchWeather = async (e) => {
    e.preventDefault()
    if (!city.trim()) return

    setLoading(true)
    setError('')
    setWeather(null)

    try {
      // Geocoding API to get coordinates
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
      )
      const geoData = await geoResponse.json()

      if (!geoData.results || geoData.results.length === 0) {
        throw new Error('City not found')
      }

      const { latitude, longitude, name, country, timezone } = geoData.results[0]

      // Weather API
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode&timezone=${timezone || 'auto'}`
      )
      const weatherData = await weatherResponse.json()

      setWeather({
        city: name,
        country,
        timezone,
        current: weatherData.current_weather,
        daily: weatherData.daily,
        temperature: weatherData.current_weather.temperature,
        condition: getWeatherCondition(weatherData.current_weather.weathercode),
      })
    } catch (err) {
      setError(err.message || 'Failed to fetch weather data')
    } finally {
      setLoading(false)
    }
  }

  const getWeatherCondition = (code) => {
    const conditions = {
      0: 'Clear sky',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Foggy',
      48: 'Depositing rime fog',
      51: 'Light drizzle',
      53: 'Moderate drizzle',
      55: 'Dense drizzle',
      61: 'Slight rain',
      63: 'Moderate rain',
      65: 'Heavy rain',
      71: 'Slight snow',
      73: 'Moderate snow',
      75: 'Heavy snow',
      80: 'Slight rain showers',
      81: 'Moderate rain showers',
      82: 'Violent rain showers',
      95: 'Thunderstorm',
      96: 'Thunderstorm with hail',
      99: 'Thunderstorm with heavy hail',
    }
    return conditions[code] || 'Unknown'
  }

  const getBackgroundClass = () => {
    if (!weather) return 'bg-gradient-default'
    const condition = weather.condition.toLowerCase()
    if (condition.includes('clear') || condition.includes('sunny')) return 'bg-gradient-sunny'
    if (condition.includes('cloudy')) return 'bg-gradient-cloudy'
    if (condition.includes('rain') || condition.includes('drizzle')) return 'bg-gradient-rainy'
    if (condition.includes('snow')) return 'bg-gradient-snowy'
    if (condition.includes('storm') || condition.includes('thunder')) return 'bg-gradient-stormy'
    return 'bg-gradient-default'
  }

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  return (
    <div className={`app-container ${getBackgroundClass()} ${darkMode ? 'dark-mode' : ''}`}>
      <div className="app-content">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="dark-mode-toggle"
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? (
            <span>☀️</span>
          ) : (
            <span>🌙</span>
          )}
        </button>

        <header>
          <h1>Weather App</h1>
          <p>Check the weather anywhere in the world</p>
        </header>

        <form onSubmit={fetchWeather} className="search-form">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter city name..."
            className="search-input"
            disabled={loading}
          />
          <button type="submit" className="search-button" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {error && <div className="error-message">{error}</div>}

        {weather && (
          <div className="weather-card">
            <div className="weather-header">
              <div>
                <h2>{weather.city}</h2>
                <p>{weather.country}</p>
                {currentTime && (
                  <div className="local-time">
                    <span className="time">{currentTime}</span>
                    <span className="date">{currentDate}</span>
                  </div>
                )}
              </div>
              <div className="weather-icon">
                <span className="icon">{getWeatherIcon(weather.condition)}</span>
                <span className="condition">{weather.condition}</span>
              </div>
            </div>

            <div className="current-weather">
              <div className="temperature">
                {Math.round(weather.temperature)}°C
              </div>
              <div className="details">
                <div className="detail-item">
                  <span className="label">Wind</span>
                  <span className="value">{weather.current.windspeed} km/h</span>
                </div>
                <div className="detail-item">
                  <span className="label">Humidity</span>
                  <span className="value">-</span>
                </div>
                <div className="detail-item">
                  <span className="label">Pressure</span>
                  <span className="value">-</span>
                </div>
              </div>
            </div>

            <div className="forecast">
              <h3>5-Day Forecast</h3>
              <div className="forecast-grid">
                {weather.daily.temperature_2m_max.map((_, index) => {
                  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
                  const date = new Date(weather.daily.time[index])
                  const dayName = dayNames[date.getDay()]
                  const maxTemp = Math.round(weather.daily.temperature_2m_max[index])
                  const minTemp = Math.round(weather.daily.temperature_2m_min[index])
                  const precipProb = weather.daily.precipitation_probability_max[index]
                  const weatherCode = weather.daily.weathercode[index]
                  const dayCondition = getWeatherCondition(weatherCode)

                  return (
                    <div key={index} className="forecast-day">
                      <span className="day">{dayName}</span>
                      <span className="icon">{getWeatherIcon(dayCondition)}</span>
                      <div className="temps">
                        <span className="max">{maxTemp}°</span>
                        <span className="min">{minTemp}°</span>
                      </div>
                      <span className="precip">{precipProb}%</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {!weather && !loading && (
          <div className="placeholder">
            <div className="placeholder-icon">🌍</div>
            <p>Search for a city to see the weather</p>
          </div>
        )}
      </div>

      <footer>
        Weather data by Open-Meteo
      </footer>
    </div>
  )
}

export default App
