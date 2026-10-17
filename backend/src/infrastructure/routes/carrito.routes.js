const { Router } = require('express');
const PrismaCarritoRepository = require('../repositories/PrismaCarritoRepository');
const { crearCasosDeUsoCarrito } = require('../../application/carrito/casosDeUso');
const { crearCarritoController } = require('../controllers/carrito.controller');
const { requiereAuth } = require('../../middlewares/auth.middleware');

const c = crearCarritoController(
  crearCasosDeUsoCarrito({ carritoRepository: new PrismaCarritoRepository() })
);

const router = Router();
router.use(requiereAuth);

router.get('/', c.obtener);                         // GET    /api/carrito
router.post('/items', c.agregar);                   // POST   /api/carrito/items
router.put('/items/:idProducto', c.actualizar);     // PUT    /api/carrito/items/2
router.delete('/items/:idProducto', c.eliminar);    // DELETE /api/carrito/items/2
router.delete('/', c.vaciar);                       // DELETE /api/carrito

module.exports = router;