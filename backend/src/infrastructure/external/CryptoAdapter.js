const crypto = require('crypto');

module.exports = {
  generarToken: () => crypto.randomBytes(32).toString('hex'),
  hash: (texto) => crypto.createHash('sha256').update(texto).digest('hex'),
};