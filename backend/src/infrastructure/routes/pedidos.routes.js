const { Router } = require('express');
const PrismaPedidoRepository = require('../repositories/PrismaPedidoRepository');
const { crearCasosDeUsoMisPedidos } = require('../../application/pedido/misPedidos');
const { crearPedidosController } = require('../controllers/pedidos.controller');
const { requiereAuth } = require('../../middlewares/auth.middleware');

const c = crearPedidosController(
  crearCasosDeUsoMisPedidos({ pedidoRepository: new PrismaPedidoRepository() })
);

const router = Router();
router.use(requiereAuth);

router.get('/', c.listar);      // GET /api/pedidos
router.get('/:id', c.detalle);  // GET /api/pedidos/5

module.exports = router;