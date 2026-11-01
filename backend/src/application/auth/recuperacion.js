const { ValidacionError } = require('../../domain/errors');
const { validarPassword } = require('../../domain/usuario/validaciones');

const MINUTOS_VIGENCIA = 15;
const MAX_INTENTOS = 5;
const CODIGO = /^\d{6}$/;
const MENSAJE_GENERICO =
  'Si el correo está registrado, te enviamos un código de 6 dígitos. Revisa tu bandeja de entrada y la carpeta de spam.';
const CODIGO_INVALIDO = 'El código no es correcto o ya venció. Revisa el correo o solicita uno nuevo.';

function crearCasosDeUsoRecuperacion({ usuarioRepository, tokenRepository, hasher, crypto, mailer }) {
  return {
    // Paso 1: el cliente escribe su correo y recibe un código de 6 dígitos
    async solicitar(datos = {}) {
      const correo = String(datos.correo ?? '').trim().toLowerCase();
      if (!correo) throw new ValidacionError('Ingresa tu correo electrónico');

      const usuario = await usuarioRepository.buscarPorCorreo(correo);
      if (usuario && usuario.estado) {
        const codigo = crypto.generarCodigo(); // ej.: "048213"
        await tokenRepository.crear({
          idUsuario: usuario.id,
          tokenHash: await hasher.hash(codigo), // en la BD solo se guarda el código cifrado
          expiraEn: new Date(Date.now() + MINUTOS_VIGENCIA * 60 * 1000),
        });

        await mailer.enviar({
          para: usuario.correo,
          asunto: `${codigo} es tu código para recuperar tu cuenta - Electro Ferretero Darvin`,
          texto:
            `Hola ${usuario.nombres}:\n\n` +
            `Tu código para crear una nueva contraseña es: ${codigo}\n\n` +
            `Vence en ${MINUTOS_VIGENCIA} minutos y solo sirve una vez.\n` +
            `Si no lo solicitaste, ignora este correo: tu contraseña no cambiará.`,
          html:
            `<p>Hola <b>${usuario.nombres}</b>:</p>` +
            `<p>Tu código para crear una nueva contraseña es:</p>` +
            `<p style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#2747E0;margin:16px 0">${codigo}</p>` +
            `<p>Vence en ${MINUTOS_VIGENCIA} minutos y solo sirve una vez.</p>` +
            `<p style="color:#666">Si no lo solicitaste, ignora este correo: tu contraseña no cambiará.</p>`,
        });
      }

      // Siempre el mismo mensaje: así no se revela qué correos están registrados
      return { mensaje: MENSAJE_GENERICO };
    },

    // Paso 2: el cliente escribe el código y su nueva contraseña
    async restablecer(datos = {}) {
      const correo = String(datos.correo ?? '').trim().toLowerCase();
      const codigo = String(datos.codigo ?? '').trim();
      const password = String(datos.password ?? '');
      const confirmar = String(datos.confirmarPassword ?? '');

      const errores = {};
      if (!correo) errores.correo = 'Ingresa tu correo electrónico';
      if (!CODIGO.test(codigo)) errores.codigo = 'Ingresa el código de 6 dígitos';
      const errPass = validarPassword(password);
      if (errPass) errores.password = errPass;
      if (!confirmar) errores.confirmarPassword = 'Confirma la nueva contraseña';
      else if (confirmar !== password) errores.confirmarPassword = 'Las contraseñas no coinciden';
      if (Object.keys(errores).length) throw new ValidacionError('Revisa los datos del formulario', errores);

      const usuario = await usuarioRepository.buscarPorCorreo(correo);
      const vigente = usuario && usuario.estado ? await tokenRepository.buscarVigentePorUsuario(usuario.id) : null;
      if (!vigente) throw new ValidacionError(CODIGO_INVALIDO, { codigo: CODIGO_INVALIDO });

      // Código equivocado: suma un intento; al 5.º el código deja de servir
      if (!(await hasher.comparar(codigo, vigente.tokenHash))) {
        await tokenRepository.registrarIntentoFallido(vigente.id, MAX_INTENTOS);
        throw new ValidacionError(CODIGO_INVALIDO, { codigo: CODIGO_INVALIDO });
      }

      const usado = await tokenRepository.consumir({
        idToken: vigente.id,
        idUsuario: usuario.id,
        passwordHash: await hasher.hash(password),
      });
      if (!usado) throw new ValidacionError(CODIGO_INVALIDO, { codigo: CODIGO_INVALIDO });

      return { mensaje: 'Tu contraseña se restableció correctamente. Ya puedes iniciar sesión.' };
    },
  };
}

module.exports = { crearCasosDeUsoRecuperacion };