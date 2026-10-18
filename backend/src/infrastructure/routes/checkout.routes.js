const { Router } = require('express');
const PrismaPedidoRepository = require('../repositories/PrismaPedidoRepository');
const PrismaCarritoRepository = require('../repositories/PrismaCarritoRepository');
const PagoSimuladoAdapter = require('../external/PagoSimuladoAdapter');
const { crearCasosDeUsoCheckout } = require('../../application/pedido/checkout');
const { crearCheckoutController } = require('../controllers/checkout.controller');
const { requiereAuth } = require('../../middlewares/auth.middleware');

const c = crearCheckoutController(
  crearCasosDeUsoCheckout({
    pedidoRepository: new PrismaPedidoRepository(),
    carritoRepository: new PrismaCarritoRepository(),
    pasarelaPago: PagoSimuladoAdapter,
    yape: {
      numero: process.env.YAPE_NUMERO || '999 999 999',
      titular: process.env.YAPE_TITULAR || 'Electro Ferretero Darvin S.A.C.',
    },
  })
);

const router = Router();
router.use(requiereAuth);

router.get('/opciones', c.opciones); // GET  /api/checkout/opciones
router.post('/', c.confirmar);       // POST /api/checkout

module.exports = router;