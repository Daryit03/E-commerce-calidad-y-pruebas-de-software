class NoEncontradoError extends Error {
  constructor(mensaje) {
    super(mensaje);
    this.name = 'NoEncontradoError';
    this.status = 404;
  }
}

class ValidacionError extends Error {
  constructor(mensaje) {
    super(mensaje);
    this.name = 'ValidacionError';
    this.status = 400;
  }
}

module.exports = { NoEncontradoError, ValidacionError };