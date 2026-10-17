const prisma = require('../../config/db.config');
const TokenRecuperacionRepository = require('../../domain/usuario/TokenRecuperacionRepository');

class PrismaTokenRecuperacionRepository extends TokenRecuperacionRepository {
  // Anula los enlaces anteriores sin usar y crea uno nuevo
  async crear({ idUsuario, tokenHash, expiraEn }) {
    await prisma.$transaction([
      prisma.token_recuperacion.updateMany({
        where: { id_usuario: idUsuario, usado: false },
        data: { usado: true },
      }),
      prisma.token_recuperacion.create({
        data: { id_usuario: idUsuario, token_hash: tokenHash, fecha_expiracion: expiraEn },
      }),
    ]);
  }

  // Solo devuelve el token si no se usó y no venció
  async buscarVigente(tokenHash) {
    const f = await prisma.token_recuperacion.findFirst({
      where: { token_hash: tokenHash, usado: false, fecha_expiracion: { gt: new Date() } },
    });
    return f ? { id: f.id_token, idUsuario: f.id_usuario } : null;
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
}

module.exports = PrismaTokenRecuperacionRepository;