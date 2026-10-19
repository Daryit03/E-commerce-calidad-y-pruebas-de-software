function crearAdminController({ clasificacion, productos, pedidos, clientes, dashboard }) {
  const body = (req) => req.body ?? {};

  return {
    // HO16 - Categorías, subcategorías y marcas
    listarCategorias: async (req, res) => res.json(await clasificacion.listarCategorias()),
    listarMarcas: async (req, res) => res.json(await clasificacion.listarMarcas()),
    crear: (tipo) => async (req, res) => res.status(201).json(await clasificacion.crear(tipo, body(req))),
    editar: (tipo) => async (req, res) => res.json(await clasificacion.editar(tipo, req.params.id, body(req))),
    cambiarEstado: (tipo) => async (req, res) =>
      res.json(await clasificacion.cambiarEstado(tipo, req.params.id, body(req))),

    // HO12 / HO13 - Productos
    listarProductos: async (req, res) => res.json(await productos.listar(req.query)),
    obtenerProducto: async (req, res) => res.json(await productos.obtener(req.params.id)),
    crearProducto: async (req, res) => res.status(201).json(await productos.crear(body(req))),
    actualizarProducto: async (req, res) => res.json(await productos.actualizar(req.params.id, body(req))),
    estadoProducto: async (req, res) => res.json(await productos.cambiarEstado(req.params.id, body(req))),
    destacadoProducto: async (req, res) => res.json(await productos.cambiarDestacado(req.params.id, body(req))),
    eliminarProducto: async (req, res) => res.json(await productos.eliminar(req.params.id)),
    subirImagenes: async (req, res) => res.status(201).json(await productos.subirImagenes(req.files)),

    // HO14 - Pedidos
    listarPedidos: async (req, res) => res.json(await pedidos.listar(req.query)),
    obtenerPedido: async (req, res) => res.json(await pedidos.detalle(req.params.id)),
    estadoPedido: async (req, res) => res.json(await pedidos.cambiarEstado(req.params.id, body(req))),
    pagoPedido: async (req, res) => res.json(await pedidos.cambiarEstadoPago(req.params.id, body(req))),

    // HO15 - Clientes
    listarClientes: async (req, res) => res.json(await clientes.listar(req.query)),
    obtenerCliente: async (req, res) => res.json(await clientes.detalle(req.params.id)),
    estadoCliente: async (req, res) => res.json(await clientes.cambiarEstado(req.params.id, body(req))),

    // HO11 - Dashboard
    dashboard: async (req, res) => res.json(await dashboard.obtener()),
  };
}

module.exports = { crearAdminController };