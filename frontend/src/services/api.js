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

// En tu PC: '/api' (el puente de Vite lo pasa al backend).
// En internet: la dirección real del backend, desde la variable VITE_API_URL.
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

api.interceptors.request.use((config) => {
  const token = leerToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Qué hacer cuando la sesión deja de ser válida (lo define AuthProvider)
let alSesionInvalida = null;
export function registrarSesionInvalida(fn) {
  alSesionInvalida = fn;
}

// Vigilante: revisa cada respuesta del backend
api.interceptors.response.use(
  (respuesta) => respuesta,
  (err) => {
    const conToken = Boolean(err.config?.headers?.Authorization);
    const esRevisionInicial = err.config?.url === '/auth/yo';
    // 401 con token = el token venció o la cuenta se desactivó
    if (err.response?.status === 401 && conToken && !esRevisionInicial && alSesionInvalida) {
      alSesionInvalida(mensajeError(err, 'Tu sesión expiró. Inicia sesión de nuevo.'));
    }
    return Promise.reject(err);
  }
);

export default api;