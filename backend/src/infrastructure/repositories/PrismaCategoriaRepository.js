const CategoriaRepository = require('../../domain/categoria/CategoriaRepository');

class PrismaCategoriaRepository extends CategoriaRepository {
  constructor(prisma) {
    super();
    this.prisma = prisma;
  }

  async listarActivas() {
    const filas = await this.prisma.categoria.findMany({
      where: { estado: true },
      orderBy: { nombre: 'asc' },
      include: {
        subcategoria: { where: { estado: true }, orderBy: { nombre: 'asc' } },
      },
    });

    return filas.map((c) => ({
      id: c.id_categoria,
      nombre: c.nombre,
      subcategorias: c.subcategoria.map((s) => ({ id: s.id_subcategoria, nombre: s.nombre })),
    }));
  }
}

module.exports = PrismaCategoriaRepository;