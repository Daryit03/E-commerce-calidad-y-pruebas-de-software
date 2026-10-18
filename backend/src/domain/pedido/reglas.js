const TIPOS_ENTREGA = ['Delivery', 'Recojo en tienda'];
const COSTO_ENVIO = 15;
const METODO_TARJETA = 'Tarjeta';
const METODO_YAPE = 'Yape';

const aCentimos = (n) => Math.round(Number(n) * 100);

// RF0037, RF0070, RF0076
function calcularTotales({ subtotal, tipoEntrega, comisionPorcentaje }) {
  const subCent = aCentimos(subtotal);
  const comCent = Math.round((subCent * Number(comisionPorcentaje || 0)) / 100); // sobre productos, sin envío
  const envioCent = tipoEntrega === 'Delivery' ? aCentimos(COSTO_ENVIO) : 0;
  return {
    subtotal: subCent / 100,
    comision: comCent / 100,
    costoEnvio: envioCent / 100,
    total: (subCent + comCent + envioCent) / 100,
  };
}

// RF0077 - tipoEntrega null en el método = sirve para ambos
const metodoPermitido = (metodo, tipoEntrega) => !metodo.tipoEntrega || metodo.tipoEntrega === tipoEntrega;

function validarDireccion(d) {
  const e = {};
  if (!d.departamento) e.departamento = 'Ingresa el departamento';
  else if (d.departamento.length > 100) e.departamento = 'Máximo 100 caracteres';
  if (!d.provincia) e.provincia = 'Ingresa la provincia';
  else if (d.provincia.length > 100) e.provincia = 'Máximo 100 caracteres';
  if (!d.distrito) e.distrito = 'Ingresa el distrito';
  else if (d.distrito.length > 100) e.distrito = 'Máximo 100 caracteres';
  if (!d.direccion || d.direccion.length < 5) e.direccion = 'Ingresa la dirección completa (calle, número, etc.)';
  else if (d.direccion.length > 250) e.direccion = 'Máximo 250 caracteres';
  if (d.referencia && d.referencia.length > 250) e.referencia = 'Máximo 250 caracteres';
  return e;
}

const textoDireccion = (d) => (d ? `${d.direccion}, ${d.distrito}, ${d.provincia}` : null);

module.exports = {
  TIPOS_ENTREGA, COSTO_ENVIO, METODO_TARJETA, METODO_YAPE,
  calcularTotales, metodoPermitido, validarDireccion, textoDireccion,
};