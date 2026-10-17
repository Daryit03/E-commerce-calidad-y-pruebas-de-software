const JWT = require('../infrastructure/external/JWTAdapter');
const { NoAutorizadoError, ProhibidoError } = require('../domain/errors');

function requiereAuth(req, res, next) {
  const [tipo, token] = (req.headers.authorization || '').split(' ');
  if (tipo !== 'Bearer' || !token) return next(new NoAutorizadoError('Debes iniciar sesión'));
  try {
    const datos = JWT.verificar(token);
    req.usuario = { id: datos.id, rol: datos.rol };
    next();
  } catch {
    next(new NoAutorizadoError('Tu sesión expiró. Inicia sesión de nuevo.'));
  }
}

// Lo usaremos en el panel de administración
function requiereAdmin(req, res, next) {
  if (req.usuario?.rol !== 'Administrador') return next(new ProhibidoError());
  next();
}

module.exports = { requiereAuth, requiereAdmin };