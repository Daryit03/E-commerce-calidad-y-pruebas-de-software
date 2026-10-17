class UsuarioRepository {
  buscarPorId(id) { throw new Error('No implementado'); }
  buscarPorCorreo(correo) { throw new Error('No implementado'); }
  buscarPorDni(dni) { throw new Error('No implementado'); }
  crear(datos) { throw new Error('No implementado'); }
  actualizarDatos(id, datos) { throw new Error('No implementado'); }
  actualizarPassword(id, passwordHash) { throw new Error('No implementado'); }
}

module.exports = UsuarioRepository;