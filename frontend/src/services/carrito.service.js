import api from './api';

export const obtenerCarrito = () => api.get('/carrito').then((r) => r.data);
export const agregarItem = (idProducto, cantidad) =>
  api.post('/carrito/items', { idProducto, cantidad }).then((r) => r.data);
export const actualizarItem = (idProducto, cantidad) =>
  api.put(`/carrito/items/${idProducto}`, { cantidad }).then((r) => r.data);
export const eliminarItem = (idProducto) => api.delete(`/carrito/items/${idProducto}`).then((r) => r.data);
export const vaciarCarrito = () => api.delete('/carrito').then((r) => r.data);