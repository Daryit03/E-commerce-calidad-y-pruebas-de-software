function crearPedidosController(casos) {
  return {
    listar: async (req, res) => res.json(await casos.listar(req.usuario.id)),
    detalle: async (req, res) => res.json(await casos.detalle(req.usuario.id, req.params.id)),
  };
}

module.exports = { crearPedidosController };