// Auth con modo MOCK (sin backend) o REAL (JWT con API)
import axios from 'axios';

// --- ENV ---
// Vite: usa VITE_API_BASE y VITE_AUTH_MODE en .env
const API_BASE  = import.meta?.env?.VITE_API_BASE  ?? process.env.REACT_APP_API_BASE  ?? 'http://localhost:3001';
const AUTH_MODE = import.meta?.env?.VITE_AUTH_MODE ?? process.env.REACT_APP_AUTH_MODE ?? 'mock'; // 'mock' | 'real'

const TOKEN_KEY = 'app.token';
const USER_KEY  = 'app.user';

// --- Helpers de sesión ---
function _saveSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}
export function getToken() { return localStorage.getItem(TOKEN_KEY); }
export function getUser()  {
  const u = localStorage.getItem(USER_KEY);
  return u ? JSON.parse(u) : null;
}

// --- Observadores de estado (emula onAuthStateChanged) ---
const listeners = new Set();
export function onAuthStateChange(callback) {
  listeners.add(callback);
  callback(getUser()); // dispara con el estado actual
  return () => listeners.delete(callback);
}
function _notify() {
  const user = getUser();
  listeners.forEach(cb => cb(user));
}

// --- DEMO (solo para MOCK) ---
const DEMO = { email: 'hola@gmail.com', password: '123456', id: 1, name: 'Usuario Demo' };

// --- Acciones de Auth ---
export async function registerUser(email, password) {
  if (AUTH_MODE === 'mock') {
    const user = { id: Date.now(), email, name: email.split('@')[0] };
    _saveSession('fake-token', user);
    _notify();
    return { success: true, user };
  }

  // REAL: usa tu API
  try {
    await axios.post(`${API_BASE}/register`, { email, password });   // ← backticks
    const { data } = await axios.post(`${API_BASE}/login`, { email, password }); // ← backticks
    if (data?.token) {
      _saveSession(data.token, data.user);
      _notify();
      return { success: true, user: data.user };
    }
    return { success: false, error: 'No se recibió token' };
  } catch (error) {
    return { success: false, error: error?.response?.data?.error || 'Error al registrar' };
  }
}

export async function loginUser(email, password) {
  if (AUTH_MODE === 'mock') {
    if (email === DEMO.email && password === DEMO.password) {
      const user = { id: DEMO.id, email: DEMO.email, name: DEMO.name };
      _saveSession('fake-token', user);
      _notify();
      return { success: true, user };
    }
    return { success: false, error: 'Credenciales inválidas (usa hola@gmail.com / 123456)' };
  }

  // REAL: usa tu API
  try {
    const { data } = await axios.post(`${API_BASE}/login`, { email, password }); // ← backticks
    if (data?.token) {
      _saveSession(data.token, data.user);
      _notify();
      return { success: true, user: data.user };
    }
    return { success: false, error: 'No se recibió token' };
  } catch (error) {
    return { success: false, error: error?.response?.data?.error || 'Error de login' };
  }
}

export async function logoutUser() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    _notify();
    return { success: true };
  } catch {
    return { success: false, error: 'No se pudo cerrar sesión' };
  }
}
