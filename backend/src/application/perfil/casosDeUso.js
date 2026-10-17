const { ValidacionError, NoAutorizadoError } = require('../../domain/errors');
const { validarPerfil, validarPassword } = require('../../domain/usuario/validaciones');

const limpiar = (v) => String(v ?? '').trim().replace(/\s+/g, ' ');

function crearCasosDeUsoPerfil({ usuarioRepository, hasher }) {
  return {
    // RF0047 - Editar nombres, apellidos y celular
    async actualizarPerfil(idUsuario, datos = {}) {
      const d = {
        nombres: limpiar(datos.nombres),
        apellidos: limpiar(datos.apellidos),
        telefono: limpiar(datos.telefono),
      };

      const errores = validarPerfil(d);
      if (Object.keys(errores).length) throw new ValidacionError('Revisa los datos del formulario', errores);

      const usuario = await usuarioRepository.actualizarDatos(idUsuario, d);
      return { mensaje: 'Tus datos se actualizaron correctamente.', usuario: usuario.aPublico() };
    },

    // RF0048 - Cambiar contraseña (pide la actual por seguridad)
    async cambiarPassword(idUsuario, datos = {}) {
      const actual = String(datos.passwordActual ?? '');
      const nueva = String(datos.passwordNueva ?? '');
      const confirmar = String(datos.confirmarPassword ?? '');

      const errores = {};
      if (!actual) errores.passwordActual = 'Ingresa tu contraseña actual';
      const errNueva = validarPassword(nueva);
      if (errNueva) errores.passwordNueva = errNueva;
      else if (nueva === actual) errores.passwordNueva = 'Debe ser distinta a la contraseña actual';
      if (!confirmar) errores.confirmarPassword = 'Confirma la nueva contraseña';
      else if (confirmar !== nueva) errores.confirmarPassword = 'Las contraseñas no coinciden';
      if (Object.keys(errores).length) throw new ValidacionError('Revisa los datos del formulario', errores);

      const usuario = await usuarioRepository.buscarPorId(idUsuario);
      if (!usuario || !usuario.estado) throw new NoAutorizadoError('Tu sesión ya no es válida');

      if (!(await hasher.comparar(actual, usuario.passwordHash)))
        throw new ValidacionError('La contraseña actual no es correcta', {
          passwordActual: 'La contraseña actual no es correcta',
        });

      await usuarioRepository.actualizarPassword(idUsuario, await hasher.hash(nueva));
      return { mensaje: 'Tu contraseña se cambió correctamente.' };
    },
  };
}

module.exports = { crearCasosDeUsoPerfil };