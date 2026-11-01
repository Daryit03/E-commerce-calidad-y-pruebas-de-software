const crypto = require('crypto');

module.exports = {
  generarToken: () => crypto.randomBytes(32).toString('hex'),
  generarCodigo: () => crypto.randomInt(0, 1000000).toString().padStart(6, '0'), // 6 dígitos, ej. "048213"
  hash: (texto) => crypto.createHash('sha256').update(texto).digest('hex'),
};