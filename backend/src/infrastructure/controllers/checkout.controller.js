function crearCheckoutController(casos) {
  return {
    opciones: async (req, res) => res.json(await casos.opciones(req.usuario.id)),
    confirmar: async (req, res) => res.status(201).json(await casos.confirmar(req.usuario.id, req.body ?? {})),
  };
}

module.exports = { crearCheckoutController };