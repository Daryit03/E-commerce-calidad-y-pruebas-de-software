const { Router } = require('express');
const PrismaUsuarioRepository = require('../repositories/PrismaUsuarioRepository');
const BcryptAdapter = require('../external/BcryptAdapter');
const JWTAdapter = require('../external/JWTAdapter');
const { crearCasosDeUsoAuth } = require('../../application/auth/casosDeUso');
const { crearAuthController } = require('../controllers/auth.controller');
const { requiereAuth } = require('../../middlewares/auth.middleware');

const casos = crearCasosDeUsoAuth({
  usuarioRepository: new PrismaUsuarioRepository(),
  hasher: BcryptAdapter,
  tokens: JWTAdapter,
});
const c = crearAuthController(casos);

const router = Router();
router.post('/registro', c.registrar);   // POST /api/auth/registro
router.post('/login', c.iniciarSesion);  // POST /api/auth/login
router.get('/yo', requiereAuth, c.yo);   // GET  /api/auth/yo  (requiere token)

module.exports = router;