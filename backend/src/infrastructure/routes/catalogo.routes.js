const { Router } = require('express');
const prisma = require('../../config/db.config');
const PrismaProductoRepository = require('../repositories/PrismaProductoRepository');
const PrismaCategoriaRepository = require('../repositories/PrismaCategoriaRepository');
const crearCasosDeUsoCatalogo = require('../../application/catalogo/casosDeUso');
const crearCatalogoController = require('../controllers/catalogo.controller');

// Armado: adaptador → casos de uso → controlador
const casos = crearCasosDeUsoCatalogo({
  productoRepository: new PrismaProductoRepository(prisma),
  categoriaRepository: new PrismaCategoriaRepository(prisma),
});
const c = crearCatalogoController(casos);

const router = Router();

router.get('/categorias', c.listarCategorias);
router.get('/productos', c.buscarProductos);
router.get('/productos/destacados', c.listarDestacados); // va ANTES de /:id
router.get('/productos/marcas', c.listarMarcas);         // va ANTES de /:id
router.get('/productos/:id', c.obtenerDetalle);

module.exports = router;