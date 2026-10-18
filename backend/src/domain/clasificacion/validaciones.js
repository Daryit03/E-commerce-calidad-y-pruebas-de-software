function validarClasificacion({ nombre, descripcion }) {
  const e = {};
  if (!nombre) e.nombre = 'Ingresa un nombre';
  else if (nombre.length < 2 || nombre.length > 100) e.nombre = 'Debe tener entre 2 y 100 caracteres';
  if (descripcion && descripcion.length > 250) e.descripcion = 'Máximo 250 caracteres';
  return e;
}

module.exports = { validarClasificacion };