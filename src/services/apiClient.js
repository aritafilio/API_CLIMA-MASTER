import axios from 'axios';

const api = axios.create({
baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
timeout: 15000
});
// Si guardas el accessToken en memoria o sessionStorage, añade aquí el Authorization
api.interceptors.request.use((config) => {
try {
const token = sessionStorage.getItem('accessToken'); // o de tu AuthContext
if (token) config.headers.Authorization = `Bearer ${token}`;
} catch {}
return config;
});

export default api;