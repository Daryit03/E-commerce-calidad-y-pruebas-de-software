const jwt = require('jsonwebtoken');

function secreto() {
  if (!process.env.JWT_SECRET) throw new Error('Falta JWT_SECRET en el archivo .env');
  return process.env.JWT_SECRET;
}

module.exports = {
  firmar: (datos) => jwt.sign(datos, secreto(), { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }),
  verificar: (token) => jwt.verify(token, secreto()),
};