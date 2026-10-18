const prisma = require('../../config/db.config');
const ClasificacionRepository = require('../../domain/clasificacion/ClasificacionRepository');
const { ConflictoError } = require('../../domain/errors');

const ID = { categoria: 'id_categoria', subcategoria: 'id_subcategoria', marca: 'id_marca' };
// Subcategoría y marca tienen productos directos; la categoría los cuenta por sus subcategorías
const conteo = (tipo) => (tipo === 'categoria' ? undefined : { _count: { select: { producto: true } } });

function aItem(tipo, f) {
  return {
    id: f[ID[tipo]],
    nombre: f.nombre,
    descripcion: f.descripcion,
    estado: f.estado,
    ...(tipo === 'subcategoria' && { idCategoria: f.id_categoria }),
    totalProductos: f._count?.producto ?? 0,
  };
}

function duplicado(e) {
  if (e.code === 'P2002') throw new ConflictoError('Ese nombre ya está registrado', { nombre: 'Este nombre ya está registrado' });
  throw e;
}

class PrismaClasificacionRepository extends ClasificacionRepository {
  async listarCategorias() {
    const filas = await prisma.categoria.findMany({
      orderBy: { nombre: 'asc' },
      include: { subcategoria: { orderBy: { nombre: 'asc' }, include: conteo('subcategoria') } },
    });
    return filas.map((c) => {
      const subcategorias = c.subcategoria.map((s) => aItem('subcategoria', s));
      return {
        ...aItem('categoria', c),
        totalProductos: subcategorias.reduce((t, s) => t + s.totalProductos, 0),
        subcategorias,
      };
    });
  }

  async listarMarcas() {
    const filas = await prisma.marca.findMany({ orderBy: { nombre: 'asc' }, include: conteo('marca') });
    return filas.map((m) => aItem('marca', m));
  }

  async buscar(tipo, id) {
    const f = await prisma[tipo].findUnique({ where: { [ID[tipo]]: id } });
    return f ? aItem(tipo, f) : null;
  }

  async existeNombre(tipo, nombre, { idCategoria, excluirId } = {}) {
    const f = await prisma[tipo].findFirst({
      where: {
        nombre: { equals: nombre, mode: 'insensitive' },
        ...(tipo === 'subcategoria' && { id_categoria: idCategoria }),
        ...(excluirId && { NOT: { [ID[tipo]]: excluirId } }),
      },
    });
    return Boolean(f);
  }

  async crear(tipo, d) {
    try {
      const f = await prisma[tipo].create({
        data: {
          nombre: d.nombre,
          descripcion: d.descripcion,
          ...(tipo === 'subcategoria' && { id_categoria: d.idCategoria }),
        },
        include: conteo(tipo),
      });
      return aItem(tipo, f);
    } catch (e) {
      duplicado(e);
    }
  }

  async actualizar(tipo, id, datos) {
    try {
      const f = await prisma[tipo].update({ where: { [ID[tipo]]: id }, data: datos, include: conteo(tipo) });
      return aItem(tipo, f);
    } catch (e) {
      duplicado(e);
    }
  }
}

module.exports = PrismaClasificacionRepository;