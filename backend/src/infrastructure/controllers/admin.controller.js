function crearAdminController({ clasificacion }) {
  return {
    listarCategorias: async (req, res) => res.json(await clasificacion.listarCategorias()),
    listarMarcas: async (req, res) => res.json(await clasificacion.listarMarcas()),

    crear: (tipo) => async (req, res) => res.status(201).json(await clasificacion.crear(tipo, req.body ?? {})),
    editar: (tipo) => async (req, res) => res.json(await clasificacion.editar(tipo, req.params.id, req.body ?? {})),
    cambiarEstado: (tipo) => async (req, res) =>
      res.json(await clasificacion.cambiarEstado(tipo, req.params.id, req.body ?? {})),
  };
}

module.exports = { crearAdminController };