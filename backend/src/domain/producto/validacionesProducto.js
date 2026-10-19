const MAX_IMAGENES = 6;
const MAX_FICHA = 20;
const PRECIO = /^\d{1,8}(\.\d{1,2})?$/; // hasta 99,999,999.99 con 2 decimales

const limpiar = (v) => String(v ?? '').trim().replace(/\s+/g, ' ');
const numero = (v) => (v === '' || v == null ? NaN : Number(v));

function normalizarProducto(d = {}) {
  const precioTexto = String(d.precio ?? '').trim();
  return {
    nombre: limpiar(d.nombre),
    descripcion: limpiar(d.descripcion) || null,
    precioTexto,
    precio: Number(precioTexto),
    stock: numero(d.stock),
    idSubcategoria: numero(d.idSubcategoria),
    idMarca: numero(d.idMarca),
    estado: d.estado !== false,       // publicado por defecto
    destacado: d.destacado === true,
    ficha: (Array.isArray(d.ficha) ? d.ficha : [])
      .map((c) => ({ nombre: limpiar(c?.nombre), valor: limpiar(c?.valor) }))
      .filter((c) => c.nombre || c.valor),
    imagenes: (Array.isArray(d.imagenes) ? d.imagenes : []).map((i) => ({
      url: String(i?.url ?? ''),
      publicId: i?.publicId ? String(i.publicId) : null,
      esPrincipal: i?.esPrincipal === true,
    })),
  };
}

function validarProducto(p) {
  const e = {};
  if (!p.nombre) e.nombre = 'Ingresa el nombre del producto';
  else if (p.nombre.length < 3 || p.nombre.length > 150) e.nombre = 'Debe tener entre 3 y 150 caracteres';

  if (p.descripcion && p.descripcion.length > 500) e.descripcion = 'Máximo 500 caracteres';

  if (!PRECIO.test(p.precioTexto) || p.precio <= 0) e.precio = 'Ingresa un precio mayor a 0 (máximo 2 decimales)';

  if (!Number.isInteger(p.stock) || p.stock < 0 || p.stock > 1000000)
    e.stock = 'Ingresa una cantidad entera de 0 o más';

  if (!Number.isInteger(p.idSubcategoria) || p.idSubcategoria <= 0) e.idSubcategoria = 'Elige una subcategoría';
  if (!Number.isInteger(p.idMarca) || p.idMarca <= 0) e.idMarca = 'Elige una marca';

  if (p.ficha.length > MAX_FICHA) e.ficha = `Máximo ${MAX_FICHA} características`;
  else {
    const vistos = new Set();
    for (const c of p.ficha) {
      if (!c.nombre || !c.valor) { e.ficha = 'Completa el nombre y el valor de cada característica'; break; }
      if (c.nombre.length > 80 || c.valor.length > 150) { e.ficha = 'Nombre máximo 80 y valor máximo 150 caracteres'; break; }
      const clave = c.nombre.toLowerCase();
      if (vistos.has(clave)) { e.ficha = `La característica "${c.nombre}" está repetida`; break; }
      vistos.add(clave);
    }
  }

  if (p.imagenes.length > MAX_IMAGENES) e.imagenes = `Máximo ${MAX_IMAGENES} imágenes por producto`;
  else if (p.imagenes.some((i) => !i.url.startsWith('https://res.cloudinary.com/') || i.url.length > 500))
    e.imagenes = 'Hay imágenes no válidas';

  return e;
}

// Garantiza UNA sola imagen principal (si no hay, la primera)
function ordenarImagenes(imagenes) {
  let hayPrincipal = false;
  const r = imagenes.map((i) => {
    const principal = i.esPrincipal && !hayPrincipal;
    if (principal) hayPrincipal = true;
    return { ...i, esPrincipal: principal };
  });
  if (!hayPrincipal && r.length) r[0].esPrincipal = true;
  return r;
}

module.exports = { normalizarProducto, validarProducto, ordenarImagenes, MAX_IMAGENES };