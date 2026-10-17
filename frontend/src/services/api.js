import axios from 'axios';

const CLAVE_TOKEN = 'token';

export function leerToken() {
  try { return localStorage.getItem(CLAVE_TOKEN); } catch { return null; }
}

export function guardarToken(token) {
  try {
    if (token) localStorage.setItem(CLAVE_TOKEN, token);
    else localStorage.removeItem(CLAVE_TOKEN);
  } catch { /* navegador sin almacenamiento */ }
}

// Saca el mensaje de error que envía el backend
export const mensajeError = (err, porDefecto = 'Ocurrió un error') =>
  err.response?.data?.error || porDefecto;

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = leerToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;