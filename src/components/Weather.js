import React, { useState, useEffect } from 'react';
import { getWeatherByCity, getWeatherByCoords } from '../services/weatherService';
import './Weather.css';

const Weather = ({ user }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [city, setCity] = useState('');
  const [searchCity, setSearchCity] = useState('');

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const result = await getWeatherByCoords(latitude, longitude);
          
          if (result.success) {
            setWeather(result.data);
            setCity(result.data.name);
            setError('');
          } else {
            setError(result.error);
          }
          setLoading(false);
        },
        (error) => {
          setError('No se pudo obtener tu ubicación. Busca una ciudad manualmente.');
          setLoading(false);
        }
      );
    } else {
      setError('Tu navegador no soporta geolocalización. Busca una ciudad manualmente.');
    }
  };

  const searchWeather = async (cityName) => {
    if (!cityName.trim()) return;
    
    setLoading(true);
    setError('');
    
    const result = await getWeatherByCity(cityName);
    
    if (result.success) {
      setWeather(result.data);
      setCity(result.data.name);
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchWeather(searchCity);
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getWeatherIcon = (iconCode) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="weather-container">
      <div className="weather-header">
        <h1>🌤️ Clima App</h1>
        <p>¡Hola {user?.email}! Aquí tienes la información del clima</p>
      </div>

      <div className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            placeholder="Buscar ciudad..."
            className="search-input"
          />
          <button type="submit" className="search-button">
            🔍 Buscar
          </button>
        </form>
        
        <button onClick={getCurrentLocation} className="location-button">
          📍 Mi Ubicación
        </button>
      </div>

      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Cargando datos del clima...</p>
        </div>
      )}

      {error && (
        <div className="error-message">
          <h3>❌ Error</h3>
          <p>{error}</p>
        </div>
      )}

      {weather && !loading && (
        <div className="weather-card">
          <div className="weather-main">
            <h2>{city}</h2>
            <p className="date">{formatDate(weather.dt)}</p>
            
            <div className="weather-info">
              <div className="weather-icon">
                <img 
                  src={getWeatherIcon(weather.weather[0].icon)} 
                  alt={weather.weather[0].description}
                />
                <p className="description">
                  {weather.weather[0].description.charAt(0).toUpperCase() + 
                   weather.weather[0].description.slice(1)}
                </p>
              </div>
              
              <div className="temperature">
                <span className="temp-main">{Math.round(weather.main.temp)}°C</span>
                <div className="temp-details">
                  <p>Máx: {Math.round(weather.main.temp_max)}°C</p>
                  <p>Mín: {Math.round(weather.main.temp_min)}°C</p>
                </div>
              </div>
            </div>
          </div>

          <div className="weather-details">
            <div className="detail-item">
              <span className="detail-label">💨 Viento</span>
              <span className="detail-value">
                {weather.wind?.speed != null ? `${weather.wind.speed} m/s` : "No disponible"}
              </span>
              <span className="detail-value">{weather.wind.speed} m/s</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">💧 Humedad</span>
              <span className="detail-value">{weather.main.humidity}%</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">🌡️ Sensación</span>
              <span className="detail-value">{Math.round(weather.main.feels_like)}°C</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">🔽 Presión</span>
              <span className="detail-value">{weather.main.pressure} hPa</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Weather;
