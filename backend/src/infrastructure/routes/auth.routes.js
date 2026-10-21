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
const rateLimit = require('express-rate-limit');

// Portero: máximo 10 intentos fallidos cada 15 minutos por persona (IP)
const limiteIntentos = rateLimit({
  windowMs: 15 * 60 * 1000,      // 15 minutos
  limit: 10,                     // 10 intentos
  skipSuccessfulRequests: true,  // los intentos correctos no cuentan
  legacyHeaders: false,
  message: { error: 'Demasiados intentos. Espera 15 minutos e inténtalo de nuevo.' },
});

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
router.post('/registro', limiteIntentos, c.registrar);
router.post('/login', limiteIntentos, c.iniciarSesion);
router.post('/recuperar', limiteIntentos, c.solicitarRecuperacion);
router.post('/restablecer', limiteIntentos, c.restablecerPassword);

// Privadas (requieren token)
router.get('/yo', requiereAuth, c.yo);
router.put('/perfil', requiereAuth, c.actualizarPerfil);
router.put('/password', requiereAuth, c.cambiarPassword);

module.exports = router;