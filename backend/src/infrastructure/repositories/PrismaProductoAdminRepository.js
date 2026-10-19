const prisma = require('../../config/db.config');
const ProductoAdminRepository = require('../../domain/producto/ProductoAdminRepository');
const { ConflictoError } = require('../../domain/errors');

const ordenImagenes = [{ es_principal: 'desc' }, { id_imagen: 'asc' }];

const datosBase = (p) => ({
  nombre: p.nombre,
  descripcion: p.descripcion,
  precio: p.precio.toFixed(2),
  stock: p.stock,
  estado: p.estado,
  destacado: p.destacado,
  id_subcategoria: p.idSubcategoria,
  id_marca: p.idMarca,
});
const fichaParaCrear = (p) => p.ficha.map((c, i) => ({ nombre: c.nombre, valor: c.valor, orden: i + 1 }));
const imagenesParaCrear = (p) =>
  p.imagenes.map((i) => ({ url_cloudinary: i.url, public_id_cloudinary: i.publicId, es_principal: i.esPrincipal }));

class PrismaProductoAdminRepository extends ProductoAdminRepository {
  async listar({ q, estado, pagina, limite }) {
    const where = {
      ...(q && {
        OR: [
          { nombre: { contains: q, mode: 'insensitive' } },
          { marca: { nombre: { contains: q, mode: 'insensitive' } } },
        ],
      }),
      ...(estado === 'activos' && { estado: true }),
      ...(estado === 'inactivos' && { estado: false }),
    };

    const [total, filas] = await prisma.$transaction([
      prisma.producto.count({ where }),
      prisma.producto.findMany({
        where,
        orderBy: { id_producto: 'desc' },
        skip: (pagina - 1) * limite,
        take: limite,
        include: {
          marca: true,
          subcategoria: { include: { categoria: true } },
          imagen_producto: { where: { estado: true }, orderBy: ordenImagenes, take: 1 },
        },
      }),
    ]);

    return {
      total,
      pagina,
      limite,
      totalPaginas: Math.max(1, Math.ceil(total / limite)),
      productos: filas.map((f) => ({
        id: f.id_producto,
        nombre: f.nombre,
        marca: f.marca.nombre,
        categoria: f.subcategoria.categoria.nombre,
        subcategoria: f.subcategoria.nombre,
        precio: Number(f.precio),
        stock: f.stock,
        estado: f.estado,
        destacado: f.destacado,
        imagen: f.imagen_producto[0]?.url_cloudinary ?? null,
      })),
    };
  }

  async buscarPorId(id) {
    const f = await prisma.producto.findUnique({
      where: { id_producto: id },
      include: {
        subcategoria: true,
        caracteristica_producto: { orderBy: { orden: 'asc' } },
        imagen_producto: { where: { estado: true }, orderBy: ordenImagenes },
      },
    });
    if (!f) return null;
    return {
      id: f.id_producto,
      nombre: f.nombre,
      descripcion: f.descripcion,
      precio: Number(f.precio),
      stock: f.stock,
      estado: f.estado,
      destacado: f.destacado,
      idSubcategoria: f.id_subcategoria,
      idCategoria: f.subcategoria.id_categoria,
      idMarca: f.id_marca,
      ficha: f.caracteristica_producto.map((c) => ({ nombre: c.nombre, valor: c.valor })),
      imagenes: f.imagen_producto.map((i) => ({
        url: i.url_cloudinary,
        publicId: i.public_id_cloudinary,
        esPrincipal: i.es_principal,
      })),
    };
  }

  async crear(p) {
    const f = await prisma.producto.create({
      data: {
        ...datosBase(p),
        caracteristica_producto: { create: fichaParaCrear(p) },
        imagen_producto: { create: imagenesParaCrear(p) },
      },
    });
    return f.id_producto;
  }

  async actualizar(id, p) {
    return prisma.$transaction(async (tx) => {
      const antes = await tx.imagen_producto.findMany({ where: { id_producto: id } });

      await tx.caracteristica_producto.deleteMany({ where: { id_producto: id } });
      await tx.imagen_producto.deleteMany({ where: { id_producto: id } });
      await tx.producto.update({
        where: { id_producto: id },
        data: {
          ...datosBase(p),
          fecha_actualizacion: new Date(),
          caracteristica_producto: { create: fichaParaCrear(p) },
          imagen_producto: { create: imagenesParaCrear(p) },
        },
      });

      // Fotos que estaban antes y ya no están → se borrarán de Cloudinary
      const siguen = new Set(p.imagenes.map((i) => i.publicId).filter(Boolean));
      return antes.map((i) => i.public_id_cloudinary).filter((pid) => pid && !siguen.has(pid));
    });
  }

  async actualizarCampos(id, datos) {
    const f = await prisma.producto.update({
      where: { id_producto: id },
      data: { ...datos, fecha_actualizacion: new Date() },
    });
    return { id: f.id_producto, nombre: f.nombre };
  }

  async tieneVentas(id) {
    return (await prisma.detalle_pedido.count({ where: { id_producto: id } })) > 0;
  }

  async eliminar(id) {
    try {
      return await prisma.$transaction(async (tx) => {
        const imagenes = await tx.imagen_producto.findMany({ where: { id_producto: id } });
        await tx.detalle_carrito.deleteMany({ where: { id_producto: id } }); // lo saca de los carritos
        await tx.imagen_producto.deleteMany({ where: { id_producto: id } });
        await tx.caracteristica_producto.deleteMany({ where: { id_producto: id } });
        await tx.producto.delete({ where: { id_producto: id } });
        return imagenes.map((i) => i.public_id_cloudinary).filter(Boolean);
      });
    } catch (e) {
      // P2003 = otra tabla aún lo usa (por ejemplo, se vendió justo ahora)
      if (e.code === 'P2003') throw new ConflictoError('El producto está en uso y no se puede eliminar. Desactívalo.');
      throw e;
    }
  }
}

module.exports = PrismaProductoAdminRepository;