const prisma = require('../../config/db.config');
const TokenRecuperacionRepository = require('../../domain/usuario/TokenRecuperacionRepository');

class PrismaTokenRecuperacionRepository extends TokenRecuperacionRepository {
  // Anula los códigos anteriores sin usar (del mismo tipo) y crea uno nuevo
  async crear({ idUsuario, tokenHash, expiraEn, tipo = 'recuperacion' }) {
    await prisma.$transaction([
      prisma.token_recuperacion.updateMany({
        where: { id_usuario: idUsuario, usado: false, tipo },
        data: { usado: true },
      }),
      prisma.token_recuperacion.create({
        data: { id_usuario: idUsuario, token_hash: tokenHash, fecha_expiracion: expiraEn, tipo },
      }),
    ]);
  }

  // El código vigente (no usado y no vencido) más reciente del usuario
  async buscarVigentePorUsuario(idUsuario, tipo = 'recuperacion') {
    const f = await prisma.token_recuperacion.findFirst({
      where: { id_usuario: idUsuario, tipo, usado: false, fecha_expiracion: { gt: new Date() } },
      orderBy: { id_token: 'desc' },
    });
    return f ? { id: f.id_token, idUsuario: f.id_usuario, tokenHash: f.token_hash, intentos: f.intentos } : null;
  }

  // Suma un intento fallido; al llegar al máximo, el código deja de servir
  async registrarIntentoFallido(idToken, maxIntentos) {
    const f = await prisma.token_recuperacion.update({
      where: { id_token: idToken },
      data: { intentos: { increment: 1 } },
    });
    if (f.intentos >= maxIntentos) {
      await prisma.token_recuperacion.update({ where: { id_token: idToken }, data: { usado: true } });
    }
  }

  // Marca el token como usado y cambia la contraseña (todo junto)
  async consumir({ idToken, idUsuario, passwordHash }) {
    return prisma.$transaction(async (tx) => {
      const r = await tx.token_recuperacion.updateMany({
        where: { id_token: idToken, usado: false },
        data: { usado: true },
      });
      if (r.count === 0) return false; // alguien ya lo usó
      await tx.usuario.update({
        where: { id_usuario: idUsuario },
        data: { password: passwordHash, fecha_actualizacion: new Date() },
      });
      return true;
    });
  }

  // Marca el código como usado y el correo como verificado (todo junto)
  async verificarCorreo({ idToken, idUsuario }) {
    return prisma.$transaction(async (tx) => {
      const r = await tx.token_recuperacion.updateMany({
        where: { id_token: idToken, usado: false },
        data: { usado: true },
      });
      if (r.count === 0) return false; // alguien ya lo usó
      await tx.usuario.update({
        where: { id_usuario: idUsuario },
        data: { email_verificado: true, fecha_actualizacion: new Date() },
      });
      return true;
    });
  }
}

module.exports = PrismaTokenRecuperacionRepository;