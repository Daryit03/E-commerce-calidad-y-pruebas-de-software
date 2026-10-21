const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const catalogoRoutes = require('./infrastructure/routes/catalogo.routes');
const authRoutes = require('./infrastructure/routes/auth.routes');
const carritoRoutes = require('./infrastructure/routes/carrito.routes');
const checkoutRoutes = require('./infrastructure/routes/checkout.routes');
const pedidosRoutes = require('./infrastructure/routes/pedidos.routes');
const adminRoutes = require('./infrastructure/routes/admin.routes');

const app = express();
app.set('trust proxy', 1); // en Render: usar la IP real del cliente

app.use(helmet());
// Solo la tienda (frontend) puede usar esta API
app.use(cors({
  origin: (process.env.FRONTEND_URL || 'http://localhost:5173').split(','),
}));
app.use(express.json({ limit: '200kb' }));

app.get('/api/salud', (req, res) => res.json({ estado: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/carrito', carritoRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', catalogoRoutes);

// Ruta no encontrada
app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

// Manejo central de errores
app.use((err, req, res, next) => {
  const status = err.status || 500;
  if (status === 500) console.error(err);
  res.status(status).json({
    error: status === 500 ? 'Error interno del servidor' : err.message,
    ...(err.errores && { errores: err.errores }),
  });
});

module.exports = app;