const { ValidacionError, NoEncontradoError } = require('../../domain/errors');
const Carrito = require('../../domain/carrito/Carrito');

const MAX_POR_PRODUCTO = 99;
const entero = (v) => {
  const n = Number(v);
  return Number.isInteger(n) ? n : NaN;
};

function crearCasosDeUsoCarrito({ carritoRepository }) {
  async function obtener(idUsuario) {
    return new Carrito(await carritoRepository.listarItems(idUsuario)).aJSON();
  }

  function validarIds(idProducto, cantidad) {
    if (!(idProducto > 0)) throw new ValidacionError('Producto inválido');
    if (!(cantidad >= 1)) throw new ValidacionError('La cantidad debe ser al menos 1');
  }

  return {
    // RF0031 - Ver el carrito
    obtener,

    // RF0029 / RF0030 - Agregar (si ya está, suma la cantidad)
    async agregar(idUsuario, datos = {}) {
      const idProducto = entero(datos.idProducto);
      const cantidad = datos.cantidad === undefined ? 1 : entero(datos.cantidad);
      validarIds(idProducto, cantidad);

      const producto = await carritoRepository.buscarProductoVendible(idProducto);
      if (!producto) throw new NoEncontradoError('Este producto no existe o ya no está disponible');
      if (producto.stock === 0) throw new ValidacionError('Este producto está agotado');

      const actual = await carritoRepository.cantidadEnCarrito(idUsuario, idProducto);
      const limite = Math.min(producto.stock, MAX_POR_PRODUCTO);
      const nueva = actual + cantidad;

      if (nueva > limite) {
        throw new ValidacionError(
          actual > 0
            ? `Solo puedes llevar ${limite} unidades de este producto y ya tienes ${actual} en tu carrito.`
            : `Solo hay ${limite} unidades disponibles.`
        );
      }

      await carritoRepository.guardarItem(idUsuario, { idProducto, cantidad: nueva, precio: producto.precio });
      return { mensaje: `"${producto.nombre}" se agregó a tu carrito.`, carrito: await obtener(idUsuario) };
    },

    // RF0032 - Cambiar la cantidad
    async actualizarCantidad(idUsuario, idProductoParam, datos = {}) {
      const idProducto = entero(idProductoParam);
      const cantidad = entero(datos.cantidad);
      validarIds(idProducto, cantidad);

      if ((await carritoRepository.cantidadEnCarrito(idUsuario, idProducto)) === 0)
        throw new NoEncontradoError('Este producto no está en tu carrito');

      const producto = await carritoRepository.buscarProductoVendible(idProducto);
      if (!producto) throw new ValidacionError('Este producto ya no está disponible. Elimínalo de tu carrito.');

      const limite = Math.min(producto.stock, MAX_POR_PRODUCTO);
      if (cantidad > limite) throw new ValidacionError(`Solo hay ${limite} unidades disponibles.`);

      await carritoRepository.guardarItem(idUsuario, { idProducto, cantidad, precio: producto.precio });
      return { carrito: await obtener(idUsuario) };
    },

    // RF0032 - Eliminar un producto
    async eliminar(idUsuario, idProductoParam) {
      const idProducto = entero(idProductoParam);
      if (!(idProducto > 0)) throw new ValidacionError('Producto inválido');

      const borrados = await carritoRepository.eliminarItem(idUsuario, idProducto);
      if (!borrados) throw new NoEncontradoError('Este producto no está en tu carrito');
      return { mensaje: 'Producto eliminado del carrito.', carrito: await obtener(idUsuario) };
    },

    async vaciar(idUsuario) {
      await carritoRepository.vaciar(idUsuario);
      return { mensaje: 'Tu carrito quedó vacío.', carrito: await obtener(idUsuario) };
    },
  };
}

module.exports = { crearCasosDeUsoCarrito };