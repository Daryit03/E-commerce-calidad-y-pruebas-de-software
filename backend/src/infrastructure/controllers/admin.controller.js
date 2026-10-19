function crearAdminController({ clasificacion, productos }) {
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
  };
}

module.exports = { crearAdminController };