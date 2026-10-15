class ProductoRepository {
  async buscar(filtros) { throw new Error('No implementado'); }
  async buscarPorId(id) { throw new Error('No implementado'); }
  async listarDestacados(limite) { throw new Error('No implementado'); }
  async listarMarcasDeSubcategoria(idSubcategoria) { throw new Error('No implementado'); }
}

module.exports = ProductoRepository;