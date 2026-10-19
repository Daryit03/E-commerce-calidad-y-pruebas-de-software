const { ValidacionError, NoEncontradoError } = require('../../domain/errors');
const {
  ESTADOS_PEDIDO, TRANSICIONES, TRANSICIONES_PAGO, METODOS_EFECTIVO,
  puedeCambiarEstado, puedeCambiarPago,
} = require('../../domain/pedido/estados');

const idValido = (v) => {
  const n = Number(v);
  if (!Number.isInteger(n) || n <= 0) throw new ValidacionError('Pedido inválido');
  return n;
};
const limpiar = (v) => String(v ?? '').trim().replace(/\s+/g, ' ');

function crearCasosDeUsoAdminPedidos({ pedidoRepository: repo }) {
  async function detalle(idParam) {
    const pedido = await repo.buscarAdmin(idValido(idParam));
    if (!pedido) throw new NoEncontradoError('El pedido no existe');
    return {
      ...pedido,
      transiciones: TRANSICIONES[pedido.estado] || [],
      transicionesPago: pedido.pago ? TRANSICIONES_PAGO[pedido.pago.estado] || [] : [],
    };
  }

  return {
    // RF0061
    listar(params = {}) {
      return repo.listarAdmin({
        estado: ESTADOS_PEDIDO.includes(params.estado) ? params.estado : '',
        q: String(params.q ?? '').trim().slice(0, 100),
        pagina: Math.max(1, parseInt(params.pagina, 10) || 1),
        limite: 20,
      });
    },

    // RF0062
    detalle,

    // RF0063 + RF0064
    async cambiarEstado(idParam, datos = {}) {
      const pedido = await detalle(idParam);
      const nuevo = String(datos.estado ?? '');
      const observacion = limpiar(datos.observacion).slice(0, 300);

      if (!puedeCambiarEstado(pedido.estado, nuevo))
        throw new ValidacionError(`Un pedido "${pedido.estado}" no puede pasar a "${nuevo || '(vacío)'}"`);
      if (nuevo === 'Anulado' && !observacion)
        throw new ValidacionError('Indica el motivo de la anulación', { observacion: 'Escribe el motivo' });

      const aprobarPago = nuevo === 'Entregado' && METODOS_EFECTIVO.includes(pedido.metodoPago);
      await repo.cambiarEstado({
        idPedido: pedido.id,
        estadoActual: pedido.estado,
        estadoNuevo: nuevo,
        observacion: observacion || `Estado cambiado a ${nuevo}`,
        devolverStock: nuevo === 'Anulado',
        aprobarPago,
      });

      let mensaje = `El pedido N.º ${pedido.id} pasó a "${nuevo}".`;
      if (nuevo === 'Anulado') mensaje += ' El stock de sus productos se devolvió al inventario.';
      if (aprobarPago) mensaje += ' El pago en efectivo se marcó como Aprobado.';
      return { mensaje, pedido: await detalle(pedido.id) };
    },

    // Verificar Yape, rechazar o reembolsar
    async cambiarEstadoPago(idParam, datos = {}) {
      const pedido = await detalle(idParam);
      const nuevo = String(datos.estado ?? '');
      if (!pedido.pago) throw new ValidacionError('Este pedido no tiene un pago registrado');
      if (!puedeCambiarPago(pedido.pago.estado, nuevo))
        throw new ValidacionError(`Un pago "${pedido.pago.estado}" no puede pasar a "${nuevo || '(vacío)'}"`);

      await repo.actualizarPago(pedido.id, { estado: nuevo });
      return { mensaje: `El pago del pedido N.º ${pedido.id} ahora está "${nuevo}".`, pedido: await detalle(pedido.id) };
    },
  };
}

module.exports = { crearCasosDeUsoAdminPedidos };