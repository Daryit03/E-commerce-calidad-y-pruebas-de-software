const prisma = require('../../config/db.config');
const ClienteAdminRepository = require('../../domain/usuario/ClienteAdminRepository');

const soloClientes = { rol: { nombre: 'Cliente' } };

const aCliente = (u) => ({
  id: u.id_usuario,
  nombres: u.nombres,
  apellidos: u.apellidos,
  dni: u.dni,
  correo: u.correo,
  telefono: u.telefono,
  estado: u.estado,
  fechaRegistro: u.fecha_registro,
});

class PrismaClienteAdminRepository extends ClienteAdminRepository {
  async listar({ q, estado, pagina, limite }) {
    const where = {
      ...soloClientes,
      ...(estado === 'activos' && { estado: true }),
      ...(estado === 'inactivos' && { estado: false }),
      ...(q && {
        OR: [
          { nombres: { contains: q, mode: 'insensitive' } },
          { apellidos: { contains: q, mode: 'insensitive' } },
          { correo: { contains: q, mode: 'insensitive' } },
          { dni: { contains: q } },
        ],
      }),
    };

    const [total, filas] = await prisma.$transaction([
      prisma.usuario.count({ where }),
      prisma.usuario.findMany({
        where,
        orderBy: { fecha_registro: 'desc' },
        skip: (pagina - 1) * limite,
        take: limite,
        include: { _count: { select: { pedido: true } } },
      }),
    ]);

    // Total gastado por cliente (sin pedidos anulados)
    const sumas = filas.length
      ? await prisma.pedido.groupBy({
          by: ['id_usuario'],
          where: {
            id_usuario: { in: filas.map((f) => f.id_usuario) },
            estado_pedido: { nombre: { not: 'Anulado' } },
          },
          _sum: { total: true },
        })
      : [];
    const gastado = new Map(sumas.map((s) => [s.id_usuario, Number(s._sum.total ?? 0)]));

    return {
      total,
      pagina,
      limite,
      totalPaginas: Math.max(1, Math.ceil(total / limite)),
      clientes: filas.map((f) => ({
        ...aCliente(f),
        totalPedidos: f._count.pedido,
        totalGastado: gastado.get(f.id_usuario) ?? 0,
      })),
    };
  }

  async buscar(id) {
    const u = await prisma.usuario.findFirst({ where: { id_usuario: id, ...soloClientes } });
    return u ? aCliente(u) : null;
  }

  async actualizarEstado(id, estado) {
    await prisma.usuario.update({
      where: { id_usuario: id },
      data: { estado, fecha_actualizacion: new Date() },
    });
  }
}

module.exports = PrismaClienteAdminRepository;