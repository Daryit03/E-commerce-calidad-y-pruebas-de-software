// tipo = 'categoria' | 'subcategoria' | 'marca'
class ClasificacionRepository {
  listarCategorias() { throw new Error('No implementado'); }
  listarMarcas() { throw new Error('No implementado'); }
  buscar(tipo, id) { throw new Error('No implementado'); }
  existeNombre(tipo, nombre, opciones) { throw new Error('No implementado'); }
  crear(tipo, datos) { throw new Error('No implementado'); }
  actualizar(tipo, id, datos) { throw new Error('No implementado'); }
}

module.exports = ClasificacionRepository;