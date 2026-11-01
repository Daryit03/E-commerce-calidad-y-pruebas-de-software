function crearCatalogoController(casos) {
  return {
    listarCategorias: async (req, res) => {
      res.json(await casos.listarCategorias());
    },
    buscarProductos: async (req, res) => {
      res.json(await casos.buscarProductos(req.query));
    },
    listarDestacados: async (req, res) => {
      res.json(await casos.listarDestacados());
    },
    listarMarcas: async (req, res) => {
      res.json(await casos.listarMarcasDeSubcategoria(req.query.subcategoria));
    },
    listarNuevos: async (req, res) => {
      res.json(await casos.listarNuevos());
    },
    listarMarcasTienda: async (req, res) => {
      res.json(await casos.listarMarcasTienda());
    },
    obtenerDetalle: async (req, res) => {
      res.json(await casos.obtenerDetalleProducto(req.params.id));
    },
  };
}

module.exports = crearCatalogoController;