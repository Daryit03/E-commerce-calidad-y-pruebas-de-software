import api from './api';

export const registrar = (datos) => api.post('/auth/registro', datos).then((r) => r.data);
export const login = (correo, password) => api.post('/auth/login', { correo, password }).then((r) => r.data);
export const obtenerYo = () => api.get('/auth/yo').then((r) => r.data);
export const actualizarPerfil = (datos) => api.put('/auth/perfil', datos).then((r) => r.data);
export const cambiarPassword = (datos) => api.put('/auth/password', datos).then((r) => r.data);
export const solicitarRecuperacion = (correo) => api.post('/auth/recuperar', { correo }).then((r) => r.data);
export const restablecerPassword = (datos) => api.post('/auth/restablecer', datos).then((r) => r.data);