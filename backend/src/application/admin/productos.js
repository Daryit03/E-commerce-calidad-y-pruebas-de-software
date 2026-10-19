const { ValidacionError, NoEncontradoError, ConflictoError } = require('../../domain/errors');
const { normalizarProducto, validarProducto, ordenarImagenes } = require('../../domain/producto/validacionesProducto');

const idValido = (v) => {
  const n = Number(v);
  if (!Number.isInteger(n) || n <= 0) throw new ValidacionError('Producto inválido');
  return n;
};

function crearCasosDeUsoAdminProductos({ productoAdminRepository: repo, clasificacionRepository, almacenImagenes }) {
  // Valida campos + que la subcategoría y la marca existan
  async function prepararProducto(datos) {
    const p = normalizarProducto(datos);
    const errores = validarProducto(p);
    if (!errores.idSubcategoria && !(await clasificacionRepository.buscar('subcategoria', p.idSubcategoria)))
      errores.idSubcategoria = 'La subcategoría no existe';
    if (!errores.idMarca && !(await clasificacionRepository.buscar('marca', p.idMarca)))
      errores.idMarca = 'La marca no existe';
    if (Object.keys(errores).length) throw new ValidacionError('Revisa los datos del producto', errores);
    p.imagenes = ordenarImagenes(p.imagenes);
    return p;
  }

  async function existente(idParam) {
    const id = idValido(idParam);
    const producto = await repo.buscarPorId(id);
    if (!producto) throw new NoEncontradoError('El producto no existe');
    return producto;
  }

  return {
    listar(params = {}) {
      const estado = ['activos', 'inactivos'].includes(params.estado) ? params.estado : 'todos';
      const pagina = Math.max(1, parseInt(params.pagina, 10) || 1);
      return repo.listar({ q: String(params.q ?? '').trim().slice(0, 100), estado, pagina, limite: 20 });
    },

    obtener: (idParam) => existente(idParam),

    // HO12 - RF0055, RF0056, RF0057
    async crear(datos) {
      const p = await prepararProducto(datos);
      const id = await repo.crear(p);
      return { mensaje: `El producto "${p.nombre}" se registró correctamente.`, producto: await repo.buscarPorId(id) };
    },

    // HO13 - RF0058
    async actualizar(idParam, datos) {
      const { id } = await existente(idParam);
      const p = await prepararProducto(datos);
      const imagenesQuitadas = await repo.actualizar(id, p);
      await almacenImagenes.eliminar(imagenesQuitadas); // borra de Cloudinary las fotos que se quitaron
      return { mensaje: `El producto "${p.nombre}" se actualizó correctamente.`, producto: await repo.buscarPorId(id) };
    },

    // RF0059 - Activar / desactivar
    async cambiarEstado(idParam, datos = {}) {
      const { id } = await existente(idParam);
      if (typeof datos.estado !== 'boolean') throw new ValidacionError('Indica si se activa o se desactiva');
      const r = await repo.actualizarCampos(id, { estado: datos.estado });
      return {
        mensaje: datos.estado
          ? `"${r.nombre}" ahora está publicado en la tienda.`
          : `"${r.nombre}" se desactivó y ya no se muestra en la tienda.`,
      };
    },

    // RF0071 - Destacado
    async cambiarDestacado(idParam, datos = {}) {
      const { id } = await existente(idParam);
      if (typeof datos.destacado !== 'boolean') throw new ValidacionError('Indica si se marca o desmarca');
      const r = await repo.actualizarCampos(id, { destacado: datos.destacado });
      return {
        mensaje: datos.destacado
          ? `"${r.nombre}" se marcó como destacado.`
          : `"${r.nombre}" ya no es destacado.`,
      };
    },

    // RF0059 - Eliminar (solo si nunca se vendió)
    async eliminar(idParam) {
      const { id, nombre } = await existente(idParam);
      if (await repo.tieneVentas(id))
        throw new ConflictoError(
          'Este producto tiene ventas registradas y no se puede eliminar. Desactívalo para que deje de mostrarse en la tienda.'
        );
      const imagenes = await repo.eliminar(id);
      await almacenImagenes.eliminar(imagenes);
      return { mensaje: `El producto "${nombre}" se eliminó.` };
    },

    async subirImagenes(archivos) {
      if (!archivos?.length) throw new ValidacionError('Selecciona al menos una imagen');
      const imagenes = await Promise.all(archivos.map((a) => almacenImagenes.subir(a.buffer)));
      return { imagenes };
    },
  };
}

module.exports = { crearCasosDeUsoAdminProductos };