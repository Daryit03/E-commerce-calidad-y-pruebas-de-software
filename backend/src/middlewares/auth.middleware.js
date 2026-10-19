const prisma = require('../config/db.config');
const JWT = require('../infrastructure/external/JWTAdapter');
const { NoAutorizadoError, ProhibidoError } = require('../domain/errors');

async function requiereAuth(req, res, next) {
  const [tipo, token] = (req.headers.authorization || '').split(' ');
  if (tipo !== 'Bearer' || !token) return next(new NoAutorizadoError('Debes iniciar sesión'));

  let datos;
  try {
    datos = JWT.verificar(token);
  } catch {
    return next(new NoAutorizadoError('Tu sesión expiró. Inicia sesión de nuevo.'));
  }

  // La cuenta debe seguir activa; el rol se toma de la BD (no del token)
  const usuario = await prisma.usuario.findUnique({
    where: { id_usuario: datos.id },
    select: { estado: true, rol: { select: { nombre: true } } },
  });
  if (!usuario || !usuario.estado)
    return next(new NoAutorizadoError('Tu cuenta está desactivada. Comunícate con la tienda.'));

  req.usuario = { id: datos.id, rol: usuario.rol.nombre };
  next();
}

function requiereAdmin(req, res, next) {
  if (req.usuario?.rol !== 'Administrador') return next(new ProhibidoError());
  next();
}

module.exports = { requiereAuth, requiereAdmin };