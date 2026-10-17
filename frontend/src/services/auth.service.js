import api from './api';

export const registrar = (datos) => api.post('/auth/registro', datos).then((r) => r.data);
export const login = (correo, password) => api.post('/auth/login', { correo, password }).then((r) => r.data);
export const obtenerYo = () => api.get('/auth/yo').then((r) => r.data);