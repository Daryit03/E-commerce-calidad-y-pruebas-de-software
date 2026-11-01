const { ValidacionError } = require('../../domain/errors');

const MINUTOS_VIGENCIA = 15;
const MAX_INTENTOS = 5;
const TIPO = 'verificacion';
const CODIGO = /^\d{6}$/;
const MENSAJE_REENVIO =
  'Si el correo está registrado y aún no fue verificado, te enviamos un nuevo código. Revisa tu bandeja de entrada y la carpeta de spam.';
const CODIGO_INVALIDO = 'El código no es correcto o ya venció. Revisa el correo o solicita uno nuevo.';

function crearCasosDeUsoVerificacion({ usuarioRepository, tokenRepository, hasher, crypto, mailer }) {
  // Genera un código, lo guarda cifrado y lo envía al correo del usuario
  async function enviarCodigo(usuario) {
    const codigo = crypto.generarCodigo();
    await tokenRepository.crear({
      idUsuario: usuario.id,
      tokenHash: await hasher.hash(codigo),
      expiraEn: new Date(Date.now() + MINUTOS_VIGENCIA * 60 * 1000),
      tipo: TIPO,
    });

    await mailer.enviar({
      para: usuario.correo,
      asunto: `${codigo} es tu código para activar tu cuenta - Electro Ferretero Darvin`,
      texto:
        `Hola ${usuario.nombres}:\n\n` +
        `Gracias por registrarte. Tu código para activar tu cuenta es: ${codigo}\n\n` +
        `Vence en ${MINUTOS_VIGENCIA} minutos.\n` +
        `Si no creaste una cuenta, ignora este correo.`,
      html:
        `<p>Hola <b>${usuario.nombres}</b>:</p>` +
        `<p>Gracias por registrarte en Electro Ferretero Darvin. Tu código para activar tu cuenta es:</p>` +
        `<p style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#2747E0;margin:16px 0">${codigo}</p>` +
        `<p>Vence en ${MINUTOS_VIGENCIA} minutos.</p>` +
        `<p style="color:#666">Si no creaste una cuenta, ignora este correo.</p>`,
    });
  }

  return {
    enviarCodigo,

    // Reenviar el código (siempre el mismo mensaje, para no revelar qué correos existen)
    async reenviar(datos = {}) {
      const correo = String(datos.correo ?? '').trim().toLowerCase();
      if (!correo) throw new ValidacionError('Ingresa tu correo electrónico', { correo: 'Ingresa tu correo electrónico' });

      const usuario = await usuarioRepository.buscarPorCorreo(correo);
      if (usuario && usuario.estado && !usuario.emailVerificado) await enviarCodigo(usuario);
      return { mensaje: MENSAJE_REENVIO };
    },

    // Verificar el correo con el código
    async verificar(datos = {}) {
      const correo = String(datos.correo ?? '').trim().toLowerCase();
      const codigo = String(datos.codigo ?? '').trim();

      const errores = {};
      if (!correo) errores.correo = 'Ingresa tu correo electrónico';
      if (!CODIGO.test(codigo)) errores.codigo = 'Ingresa el código de 6 dígitos';
      if (Object.keys(errores).length) throw new ValidacionError('Revisa los datos del formulario', errores);

      const usuario = await usuarioRepository.buscarPorCorreo(correo);
      if (usuario?.emailVerificado) return { mensaje: 'Tu correo ya estaba verificado. Ya puedes iniciar sesión.' };

      const vigente = usuario && usuario.estado ? await tokenRepository.buscarVigentePorUsuario(usuario.id, TIPO) : null;
      if (!vigente) throw new ValidacionError(CODIGO_INVALIDO, { codigo: CODIGO_INVALIDO });

      if (!(await hasher.comparar(codigo, vigente.tokenHash))) {
        await tokenRepository.registrarIntentoFallido(vigente.id, MAX_INTENTOS);
        throw new ValidacionError(CODIGO_INVALIDO, { codigo: CODIGO_INVALIDO });
      }

      const ok = await tokenRepository.verificarCorreo({ idToken: vigente.id, idUsuario: usuario.id });
      if (!ok) throw new ValidacionError(CODIGO_INVALIDO, { codigo: CODIGO_INVALIDO });

      return { mensaje: '¡Tu correo fue verificado! Ya puedes iniciar sesión.' };
    },
  };
}

module.exports = { crearCasosDeUsoVerificacion };