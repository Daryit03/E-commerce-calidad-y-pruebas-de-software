const prisma = require('../../config/db.config');
const Usuario = require('../../domain/usuario/Usuario');
const UsuarioRepository = require('../../domain/usuario/UsuarioRepository');
const { ConflictoError } = require('../../domain/errors');

const incluir = { rol: true };

function aEntidad(f) {
  if (!f) return null;
  return new Usuario({
    id: f.id_usuario,
    nombres: f.nombres,
    apellidos: f.apellidos,
    dni: f.dni,
    correo: f.correo,
    telefono: f.telefono,
    rol: f.rol.nombre,
    estado: f.estado,
    emailVerificado: f.email_verificado,
    passwordHash: f.password,
    fechaRegistro: f.fecha_registro,
  });
}

class PrismaUsuarioRepository extends UsuarioRepository {
  async buscarPorId(id) {
    return aEntidad(await prisma.usuario.findUnique({ where: { id_usuario: Number(id) }, include: incluir }));
  }

  async buscarPorCorreo(correo) {
    return aEntidad(await prisma.usuario.findUnique({ where: { correo }, include: incluir }));
  }

  async buscarPorDni(dni) {
    return aEntidad(await prisma.usuario.findUnique({ where: { dni }, include: incluir }));
  }

  async crear(d) {
    try {
      const fila = await prisma.usuario.create({
        data: {
          nombres: d.nombres,
          apellidos: d.apellidos,
          dni: d.dni,
          telefono: d.telefono,
          correo: d.correo,
          password: d.passwordHash,
          rol: { connect: { nombre: d.rol } },
        },
        include: incluir,
      });
      return aEntidad(fila);
    } catch (e) {
      // P2002 = se violó un UNIQUE (dos registros iguales al mismo tiempo)
      if (e.code === 'P2002') throw new ConflictoError('El correo o DNI ya está registrado');
      throw e;
    }
  }

  async actualizarDatos(id, d) {
    const fila = await prisma.usuario.update({
      where: { id_usuario: Number(id) },
      data: { nombres: d.nombres, apellidos: d.apellidos, telefono: d.telefono, fecha_actualizacion: new Date() },
      include: incluir,
    });
    return aEntidad(fila);
  }

  async actualizarPassword(id, passwordHash) {
    await prisma.usuario.update({
      where: { id_usuario: Number(id) },
      data: { password: passwordHash, fecha_actualizacion: new Date() },
    });
  }
}

module.exports = PrismaUsuarioRepository;