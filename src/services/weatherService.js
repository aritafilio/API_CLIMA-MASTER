import axios from 'axios';

const API_KEY  = process.env.REACT_APP_OWM_KEY || '7b3b9c63037ddd97be0175dc1c71625e';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export const getWeatherByCity = async (city) => {
  try {
    const response = await axios.get(`${BASE_URL}/weather`, {
      params: { q: city, appid: API_KEY, units: 'metric', lang: 'es' }
    });
    return { success: true, data: response.data };
  } catch (error) {
    if (error.response) {
      return { success: false, error: error.response.data?.message || 'Error al obtener datos del clima' };
    } else if (error.request) {
      return { success: false, error: 'Sin conexión a internet. Verifica tu conexión.' };
    } else {
      return { success: false, error: 'Error inesperado al obtener datos del clima' };
    }
  }
};

export const getWeatherByCoords = async (lat, lon) => {
  try {
    const response = await axios.get(`${BASE_URL}/weather`, {
      params: { lat, lon, appid: API_KEY, units: 'metric', lang: 'es' }
    });
    return { success: true, data: response.data };
  } catch (error) {
    if (error.response) {
      return { success: false, error: error.response.data?.message || 'Error al obtener datos del clima' };
    } else if (error.request) {
      return { success: false, error: 'Sin conexión a internet. Verifica tu conexión.' };
    } else {
      return { success: false, error: 'Error inesperado al obtener datos del clima' };
    }
  }
};

export const getForecast = async (city) => {
  try {
    const response = await axios.get(`${BASE_URL}/forecast`, {
      params: { q: city, appid: API_KEY, units: 'metric', lang: 'es' }
    });
    return { success: true, data: response.data };
  } catch (error) {
    if (error.response) {
      return { success: false, error: error.response.data?.message || 'Error al obtener pronóstico del clima' };
    } else if (error.request) {
      return { success: false, error: 'Sin conexión a internet. Verifica tu conexión.' };
    } else {
      return { success: false, error: 'Error inesperado al obtener pronóstico del clima' };
    }
  }
};
