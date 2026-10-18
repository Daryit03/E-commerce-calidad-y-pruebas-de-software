import api from './api';

const RUTA = { categoria: 'categorias', subcategoria: 'subcategorias', marca: 'marcas' };

export const listarCategoriasAdmin = () => api.get('/admin/categorias').then((r) => r.data);
export const listarMarcasAdmin = () => api.get('/admin/marcas').then((r) => r.data);
export const crearClasificacion = (tipo, datos) => api.post(`/admin/${RUTA[tipo]}`, datos).then((r) => r.data);
export const editarClasificacion = (tipo, id, datos) =>
  api.put(`/admin/${RUTA[tipo]}/${id}`, datos).then((r) => r.data);
export const cambiarEstadoClasificacion = (tipo, id, estado) =>
  api.patch(`/admin/${RUTA[tipo]}/${id}/estado`, { estado }).then((r) => r.data);