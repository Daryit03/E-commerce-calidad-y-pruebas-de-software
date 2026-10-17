const prisma = require('../../config/db.config');
const CarritoRepository = require('../../domain/carrito/CarritoRepository');

// Un producto se puede vender si él, su marca, subcategoría y categoría están activos
const productoVendible = {
  estado: true,
  marca: { estado: true },
  subcategoria: { estado: true, categoria: { estado: true } },
};

const carritoActivo = (idUsuario) =>
  prisma.carrito.findFirst({ where: { id_usuario: idUsuario, estado: true } });

async function obtenerOCrearCarrito(idUsuario) {
  const existente = await carritoActivo(idUsuario);
  if (existente) return existente;
  try {
    return await prisma.carrito.create({ data: { id_usuario: idUsuario } });
  } catch (e) {
    // Si dos peticiones lo crean a la vez, el índice único de la BD frena la segunda
    if (e.code === 'P2002') return carritoActivo(idUsuario);
    throw e;
  }
}

class PrismaCarritoRepository extends CarritoRepository {
  async listarItems(idUsuario) {
    const carrito = await prisma.carrito.findFirst({
      where: { id_usuario: idUsuario, estado: true },
      include: {
        detalle_carrito: {
          orderBy: { id_detalle_carrito: 'asc' },
          include: {
            producto: {
              include: {
                marca: true,
                subcategoria: { include: { categoria: true } },
                imagen_producto: { where: { estado: true }, orderBy: { es_principal: 'desc' }, take: 1 },
              },
            },
          },
        },
      },
    });
    if (!carrito) return [];

    return carrito.detalle_carrito.map((d) => {
      const p = d.producto;
      return {
        idProducto: p.id_producto,
        nombre: p.nombre,
        marca: p.marca.nombre,
        imagen: p.imagen_producto[0]?.url_cloudinary ?? null,
        precio: Number(p.precio), // precio ACTUAL del producto
        stock: p.stock,
        publicado: p.estado && p.marca.estado && p.subcategoria.estado && p.subcategoria.categoria.estado,
        cantidad: d.cantidad,
      };
    });
  }

  async buscarProductoVendible(idProducto) {
    const p = await prisma.producto.findFirst({
      where: { id_producto: idProducto, ...productoVendible },
      select: { id_producto: true, nombre: true, precio: true, stock: true },
    });
    return p ? { id: p.id_producto, nombre: p.nombre, precio: Number(p.precio), stock: p.stock } : null;
  }

  async cantidadEnCarrito(idUsuario, idProducto) {
    const d = await prisma.detalle_carrito.findFirst({
      where: { id_producto: idProducto, carrito: { id_usuario: idUsuario, estado: true } },
    });
    return d ? d.cantidad : 0;
  }

  async guardarItem(idUsuario, { idProducto, cantidad, precio }) {
    const carrito = await obtenerOCrearCarrito(idUsuario);
    const existente = await prisma.detalle_carrito.findFirst({
      where: { id_carrito: carrito.id_carrito, id_producto: idProducto },
    });

    await prisma.$transaction([
      existente
        ? prisma.detalle_carrito.update({
            where: { id_detalle_carrito: existente.id_detalle_carrito },
            data: { cantidad, precio_unitario: precio },
          })
        : prisma.detalle_carrito.create({
            data: { id_carrito: carrito.id_carrito, id_producto: idProducto, cantidad, precio_unitario: precio },
          }),
      prisma.carrito.update({
        where: { id_carrito: carrito.id_carrito },
        data: { fecha_actualizacion: new Date() },
      }),
    ]);
  }

  async eliminarItem(idUsuario, idProducto) {
    const r = await prisma.detalle_carrito.deleteMany({
      where: { id_producto: idProducto, carrito: { id_usuario: idUsuario, estado: true } },
    });
    return r.count;
  }

  async vaciar(idUsuario) {
    await prisma.detalle_carrito.deleteMany({
      where: { carrito: { id_usuario: idUsuario, estado: true } },
    });
  }
}

module.exports = PrismaCarritoRepository;