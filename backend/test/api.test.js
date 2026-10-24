// Pruebas de seguridad de la API (sin iniciar el servidor)
const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/db.config');

// Al terminar, cerrar la conexión a la BD (si se abrió)
afterAll(async () => {
  await prisma.$disconnect();
});

// ---------------------------------------------------------------
// Rutas básicas
// ---------------------------------------------------------------
describe('Rutas básicas', () => {
  test('GET /api/salud responde 200 y { estado: "ok" }', async () => {
    const r = await request(app).get('/api/salud');
    expect(r.status).toBe(200);
    expect(r.body).toEqual({ estado: 'ok' });
  });

  test('una ruta que no existe responde 404', async () => {
    const r = await request(app).get('/api/no-existe');
    expect(r.status).toBe(404);
    expect(r.body.error).toBe('Ruta no encontrada');
  });
});

// ---------------------------------------------------------------
// Rutas privadas: sin sesión no se puede entrar (401)
// ---------------------------------------------------------------
describe('Rutas privadas sin sesión', () => {
  test.each([
    ['GET', '/api/carrito'],
    ['GET', '/api/pedidos'],
    ['POST', '/api/checkout'],
    ['GET', '/api/auth/yo'],
    ['GET', '/api/admin/dashboard'],
    ['GET', '/api/admin/clientes'],
  ])('%s %s sin token responde 401', async (metodo, ruta) => {
    const r = await request(app)[metodo.toLowerCase()](ruta);
    expect(r.status).toBe(401);
    expect(r.body.error).toBe('Debes iniciar sesión');
  });

  test('un token falso responde 401', async () => {
    const r = await request(app).get('/api/carrito').set('Authorization', 'Bearer token-falso-123');
    expect(r.status).toBe(401);
  });

  test('un encabezado sin "Bearer" responde 401', async () => {
    const r = await request(app).get('/api/carrito').set('Authorization', 'Basic abc123');
    expect(r.status).toBe(401);
  });
});

// ---------------------------------------------------------------
// Parte 2 de seguridad: helmet
// ---------------------------------------------------------------
describe('Cabeceras de seguridad (helmet)', () => {
  test('no revela que usa Express y agrega cabeceras de protección', async () => {
    const r = await request(app).get('/api/salud');
    expect(r.headers['x-powered-by']).toBeUndefined();
    expect(r.headers['x-content-type-options']).toBe('nosniff');
    expect(r.headers['x-frame-options']).toBeDefined();
  });
});

// ---------------------------------------------------------------
// Parte 3 de seguridad: CORS
// ---------------------------------------------------------------
describe('CORS', () => {
  test('acepta peticiones de la tienda (localhost:5173)', async () => {
    const r = await request(app).get('/api/salud').set('Origin', 'http://localhost:5173');
    expect(r.headers['access-control-allow-origin']).toBe('http://localhost:5173');
  });

  test('no autoriza a una página desconocida', async () => {
    const r = await request(app).get('/api/salud').set('Origin', 'https://pagina-falsa.com');
    expect(r.headers['access-control-allow-origin']).toBeUndefined();
  });
});

// ---------------------------------------------------------------
// Parte 4 de seguridad: límite de 200 KB
// ---------------------------------------------------------------
describe('Límite de tamaño', () => {
  test('rechaza datos de más de 200 KB con 413', async () => {
    const r = await request(app)
      .post('/api/auth/registro')
      .send({ nombre: 'a'.repeat(300 * 1024) }); // 300 KB
    expect(r.status).toBe(413);
  });
});

// ---------------------------------------------------------------
// Parte 1 de seguridad: límite de intentos (va al final)
// ---------------------------------------------------------------
describe('Límite de intentos de login', () => {
  test('al intento 11 fallido responde 429 "Demasiados intentos"', async () => {
    let r;
    for (let i = 1; i <= 11; i++) {
      r = await request(app).post('/api/auth/login').send({}); // login vacío = intento fallido
    }
    expect(r.status).toBe(429);
    expect(r.body.error).toMatch(/Demasiados intentos/);
  });
});