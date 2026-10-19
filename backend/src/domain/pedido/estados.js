const ESTADOS_PEDIDO = ['Pendiente', 'En proceso', 'Entregado', 'Anulado'];

// Desde cada estado, a cuáles se puede pasar
const TRANSICIONES = {
  Pendiente: ['En proceso', 'Anulado'],
  'En proceso': ['Entregado', 'Anulado'],
  Entregado: [],
  Anulado: [],
};

const TRANSICIONES_PAGO = {
  Pendiente: ['Aprobado', 'Rechazado'],
  Rechazado: ['Aprobado'],
  Aprobado: ['Reembolsado'],
  Reembolsado: [],
};

// Con estos métodos el cliente paga en efectivo al recibir/recoger
const METODOS_EFECTIVO = ['Efectivo en tienda', 'Pago contra entrega'];

const puedeCambiarEstado = (actual, nuevo) => (TRANSICIONES[actual] || []).includes(nuevo);
const puedeCambiarPago = (actual, nuevo) => (TRANSICIONES_PAGO[actual] || []).includes(nuevo);

module.exports = {
  ESTADOS_PEDIDO, TRANSICIONES, TRANSICIONES_PAGO, METODOS_EFECTIVO,
  puedeCambiarEstado, puedeCambiarPago,
};