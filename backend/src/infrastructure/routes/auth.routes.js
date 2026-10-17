const { Router } = require('express');
const PrismaUsuarioRepository = require('../repositories/PrismaUsuarioRepository');
const PrismaTokenRecuperacionRepository = require('../repositories/PrismaTokenRecuperacionRepository');
const BcryptAdapter = require('../external/BcryptAdapter');
const JWTAdapter = require('../external/JWTAdapter');
const CryptoAdapter = require('../external/CryptoAdapter');
const MailAdapter = require('../external/MailAdapter');
const { crearCasosDeUsoAuth } = require('../../application/auth/casosDeUso');
const { crearCasosDeUsoRecuperacion } = require('../../application/auth/recuperacion');
const { crearCasosDeUsoPerfil } = require('../../application/perfil/casosDeUso');
const { crearAuthController } = require('../controllers/auth.controller');
const { requiereAuth } = require('../../middlewares/auth.middleware');

const usuarioRepository = new PrismaUsuarioRepository();

const c = crearAuthController({
  auth: crearCasosDeUsoAuth({ usuarioRepository, hasher: BcryptAdapter, tokens: JWTAdapter }),
  perfil: crearCasosDeUsoPerfil({ usuarioRepository, hasher: BcryptAdapter }),
  recuperacion: crearCasosDeUsoRecuperacion({
    usuarioRepository,
    tokenRepository: new PrismaTokenRecuperacionRepository(),
    hasher: BcryptAdapter,
    crypto: CryptoAdapter,
    mailer: MailAdapter,
    urlFrontend: process.env.FRONTEND_URL || 'http://localhost:5173',
  }),
});

const router = Router();

// Públicas
router.post('/registro', c.registrar);
router.post('/login', c.iniciarSesion);
router.post('/recuperar', c.solicitarRecuperacion);
router.post('/restablecer', c.restablecerPassword);

// Privadas (requieren token)
router.get('/yo', requiereAuth, c.yo);
router.put('/perfil', requiereAuth, c.actualizarPerfil);
router.put('/password', requiereAuth, c.cambiarPassword);

module.exports = router;