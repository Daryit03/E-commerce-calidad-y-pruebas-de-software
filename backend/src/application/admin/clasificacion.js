const { ValidacionError, NoEncontradoError, ConflictoError } = require('../../domain/errors');
const { validarClasificacion } = require('../../domain/clasificacion/validaciones');

const NOMBRES = { categoria: 'La categoría', subcategoria: 'La subcategoría', marca: 'La marca' };
const UNA = { categoria: 'una categoría', subcategoria: 'una subcategoría', marca: 'una marca' };

const limpiar = (v) => String(v ?? '').trim().replace(/\s+/g, ' ');
const idValido = (v) => {
  const n = Number(v);
  if (!Number.isInteger(n) || n <= 0) throw new ValidacionError('Identificador inválido');
  return n;
};

function crearCasosDeUsoClasificacion({ clasificacionRepository: repo }) {
  async function verificarNombreLibre(tipo, nombre, opciones) {
    if (await repo.existeNombre(tipo, nombre, opciones)) {
      const donde = tipo === 'subcategoria' ? ' en esta categoría' : '';
      throw new ConflictoError(`Ya existe ${UNA[tipo]} con ese nombre${donde}`, {
        nombre: `Este nombre ya está registrado${donde}`,
      });
    }
  }

  return {
    listarCategorias: () => repo.listarCategorias(),
    listarMarcas: () => repo.listarMarcas(),

    // RF0072 - Registrar
    async crear(tipo, datos = {}) {
      const d = { nombre: limpiar(datos.nombre), descripcion: limpiar(datos.descripcion) || null };
      const errores = validarClasificacion(d);

      let idCategoria = null;
      if (tipo === 'subcategoria') {
        idCategoria = Number(datos.idCategoria);
        if (!Number.isInteger(idCategoria) || !(await repo.buscar('categoria', idCategoria)))
          errores.idCategoria = 'Elige una categoría válida';
      }
      if (Object.keys(errores).length) throw new ValidacionError('Revisa los datos', errores);

      await verificarNombreLibre(tipo, d.nombre, { idCategoria });
      const item = await repo.crear(tipo, { ...d, idCategoria });
      return { mensaje: `${NOMBRES[tipo]} "${item.nombre}" se registró correctamente.`, item };
    },

    // RF0073 - Editar nombre y descripción
    async editar(tipo, idParam, datos = {}) {
      const id = idValido(idParam);
      const actual = await repo.buscar(tipo, id);
      if (!actual) throw new NoEncontradoError(`${NOMBRES[tipo]} no existe`);

      const d = { nombre: limpiar(datos.nombre), descripcion: limpiar(datos.descripcion) || null };
      const errores = validarClasificacion(d);
      if (Object.keys(errores).length) throw new ValidacionError('Revisa los datos', errores);

      await verificarNombreLibre(tipo, d.nombre, { idCategoria: actual.idCategoria, excluirId: id });
      const item = await repo.actualizar(tipo, id, d);
      return { mensaje: `${NOMBRES[tipo]} se actualizó correctamente.`, item };
    },

    // RF0074 - Activar / desactivar (no borra productos)
    async cambiarEstado(tipo, idParam, datos = {}) {
      const id = idValido(idParam);
      if (typeof datos.estado !== 'boolean') throw new ValidacionError('Indica si se activa o se desactiva');
      if (!(await repo.buscar(tipo, id))) throw new NoEncontradoError(`${NOMBRES[tipo]} no existe`);

      const item = await repo.actualizar(tipo, id, { estado: datos.estado });
      return {
        mensaje: datos.estado
          ? `${NOMBRES[tipo]} "${item.nombre}" se activó.`
          : `${NOMBRES[tipo]} "${item.nombre}" se desactivó. Sus productos siguen guardados, pero no se mostrarán en la tienda.`,
        item,
      };
    },
  };
}

module.exports = { crearCasosDeUsoClasificacion };