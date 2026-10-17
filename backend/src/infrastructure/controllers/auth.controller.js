function crearAuthController(casos) {
  return {
    registrar: async (req, res) => res.status(201).json(await casos.registrar(req.body ?? {})),
    iniciarSesion: async (req, res) => res.json(await casos.iniciarSesion(req.body ?? {})),
    yo: async (req, res) => res.json(await casos.obtenerUsuarioActual(req.usuario.id)),
  };
}

module.exports = { crearAuthController };