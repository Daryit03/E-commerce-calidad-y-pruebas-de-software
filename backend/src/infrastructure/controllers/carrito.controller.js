function crearCarritoController(casos) {
  return {
    obtener: async (req, res) => res.json(await casos.obtener(req.usuario.id)),
    agregar: async (req, res) => res.status(201).json(await casos.agregar(req.usuario.id, req.body ?? {})),
    actualizar: async (req, res) =>
      res.json(await casos.actualizarCantidad(req.usuario.id, req.params.idProducto, req.body ?? {})),
    eliminar: async (req, res) => res.json(await casos.eliminar(req.usuario.id, req.params.idProducto)),
    vaciar: async (req, res) => res.json(await casos.vaciar(req.usuario.id)),
  };
}

module.exports = { crearCarritoController };