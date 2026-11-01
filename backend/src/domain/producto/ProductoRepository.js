class ProductoRepository {
  async buscar(filtros) { throw new Error('No implementado'); }
  async buscarPorId(id) { throw new Error('No implementado'); }
  async listarDestacados(limite) { throw new Error('No implementado'); }
  async listarNuevos(limite) { throw new Error('No implementado'); }
  async listarMarcasTienda() { throw new Error('No implementado'); }
}

module.exports = ProductoRepository;