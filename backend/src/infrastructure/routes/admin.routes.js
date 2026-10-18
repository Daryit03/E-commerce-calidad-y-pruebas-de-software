const { Router } = require('express');
const PrismaClasificacionRepository = require('../repositories/PrismaClasificacionRepository');
const { crearCasosDeUsoClasificacion } = require('../../application/admin/clasificacion');
const { crearAdminController } = require('../controllers/admin.controller');
const { requiereAuth, requiereAdmin } = require('../../middlewares/auth.middleware');

const c = crearAdminController({
  clasificacion: crearCasosDeUsoClasificacion({ clasificacionRepository: new PrismaClasificacionRepository() }),
});

const router = Router();
router.use(requiereAuth, requiereAdmin); // solo administradores

// HO16
router.get('/categorias', c.listarCategorias);
router.get('/marcas', c.listarMarcas);

for (const [ruta, tipo] of [['categorias', 'categoria'], ['subcategorias', 'subcategoria'], ['marcas', 'marca']]) {
  router.post(`/${ruta}`, c.crear(tipo));                     // POST  /api/admin/marcas
  router.put(`/${ruta}/:id`, c.editar(tipo));                 // PUT   /api/admin/marcas/3
  router.patch(`/${ruta}/:id/estado`, c.cambiarEstado(tipo)); // PATCH /api/admin/marcas/3/estado
}

module.exports = router;