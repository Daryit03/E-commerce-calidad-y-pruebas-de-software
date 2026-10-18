import api from './api';

export const obtenerMisPedidos = () => api.get('/pedidos').then((r) => r.data);
export const obtenerPedido = (id) => api.get(`/pedidos/${id}`).then((r) => r.data);