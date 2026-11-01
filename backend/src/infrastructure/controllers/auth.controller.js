function crearAuthController({ auth, perfil, recuperacion, verificacion }) {
  const body = (req) => req.body ?? {};

  return {
    // Sesión
    registrar: async (req, res) => res.status(201).json(await auth.registrar(body(req))),
    iniciarSesion: async (req, res) => res.json(await auth.iniciarSesion(body(req))),
    yo: async (req, res) => res.json(await auth.obtenerUsuarioActual(req.usuario.id)),

    // Perfil (el id sale del token, no del body)
    actualizarPerfil: async (req, res) => res.json(await perfil.actualizarPerfil(req.usuario.id, body(req))),
    cambiarPassword: async (req, res) => res.json(await perfil.cambiarPassword(req.usuario.id, body(req))),

    // Recuperación de cuenta
    solicitarRecuperacion: async (req, res) => res.json(await recuperacion.solicitar(body(req))),
    restablecerPassword: async (req, res) => res.json(await recuperacion.restablecer(body(req))),

    // Verificación del correo (al registrarse)
    verificarCorreo: async (req, res) => res.json(await verificacion.verificar(body(req))),
    reenviarVerificacion: async (req, res) => res.json(await verificacion.reenviar(body(req))),
  };
}

module.exports = { crearAuthController };