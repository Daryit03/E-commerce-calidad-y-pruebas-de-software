class CarritoRepository {
  listarItems(idUsuario) { throw new Error('No implementado'); }
  buscarProductoVendible(idProducto) { throw new Error('No implementado'); }
  cantidadEnCarrito(idUsuario, idProducto) { throw new Error('No implementado'); }
  guardarItem(idUsuario, { idProducto, cantidad, precio }) { throw new Error('No implementado'); }
  eliminarItem(idUsuario, idProducto) { throw new Error('No implementado'); }
  vaciar(idUsuario) { throw new Error('No implementado'); }
}

module.exports = CarritoRepository;