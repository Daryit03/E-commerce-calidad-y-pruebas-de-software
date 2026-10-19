const { Router } = require('express');
const PrismaClasificacionRepository = require('../repositories/PrismaClasificacionRepository');
const PrismaProductoAdminRepository = require('../repositories/PrismaProductoAdminRepository');
const CloudinaryAdapter = require('../external/CloudinaryAdapter');
const { crearCasosDeUsoClasificacion } = require('../../application/admin/clasificacion');
const { crearCasosDeUsoAdminProductos } = require('../../application/admin/productos');
const { crearCasosDeUsoAdminPedidos } = require('../../application/admin/pedidos');
const { crearCasosDeUsoAdminClientes } = require('../../application/admin/clientes');
const PrismaPedidoRepository = require('../repositories/PrismaPedidoRepository');
const PrismaClienteAdminRepository = require('../repositories/PrismaClienteAdminRepository');
const PrismaDashboardRepository = require('../repositories/PrismaDashboardRepository');
const { crearCasosDeUsoDashboard } = require('../../application/admin/dashboard');
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
  pedidos: crearCasosDeUsoAdminPedidos({ pedidoRepository: new PrismaPedidoRepository() }),
  clientes: crearCasosDeUsoAdminClientes({
    clienteAdminRepository: new PrismaClienteAdminRepository(),
    pedidoRepository: new PrismaPedidoRepository(),
  }),
  dashboard: crearCasosDeUsoDashboard({ dashboardRepository: new PrismaDashboardRepository() }),
});

const router = Router();
router.use(requiereAuth, requiereAdmin); // solo administradores

// HO11
router.get('/dashboard', c.dashboard);

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

// HO14
router.get('/pedidos', c.listarPedidos);
router.get('/pedidos/:id', c.obtenerPedido);
router.patch('/pedidos/:id/estado', c.estadoPedido);
router.patch('/pedidos/:id/pago', c.pagoPedido);

// HO15
router.get('/clientes', c.listarClientes);
router.get('/clientes/:id', c.obtenerCliente);
router.patch('/clientes/:id/estado', c.estadoCliente);

module.exports = router;