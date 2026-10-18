const prisma = require('../../config/db.config');
const PedidoRepository = require('../../domain/pedido/PedidoRepository');
const { ValidacionError, ConflictoError } = require('../../domain/errors');

const dinero = (n) => Number(n).toFixed(2); // Prisma guarda NUMERIC exacto desde texto

const aMetodo = (m) => ({
  id: m.id_metodo_pago,
  nombre: m.nombre,
  descripcion: m.descripcion,
  comisionPorcentaje: Number(m.comision_porcentaje),
  tipoEntrega: m.tipo_entrega,
  estado: m.estado,
});

const aDireccion = (d) => ({
  id: d.id_direccion,
  departamento: d.departamento,
  provincia: d.provincia,
  distrito: d.distrito,
  direccion: d.direccion,
  referencia: d.referencia,
  esPrincipal: d.es_principal,
});

class PrismaPedidoRepository extends PedidoRepository {
  async listarMetodosPago() {
    const filas = await prisma.metodo_pago.findMany({ where: { estado: true }, orderBy: { id_metodo_pago: 'asc' } });
    return filas.map(aMetodo);
  }

  async buscarMetodoPago(id) {
    const m = await prisma.metodo_pago.findUnique({ where: { id_metodo_pago: id } });
    return m ? aMetodo(m) : null;
  }

  async listarDirecciones(idUsuario) {
    const filas = await prisma.direccion.findMany({
      where: { id_usuario: idUsuario, estado: true },
      orderBy: [{ es_principal: 'desc' }, { id_direccion: 'desc' }],
    });
    return filas.map(aDireccion);
  }

  // Solo devuelve la dirección si pertenece a ese usuario
  async buscarDireccion(idUsuario, idDireccion) {
    const d = await prisma.direccion.findFirst({
      where: { id_direccion: idDireccion, id_usuario: idUsuario, estado: true },
    });
    return d ? aDireccion(d) : null;
  }

  async registrar({ idUsuario, tipoEntrega, idDireccion, nuevaDireccion, idMetodoPago, items, totales, pago }) {
    try {
      return await prisma.$transaction(async (tx) => {
        // 1) Descontar stock solo si alcanza
        for (const i of items) {
          const r = await tx.producto.updateMany({
            where: { id_producto: i.idProducto, stock: { gte: i.cantidad } },
            data: { stock: { decrement: i.cantidad }, fecha_actualizacion: new Date() },
          });
          if (r.count === 0) throw new ValidacionError(`Ya no hay stock suficiente de "${i.nombre}". Revisa tu carrito.`);
        }

        // 2) Guardar la dirección nueva (la primera queda como principal)
        let id_direccion = tipoEntrega === 'Delivery' ? idDireccion : null;
        if (tipoEntrega === 'Delivery' && !id_direccion) {
          const hayPrincipal = await tx.direccion.count({ where: { id_usuario: idUsuario, es_principal: true } });
          const nueva = await tx.direccion.create({
            data: {
              id_usuario: idUsuario,
              departamento: nuevaDireccion.departamento,
              provincia: nuevaDireccion.provincia,
              distrito: nuevaDireccion.distrito,
              direccion: nuevaDireccion.direccion,
              referencia: nuevaDireccion.referencia || null,
              es_principal: hayPrincipal === 0,
            },
          });
          id_direccion = nueva.id_direccion;
        }

        // 3) Estado inicial
        const pendiente = await tx.estado_pedido.findUnique({ where: { nombre: 'Pendiente' } });

        // 4) Pedido + detalle + historial + pago
        const pedido = await tx.pedido.create({
          data: {
            id_usuario: idUsuario,
            id_direccion,
            id_estado_pedido: pendiente.id_estado_pedido,
            id_metodo_pago: idMetodoPago,
            tipo_entrega: tipoEntrega,
            subtotal: dinero(totales.subtotal),
            comision: dinero(totales.comision),
            costo_envio: dinero(totales.costoEnvio),
            total: dinero(totales.total),
            detalle_pedido: {
              create: items.map((i) => ({
                id_producto: i.idProducto,
                cantidad: i.cantidad,
                precio_unitario: dinero(i.precio), // precio histórico
              })),
            },
            historial_pedido: {
              create: { id_estado_pedido: pendiente.id_estado_pedido, observacion: 'Pedido registrado por el cliente' },
            },
            pago: {
              create: { monto: dinero(totales.total), estado: pago.estado, referencia: pago.referencia },
            },
          },
        });

        // 5) Cerrar el carrito (queda como historial; el próximo será uno nuevo)
        await tx.carrito.updateMany({
          where: { id_usuario: idUsuario, estado: true },
          data: { estado: false, fecha_actualizacion: new Date() },
        });

        return { id: pedido.id_pedido, fecha: pedido.fecha_pedido };
      });
    } catch (e) {
      // UNIQUE de pago.referencia: ese número de operación ya se usó
      if (e.code === 'P2002')
        throw new ConflictoError('Ese número de operación ya fue registrado en otro pedido', {
          referenciaPago: 'Este número de operación ya fue usado',
        });
      throw e;
    }
  }

