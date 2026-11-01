import api from './api';

export async function obtenerCategorias() {
  const { data } = await api.get('/categorias');
  return data;
}

export async function obtenerDestacados() {
  const { data } = await api.get('/productos/destacados');
  return data;
}

export async function buscarProductos(params) {
  const { data } = await api.get('/productos', { params });
  return data;
}

export async function obtenerProducto(id) {
  const { data } = await api.get(`/productos/${id}`);
  return data;
}

export async function obtenerMarcas(idSubcategoria) {
  const { data } = await api.get('/productos/marcas', {
    params: { subcategoria: idSubcategoria },
  });
  return data;
}

export async function obtenerNuevos() {
  const { data } = await api.get('/productos/nuevos');
  return data;
}

export async function obtenerMarcasTienda() {
  const { data } = await api.get('/marcas');
  return data;
}