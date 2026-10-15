const { NoEncontradoError, ValidacionError } = require('../../domain/errors');

const ORDENES = ['relevancia', 'precio-asc', 'precio-desc', 'az', 'za'];

function aEntero(valor) {
  const n = parseInt(valor, 10);
  return Number.isInteger(n) && n > 0 ? n : null;
}

function aNumero(valor) {
  if (valor === undefined || valor === '') return null;
  const n = Number(valor);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

// RF0024: tarjeta con imagen, título y precio
function aTarjeta(p) {
  return {
    id: p.id,
    nombre: p.nombre,
    marca: p.marca ? p.marca.nombre : null,
    precio: p.precio,
    destacado: p.destacado,
    disponible: p.estaDisponible(),
    disponibilidad: p.disponibilidad(),
    imagen: p.imagenPrincipal(),
  };
}

function crearCasosDeUsoCatalogo({ productoRepository, categoriaRepository }) {
  return {
    // HO3 (RF0016): categorías y subcategorías
    async listarCategorias() {
      return categoriaRepository.listarActivas();
    },

    // HO3 (RF0014): productos destacados del inicio
    async listarDestacados() {
      const productos = await productoRepository.listarDestacados(8);
      return productos.map(aTarjeta);
    },

    // HO4 y HO5: buscar, filtrar, ordenar y paginar
    async buscarProductos(params) {
      const pagina = Math.max(1, parseInt(params.pagina, 10) || 1);
      const limite = Math.min(48, Math.max(1, parseInt(params.limite, 10) || 12));
      const orden = params.orden || 'relevancia';
      if (!ORDENES.includes(orden)) {
        throw new ValidacionError('Orden no válido');
      }

      const filtros = {
        texto: String(params.q || '').trim(),
        idCategoria: aEntero(params.categoria),
        idSubcategoria: aEntero(params.subcategoria),
        orden,
        pagina,
        limite,
      };

      // RF0019: marca y precio solo se aplican dentro de una subcategoría
      if (filtros.idSubcategoria) {
        filtros.idsMarca = params.marca
          ? String(params.marca).split(',').map(aEntero).filter(Boolean)
          : [];
        filtros.precioMin = aNumero(params.precioMin);
        filtros.precioMax = aNumero(params.precioMax);
        if (filtros.precioMin !== null && filtros.precioMax !== null
            && filtros.precioMin > filtros.precioMax) {
          throw new ValidacionError('El precio mínimo no puede ser mayor que el máximo');
        }
      }

      const { productos, total } = await productoRepository.buscar(filtros);
      return {
        total,
        pagina,
        limite,
        totalPaginas: Math.ceil(total / limite),
        productos: productos.map(aTarjeta), // RF0022: si está vacío, el frontend muestra el mensaje
      };
    },

    // Marcas disponibles dentro de una subcategoría (para los filtros)
    async listarMarcasDeSubcategoria(idSubcategoria) {
      const id = aEntero(idSubcategoria);
      if (!id) throw new ValidacionError('Indica una subcategoría válida');
      return productoRepository.listarMarcasDeSubcategoria(id);
    },

    // HO6: detalle del producto con su ficha técnica
    async obtenerDetalleProducto(idProducto) {
      const id = aEntero(idProducto);
      if (!id) throw new ValidacionError('Id de producto no válido');

      const p = await productoRepository.buscarPorId(id);
      if (!p) throw new NoEncontradoError('Producto no encontrado');

      return {
        ...aTarjeta(p),
        descripcion: p.descripcion,
        stock: p.stock,
        categoria: p.categoria,
        subcategoria: p.subcategoria,
        imagenes: p.imagenes,
        ficha: p.ficha,
      };
    },
  };
}

module.exports = crearCasosDeUsoCatalogo;