const { ValidacionError, NoEncontradoError } = require('../../domain/errors');

const idValido = (v) => {
  const n = Number(v);
  if (!Number.isInteger(n) || n <= 0) throw new ValidacionError('Cliente inválido');
  return n;
};

function crearCasosDeUsoAdminClientes({ clienteAdminRepository: repo, pedidoRepository }) {
  async function existente(idParam) {
    const cliente = await repo.buscar(idValido(idParam));
    if (!cliente) throw new NoEncontradoError('El cliente no existe');
    return cliente;
  }

  return {
    // RF0065
    listar(params = {}) {
      return repo.listar({
        q: String(params.q ?? '').trim().slice(0, 100),
        estado: ['activos', 'inactivos'].includes(params.estado) ? params.estado : 'todos',
        pagina: Math.max(1, parseInt(params.pagina, 10) || 1),
        limite: 20,
      });
    },

    // RF0066
    async detalle(idParam) {
      const cliente = await existente(idParam);
      const pedidos = await pedidoRepository.listarPorUsuario(cliente.id);
      const validos = pedidos.filter((p) => p.estado !== 'Anulado');
      const totalCent = validos.reduce((t, p) => t + Math.round(p.total * 100), 0);
      return {
        ...cliente,
        resumen: {
          totalPedidos: pedidos.length,
          totalGastado: totalCent / 100,
          ultimoPedido: pedidos[0]?.fecha ?? null,
        },
        pedidos,
      };
    },

    // RF0067
    async cambiarEstado(idParam, datos = {}) {
      const cliente = await existente(idParam);
      if (typeof datos.estado !== 'boolean') throw new ValidacionError('Indica si se activa o se desactiva');
      await repo.actualizarEstado(cliente.id, datos.estado);
      const nombre = `${cliente.nombres} ${cliente.apellidos}`;
      return {
        mensaje: datos.estado
          ? `La cuenta de ${nombre} se activó. Ya puede iniciar sesión y comprar.`
          : `La cuenta de ${nombre} se desactivó. Ya no podrá iniciar sesión ni comprar.`,
      };
    },
  };
}

module.exports = { crearCasosDeUsoAdminClientes };