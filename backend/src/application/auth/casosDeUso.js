const { ValidacionError, ConflictoError, NoAutorizadoError, ProhibidoError } = require('../../domain/errors');
const { validarRegistro } = require('../../domain/usuario/validaciones');

// Limpia espacios y pone el correo en minúsculas
function normalizar(d = {}) {
  const texto = (v) => String(v ?? '').trim().replace(/\s+/g, ' ');
  return {
    nombres: texto(d.nombres),
    apellidos: texto(d.apellidos),
    dni: texto(d.dni),
    telefono: texto(d.telefono),
    correo: texto(d.correo).toLowerCase(),
    password: String(d.password ?? ''),
    confirmarPassword: String(d.confirmarPassword ?? ''),
  };
}

function crearCasosDeUsoAuth({ usuarioRepository, hasher, tokens, enviarCodigoVerificacion }) {
  return {
    // HO2 - Registrar usuario
    async registrar(datos) {
      const d = normalizar(datos);

      const errores = validarRegistro(d);
      if (Object.keys(errores).length) throw new ValidacionError('Revisa los datos del formulario', errores);

      if (await usuarioRepository.buscarPorCorreo(d.correo))
        throw new ConflictoError('El correo ya está registrado', { correo: 'Este correo ya está registrado' });
      if (await usuarioRepository.buscarPorDni(d.dni))
        throw new ConflictoError('El DNI ya está registrado', { dni: 'Este DNI ya está registrado' });

      const usuario = await usuarioRepository.crear({
        nombres: d.nombres,
        apellidos: d.apellidos,
        dni: d.dni,
        telefono: d.telefono,
        correo: d.correo,
        passwordHash: await hasher.hash(d.password),
        rol: 'Cliente', // quien se registra siempre es Cliente
      });

      // Envía el código para verificar el correo (si el correo falla, la cuenta igual queda creada)
      try {
        await enviarCodigoVerificacion(usuario);
      } catch (e) {
        console.error('No se pudo enviar el código de verificación:', e.message);
      }

      return {
        mensaje: '¡Cuenta creada! Te enviamos un código de 6 dígitos a tu correo para activarla.',
        correo: usuario.correo,
      };
    },

    // HO1 - Iniciar sesión
    async iniciarSesion(datos = {}) {
      const correo = String(datos.correo ?? '').trim().toLowerCase();
      const password = String(datos.password ?? '');
      if (!correo || !password) throw new ValidacionError('Ingresa tu correo y contraseña');

      const usuario = await usuarioRepository.buscarPorCorreo(correo);
      const valido = usuario && usuario.estado && (await hasher.comparar(password, usuario.passwordHash));
      // Mismo mensaje en ambos casos: así no se revela qué correos existen
      if (!valido) throw new NoAutorizadoError('Correo o contraseña incorrectos');

      // Contraseña correcta, pero falta verificar el correo
      if (!usuario.emailVerificado)
        throw new ProhibidoError('Tu correo aún no está verificado. Ingresa el código que te enviamos o solicita uno nuevo.', {
          verificarCorreo: true,
        });

      const token = tokens.firmar({ id: usuario.id, rol: usuario.rol });
      return { mensaje: `¡Bienvenido(a), ${usuario.nombres}!`, token, usuario: usuario.aPublico() };
    },

    // Devuelve el usuario dueño del token (para mantener la sesión al recargar)
    async obtenerUsuarioActual(id) {
      const usuario = await usuarioRepository.buscarPorId(id);
      if (!usuario || !usuario.estado) throw new NoAutorizadoError('Tu sesión ya no es válida');
      return usuario.aPublico();
    },
  };
}

module.exports = { crearCasosDeUsoAuth };