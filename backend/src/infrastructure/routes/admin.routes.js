const { Router } = require('express');
const PrismaClasificacionRepository = require('../repositories/PrismaClasificacionRepository');
const PrismaProductoAdminRepository = require('../repositories/PrismaProductoAdminRepository');
const CloudinaryAdapter = require('../external/CloudinaryAdapter');
const { crearCasosDeUsoClasificacion } = require('../../application/admin/clasificacion');
const { crearCasosDeUsoAdminProductos } = require('../../application/admin/productos');
const { crearAdminController } = require('../controllers/admin.controller');
const { requiereAuth, requiereAdmin } = require('../../middlewares/auth.middleware');
const { subirImagenes } = require('../../middlewares/subirImagenes.middleware');

const clasificacionRepository = new PrismaClasificacionRepository();

const c = crearAdminController({
  clasificacion: crearCasosDeUsoClasificacion({ clasificacionRepository }),
  productos: crearCasosDeUsoAdminProductos({
    productoAdminRepository: new PrismaProductoAdminRepository(),
    clasificacionRepository,
    almacenImagenes: CloudinaryAdapter,
  }),
});

const router = Router();
router.use(requiereAuth, requiereAdmin); // solo administradores

// HO16
router.get('/categorias', c.listarCategorias);
router.get('/marcas', c.listarMarcas);
for (const [ruta, tipo] of [['categorias', 'categoria'], ['subcategorias', 'subcategoria'], ['marcas', 'marca']]) {
  router.post(`/${ruta}`, c.crear(tipo));
  router.put(`/${ruta}/:id`, c.editar(tipo));
  router.patch(`/${ruta}/:id/estado`, c.cambiarEstado(tipo));
}

// HO12 / HO13
router.post('/imagenes', subirImagenes, c.subirImagenes);         // subir fotos a Cloudinary
router.get('/productos', c.listarProductos);
router.post('/productos', c.crearProducto);
router.get('/productos/:id', c.obtenerProducto);
router.put('/productos/:id', c.actualizarProducto);
router.patch('/productos/:id/estado', c.estadoProducto);
router.patch('/productos/:id/destacado', c.destacadoProducto);
router.delete('/productos/:id', c.eliminarProducto);

module.exports = router;