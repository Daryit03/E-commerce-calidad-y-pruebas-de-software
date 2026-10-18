const crypto = require('crypto');

module.exports = {
  async cobrarTarjeta({ idPedido }) {
    return {
      aprobado: true,
      referencia: `SIM-${idPedido}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
    };
  },
};