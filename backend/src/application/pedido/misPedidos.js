const { NoEncontradoError, ValidacionError } = require('../../domain/errors');

function crearCasosDeUsoMisPedidos({ pedidoRepository }) {
  return {
    // RF0041 a RF0045 - Lista de pedidos del cliente
    listar: (idUsuario) => pedidoRepository.listarPorUsuario(idUsuario),

    // Detalle de un pedido (solo si es del cliente)
    async detalle(idUsuario, idPedidoParam) {
      const idPedido = Number(idPedidoParam);
      if (!Number.isInteger(idPedido) || idPedido <= 0) throw new ValidacionError('Pedido inválido');

      const pedido = await pedidoRepository.buscarDeUsuario(idUsuario, idPedido);
      if (!pedido) throw new NoEncontradoError('Pedido no encontrado');
      return pedido;
    },
  };
}

module.exports = { crearCasosDeUsoMisPedidos };