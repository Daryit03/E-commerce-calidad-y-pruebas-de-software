const { ValidacionError } = require('../../domain/errors');
const { validarPassword } = require('../../domain/usuario/validaciones');

const MINUTOS_VIGENCIA = 30;
const MENSAJE_GENERICO =
  'Si el correo está registrado, te enviamos un enlace para recuperar tu cuenta. Revisa tu bandeja de entrada y la carpeta de spam.';
const ENLACE_INVALIDO = 'El enlace no es válido, ya fue usado o venció. Solicita uno nuevo.';

function crearCasosDeUsoRecuperacion({ usuarioRepository, tokenRepository, hasher, crypto, mailer, urlFrontend }) {
  return {
    // Paso 1: el cliente escribe su correo y recibe el enlace
    async solicitar(datos = {}) {
      const correo = String(datos.correo ?? '').trim().toLowerCase();
      if (!correo) throw new ValidacionError('Ingresa tu correo electrónico');

      const usuario = await usuarioRepository.buscarPorCorreo(correo);
      if (usuario && usuario.estado) {
        const token = crypto.generarToken();
        await tokenRepository.crear({
          idUsuario: usuario.id,
          tokenHash: crypto.hash(token), // en la BD solo se guarda el hash
          expiraEn: new Date(Date.now() + MINUTOS_VIGENCIA * 60 * 1000),
        });

        const enlace = `${urlFrontend}/restablecer?token=${token}`;
        await mailer.enviar({
          para: usuario.correo,
          asunto: 'Recupera tu cuenta - Electro Ferretero Darvin',
          texto:
            `Hola ${usuario.nombres}:\n\n` +
            `Para crear una nueva contraseña entra a este enlace (vence en ${MINUTOS_VIGENCIA} minutos y solo sirve una vez):\n` +
            `${enlace}\n\nSi no lo solicitaste, ignora este correo.`,
          html:
            `<p>Hola <b>${usuario.nombres}</b>:</p>` +
            `<p>Para crear una nueva contraseña haz clic en el botón. El enlace vence en ${MINUTOS_VIGENCIA} minutos y solo sirve una vez.</p>` +
            `<p><a href="${enlace}" style="background:#2747E0;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none">Crear nueva contraseña</a></p>` +
            `<p style="color:#666">Si no lo solicitaste, ignora este correo.</p>`,
        });
      }

      return { mensaje: MENSAJE_GENERICO };
    },

    // Paso 2: el cliente abre el enlace y escribe su nueva contraseña
    async restablecer(datos = {}) {
      const token = String(datos.token ?? '');
      const password = String(datos.password ?? '');
      const confirmar = String(datos.confirmarPassword ?? '');

      const errores = {};
      const errPass = validarPassword(password);
      if (errPass) errores.password = errPass;
      if (!confirmar) errores.confirmarPassword = 'Confirma la nueva contraseña';
      else if (confirmar !== password) errores.confirmarPassword = 'Las contraseñas no coinciden';
      if (Object.keys(errores).length) throw new ValidacionError('Revisa los datos del formulario', errores);

      const vigente = token ? await tokenRepository.buscarVigente(crypto.hash(token)) : null;
      if (!vigente) throw new ValidacionError(ENLACE_INVALIDO);

      const usado = await tokenRepository.consumir({
        idToken: vigente.id,
        idUsuario: vigente.idUsuario,
        passwordHash: await hasher.hash(password),
      });
      if (!usado) throw new ValidacionError(ENLACE_INVALIDO);

      return { mensaje: 'Tu contraseña se restableció correctamente. Ya puedes iniciar sesión.' };
    },
  };
}

module.exports = { crearCasosDeUsoRecuperacion };