class ProductoAdminRepository {
  listar(filtros) { throw new Error('No implementado'); }
  buscarPorId(id) { throw new Error('No implementado'); }
  crear(producto) { throw new Error('No implementado'); }
  actualizar(id, producto) { throw new Error('No implementado'); }
  actualizarCampos(id, datos) { throw new Error('No implementado'); }
  tieneVentas(id) { throw new Error('No implementado'); }
  eliminar(id) { throw new Error('No implementado'); }
}

module.exports = ProductoAdminRepository;