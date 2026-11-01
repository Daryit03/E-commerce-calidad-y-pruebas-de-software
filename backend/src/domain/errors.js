class ErrorDeDominio extends Error {
  constructor(mensaje, status, errores) {
    super(mensaje);
    this.name = this.constructor.name;
    this.status = status;
    if (errores) this.errores = errores; // errores por campo: { dni: '...', correo: '...' }
  }
}

class ValidacionError extends ErrorDeDominio {
  constructor(mensaje = 'Datos inválidos', errores) { super(mensaje, 400, errores); }
}
class NoAutorizadoError extends ErrorDeDominio {
  constructor(mensaje = 'Debes iniciar sesión') { super(mensaje, 401); }
}
class ProhibidoError extends ErrorDeDominio {
  constructor(mensaje = 'No tienes permiso para esta acción', errores) { super(mensaje, 403, errores); }
}
class NoEncontradoError extends ErrorDeDominio {
  constructor(mensaje = 'Recurso no encontrado') { super(mensaje, 404); }
}
class ConflictoError extends ErrorDeDominio {
  constructor(mensaje = 'El registro ya existe', errores) { super(mensaje, 409, errores); }
}

module.exports = { ValidacionError, NoAutorizadoError, ProhibidoError, NoEncontradoError, ConflictoError };