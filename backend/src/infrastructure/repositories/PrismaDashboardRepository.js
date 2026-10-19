const prisma = require('../../config/db.config');

const noAnulado = { estado_pedido: { nombre: { not: 'Anulado' } } };
const resumen = (a) => ({ total: Number(a._sum.total ?? 0), pedidos: a._count._all });

class PrismaDashboardRepository {
  async indicadores({ inicioHoy, inicioMes, desdeGrafico, desdeTop }) {
    const [hoy, mes, pendientes, enProceso, yapePorVerificar, clientesNuevos, ventasPorDia, top, stockBajo, ultimos] =
      await Promise.all([
        prisma.pedido.aggregate({
          where: { ...noAnulado, fecha_pedido: { gte: inicioHoy } },
          _sum: { total: true },
          _count: { _all: true },
        }),
        prisma.pedido.aggregate({
          where: { ...noAnulado, fecha_pedido: { gte: inicioMes } },
          _sum: { total: true },
          _count: { _all: true },
        }),
        prisma.pedido.count({ where: { estado_pedido: { nombre: 'Pendiente' } } }),
        prisma.pedido.count({ where: { estado_pedido: { nombre: 'En proceso' } } }),
        prisma.pago.count({
          where: { estado: 'Pendiente', pedido: { ...noAnulado, metodo_pago: { nombre: 'Yape' } } },
        }),
        prisma.usuario.count({ where: { rol: { nombre: 'Cliente' }, fecha_registro: { gte: inicioMes } } }),
        prisma.$queryRaw`
          SELECT to_char(p.fecha_pedido AT TIME ZONE 'America/Lima', 'YYYY-MM-DD') AS dia,
                 SUM(p.total)::float AS total,
                 COUNT(*)::int       AS pedidos
          FROM pedido p
          JOIN estado_pedido e ON e.id_estado_pedido = p.id_estado_pedido
          WHERE e.nombre <> 'Anulado' AND p.fecha_pedido >= ${desdeGrafico}
          GROUP BY 1
          ORDER BY 1`,
        prisma.detalle_pedido.groupBy({
          by: ['id_producto'],
          where: { pedido: { ...noAnulado, fecha_pedido: { gte: desdeTop } } },
          _sum: { cantidad: true },
          orderBy: { _sum: { cantidad: 'desc' } },
          take: 5,
        }),
        prisma.producto.findMany({
          where: { estado: true, stock: { lte: 6 } },
          orderBy: { stock: 'asc' },
          take: 8,
          select: { id_producto: true, nombre: true, stock: true },
        }),
        prisma.pedido.findMany({
          orderBy: { fecha_pedido: 'desc' },
          take: 5,
          include: { usuario: true, estado_pedido: true },
        }),
      ]);

    // Nombres de los más vendidos
    const nombres = await prisma.producto.findMany({
      where: { id_producto: { in: top.map((t) => t.id_producto) } },
      select: { id_producto: true, nombre: true },
    });
    const nombrePorId = new Map(nombres.map((n) => [n.id_producto, n.nombre]));

    return {
      hoy: resumen(hoy),
      mes: resumen(mes),
      pendientes,
      enProceso,
      yapePorVerificar,
      clientesNuevos,
      ventasPorDia,
      masVendidos: top.map((t) => ({
        id: t.id_producto,
        nombre: nombrePorId.get(t.id_producto) ?? '(eliminado)',
        unidades: t._sum.cantidad,
      })),
      stockBajo: stockBajo.map((p) => ({ id: p.id_producto, nombre: p.nombre, stock: p.stock })),
      ultimosPedidos: ultimos.map((p) => ({
        id: p.id_pedido,
        fecha: p.fecha_pedido,
        cliente: `${p.usuario.nombres} ${p.usuario.apellidos}`,
        total: Number(p.total),
        estado: p.estado_pedido.nombre,
      })),
    };
  }
}

module.exports = PrismaDashboardRepository;