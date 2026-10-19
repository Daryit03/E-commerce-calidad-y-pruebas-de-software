import api from './api';

const RUTA = { categoria: 'categorias', subcategoria: 'subcategorias', marca: 'marcas' };

export const listarCategoriasAdmin = () => api.get('/admin/categorias').then((r) => r.data);
export const listarMarcasAdmin = () => api.get('/admin/marcas').then((r) => r.data);
export const crearClasificacion = (tipo, datos) => api.post(`/admin/${RUTA[tipo]}`, datos).then((r) => r.data);
export const editarClasificacion = (tipo, id, datos) =>
  api.put(`/admin/${RUTA[tipo]}/${id}`, datos).then((r) => r.data);
export const cambiarEstadoClasificacion = (tipo, id, estado) =>
  api.patch(`/admin/${RUTA[tipo]}/${id}/estado`, { estado }).then((r) => r.data);

// ===== Productos (HO12 / HO13) =====
export const listarProductosAdmin = (params) => api.get('/admin/productos', { params }).then((r) => r.data);
export const obtenerProductoAdmin = (id) => api.get(`/admin/productos/${id}`).then((r) => r.data);
export const crearProducto = (datos) => api.post('/admin/productos', datos).then((r) => r.data);
export const actualizarProducto = (id, datos) => api.put(`/admin/productos/${id}`, datos).then((r) => r.data);
export const cambiarEstadoProducto = (id, estado) =>
  api.patch(`/admin/productos/${id}/estado`, { estado }).then((r) => r.data);
export const cambiarDestacadoProducto = (id, destacado) =>
  api.patch(`/admin/productos/${id}/destacado`, { destacado }).then((r) => r.data);
export const eliminarProducto = (id) => api.delete(`/admin/productos/${id}`).then((r) => r.data);

// Envía los archivos como formulario (multipart) al backend
export const subirImagenes = (archivos) => {
  const formulario = new FormData();
  archivos.forEach((a) => formulario.append('imagenes', a));
  return api.post('/admin/imagenes', formulario).then((r) => r.data);
};

// ===== Pedidos (HO14) =====
export const listarPedidosAdmin = (params) => api.get('/admin/pedidos', { params }).then((r) => r.data);
export const obtenerPedidoAdmin = (id) => api.get(`/admin/pedidos/${id}`).then((r) => r.data);
export const cambiarEstadoPedido = (id, estado, observacion) =>
  api.patch(`/admin/pedidos/${id}/estado`, { estado, observacion }).then((r) => r.data);
export const cambiarEstadoPago = (id, estado) =>
  api.patch(`/admin/pedidos/${id}/pago`, { estado }).then((r) => r.data);

// ===== Clientes (HO15) =====
export const listarClientesAdmin = (params) => api.get('/admin/clientes', { params }).then((r) => r.data);
export const obtenerClienteAdmin = (id) => api.get(`/admin/clientes/${id}`).then((r) => r.data);
export const cambiarEstadoCliente = (id, estado) =>
  api.patch(`/admin/clientes/${id}/estado`, { estado }).then((r) => r.data);