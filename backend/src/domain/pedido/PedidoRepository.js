class PedidoRepository {
  listarMetodosPago() { throw new Error('No implementado'); }
  buscarMetodoPago(id) { throw new Error('No implementado'); }
  listarDirecciones(idUsuario) { throw new Error('No implementado'); }
  buscarDireccion(idUsuario, idDireccion) { throw new Error('No implementado'); }
  registrar(datos) { throw new Error('No implementado'); }
  actualizarPago(idPedido, datos) { throw new Error('No implementado'); }
  listarPorUsuario(idUsuario) { throw new Error('No implementado'); }
  buscarDeUsuario(idUsuario, idPedido) { throw new Error('No implementado'); }
}

module.exports = PedidoRepository;