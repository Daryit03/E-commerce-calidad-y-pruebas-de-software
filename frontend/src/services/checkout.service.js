import api from './api';

export const obtenerOpciones = () => api.get('/checkout/opciones').then((r) => r.data);
export const confirmarCompra = (datos) => api.post('/checkout', datos).then((r) => r.data);