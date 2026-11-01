const Producto = require('../../domain/producto/Producto');
const ProductoRepository = require('../../domain/producto/ProductoRepository');

// Lo que se necesita para mostrar una tarjeta
const INCLUDE_TARJETA = {
  marca: true,
  imagen_producto: { where: { estado: true }, orderBy: { es_principal: 'desc' } },
};

// Solo productos publicados, de categoría, subcategoría y marca activas
function wherePublicado() {
  return {
    estado: true,
    marca: { estado: true },
    subcategoria: { estado: true, categoria: { estado: true } },
  };
}

// Convierte una fila de la base de datos en una entidad del dominio
function aEntidad(f) {
  return new Producto({
    id: f.id_producto,
    nombre: f.nombre,
    descripcion: f.descripcion,
    precio: Number(f.precio), // Prisma devuelve los DECIMAL como objeto; aquí lo pasamos a número
    stock: f.stock,
    destacado: f.destacado,
    marca: f.marca ? { id: f.marca.id_marca, nombre: f.marca.nombre } : null,
    subcategoria: f.subcategoria
      ? { id: f.subcategoria.id_subcategoria, nombre: f.subcategoria.nombre }
      : null,
    categoria: f.subcategoria && f.subcategoria.categoria
      ? { id: f.subcategoria.categoria.id_categoria, nombre: f.subcategoria.categoria.nombre }
      : null,
    imagenes: (f.imagen_producto || []).map((i) => ({
      url: i.url_cloudinary,
      esPrincipal: i.es_principal,
    })),
    ficha: (f.caracteristica_producto || []).map((c) => ({
      nombre: c.nombre,
      valor: c.valor,
    })),
  });
}

class PrismaProductoRepository extends ProductoRepository {
  constructor(prisma) {
    super();
    this.prisma = prisma;
  }

  async buscar(f) {
    const where = wherePublicado();

    // RF0018: búsqueda por nombre (o marca), sin importar mayúsculas ni tildes
    if (f.texto) where.id_producto = { in: await this.idsPorTexto(f.texto) };
    if (f.idCategoria) where.subcategoria.id_categoria = f.idCategoria;
    if (f.idSubcategoria) where.id_subcategoria = f.idSubcategoria;
    if (f.idsMarca && f.idsMarca.length) where.id_marca = { in: f.idsMarca };
    if (f.precioMin != null || f.precioMax != null) {
      where.precio = {};
      if (f.precioMin != null) where.precio.gte = f.precioMin;
      if (f.precioMax != null) where.precio.lte = f.precioMax;
    }

    // RF0020: ordenar por precio o alfabéticamente
    const ordenes = {
      'precio-asc': { precio: 'asc' },
      'precio-desc': { precio: 'desc' },
      az: { nombre: 'asc' },
      za: { nombre: 'desc' },
    };
    const orderBy = ordenes[f.orden] || [{ destacado: 'desc' }, { nombre: 'asc' }];

    // Trae la página de productos y el total al mismo tiempo
    const [filas, total] = await this.prisma.$transaction([
      this.prisma.producto.findMany({
        where,
        orderBy,
        skip: (f.pagina - 1) * f.limite,
        take: f.limite,
        include: INCLUDE_TARJETA,
      }),
      this.prisma.producto.count({ where }),
    ]);

    return { productos: filas.map(aEntidad), total };
  }

  // Ids de productos cuyo nombre o marca contienen el texto, ignorando tildes y mayúsculas
  async idsPorTexto(texto) {
    // % y _ son comodines en SQL: se escapan para buscarlos como texto normal
    const patron = `%${texto.replace(/[\\%_]/g, (c) => '\\' + c)}%`;
    const filas = await this.prisma.$queryRaw`
      SELECT p.id_producto
      FROM producto p
      JOIN marca m ON m.id_marca = p.id_marca
      WHERE unaccent(p.nombre) ILIKE unaccent(${patron})
         OR unaccent(m.nombre) ILIKE unaccent(${patron})`;
    return filas.map((f) => f.id_producto);
  }

  async buscarPorId(id) {
    const fila = await this.prisma.producto.findFirst({
      where: { ...wherePublicado(), id_producto: id },
      include: {
        ...INCLUDE_TARJETA,
        subcategoria: { include: { categoria: true } },
        caracteristica_producto: { orderBy: { orden: 'asc' } },
      },
    });
    return fila ? aEntidad(fila) : null;
  }

  async listarDestacados(limite) {
    const filas = await this.prisma.producto.findMany({
      where: { ...wherePublicado(), destacado: true },
      orderBy: { nombre: 'asc' },
      take: limite,
      include: INCLUDE_TARJETA,
    });
    return filas.map(aEntidad);
  }

  async listarMarcasDeSubcategoria(idSubcategoria) {
    const marcas = await this.prisma.marca.findMany({
      where: {
        estado: true,
        producto: { some: { id_subcategoria: idSubcategoria, estado: true } },
      },
      orderBy: { nombre: 'asc' },
    });
    return marcas.map((m) => ({ id: m.id_marca, nombre: m.nombre }));
  }

  // Los últimos productos registrados (para "Nuevos productos" del inicio)
  async listarNuevos(limite) {
    const filas = await this.prisma.producto.findMany({
      where: wherePublicado(),
      orderBy: { fecha_registro: 'desc' },
      take: limite,
      include: INCLUDE_TARJETA,
    });
    return filas.map(aEntidad);
  }

  // Marcas activas que tienen al menos un producto publicado
  async listarMarcasTienda() {
    const marcas = await this.prisma.marca.findMany({
      where: {
        estado: true,
        producto: { some: { estado: true, subcategoria: { estado: true, categoria: { estado: true } } } },
      },
      orderBy: { nombre: 'asc' },
    });
    return marcas.map((m) => ({ id: m.id_marca, nombre: m.nombre }));
  }
}

module.exports = PrismaProductoRepository;