  async actualizarPago(idPedido, { estado, referencia }) {
    await prisma.pago.update({ where: { id_pedido: idPedido }, data: { estado, referencia } });
  }

  async listarPorUsuario(idUsuario) {
    const filas = await prisma.pedido.findMany({
      where: { id_usuario: idUsuario },
      orderBy: { fecha_pedido: 'desc' },
      include: incluirPedido(false),
    });
    return filas.map(aPedido);
  }

  async buscarDeUsuario(idUsuario, idPedido) {
    const f = await prisma.pedido.findFirst({
      where: { id_pedido: idPedido, id_usuario: idUsuario }, // solo si es SUYO
      include: incluirPedido(true),
    });
    return f ? aPedido(f) : null;
  }
}

function incluirPedido(conHistorial) {
  return {
    estado_pedido: true,
    metodo_pago: true,
    direccion: true,
    pago: true,
    detalle_pedido: {
      orderBy: { id_detalle_pedido: 'asc' },
      include: {
        producto: {
          include: {
            marca: true,
            imagen_producto: { where: { estado: true }, orderBy: { es_principal: 'desc' }, take: 1 },
          },
        },
      },
    },
    ...(conHistorial && {
      historial_pedido: { orderBy: { fecha: 'asc' }, include: { estado_pedido: true } },
    }),
  };
}

function aPedido(f) {
  return {
    id: f.id_pedido,
    fecha: f.fecha_pedido,
    estado: f.estado_pedido.nombre,
    tipoEntrega: f.tipo_entrega,
    metodoPago: f.metodo_pago.nombre,
    pago: f.pago ? { estado: f.pago.estado, referencia: f.pago.referencia } : null,
    direccion: f.direccion
      ? `${f.direccion.direccion}, ${f.direccion.distrito}, ${f.direccion.provincia}` +
        (f.direccion.referencia ? ` (Ref.: ${f.direccion.referencia})` : '')
      : null,
    subtotal: Number(f.subtotal),
    comision: Number(f.comision),
    costoEnvio: Number(f.costo_envio),
    total: Number(f.total),
    items: f.detalle_pedido.map((d) => ({
      idProducto: d.id_producto,
      nombre: d.producto.nombre,
      marca: d.producto.marca.nombre,
      imagen: d.producto.imagen_producto[0]?.url_cloudinary ?? null,
      cantidad: d.cantidad,
      precio: Number(d.precio_unitario), // precio que se pagó
      subtotal: (Math.round(Number(d.precio_unitario) * 100) * d.cantidad) / 100,
    })),
    historial: f.historial_pedido?.map((h) => ({
      estado: h.estado_pedido.nombre,
      fecha: h.fecha,
      observacion: h.observacion,
    })),
  };
}

module.exports = PrismaPedidoRepository;