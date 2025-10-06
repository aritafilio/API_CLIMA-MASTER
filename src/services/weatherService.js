import axios from 'axios';

const API_KEY = '7b3b9c63037ddd97be0175dc1c71625e';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

const getWeatherData = async (endpoint, params) => {
  try {
    const response = await axios.get(`${BASE_URL}/${endpoint}`, {
      params: {
        ...params,
        appid: API_KEY,
        units: 'metric', 
        lang: 'es'     
      }
    });
    return { success: true, data: response.data };
  } catch (error) {
    if (error.response) {
      return { success: false, error: error.response.data.message || 'Error al obtener datos del clima' };
    } else if (error.request) {
      return { success: false, error: 'Sin conexión a internet. Verifica tu conexión.' };
    } else {
      return { success: false, error: 'Ocurrió un error inesperado.' };
    }
  }
};

export const getWeatherByCity = async (city) => {
  return getWeatherData('weather', { q: city });
};

export const getWeatherByCoords = async (lat, lon) => {
  return getWeatherData('weather', { lat, lon });
};

export const getForecast = async (city) => {
  return getWeatherData('forecast', { q: city });
};