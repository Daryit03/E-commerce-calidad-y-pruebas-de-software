const bcrypt = require('bcryptjs');

module.exports = {
  hash: (texto) => bcrypt.hash(texto, 10),
  comparar: (texto, hash) => bcrypt.compare(texto, hash),
};