const express = require('express');
const cors = require('cors');
const catalogoRoutes = require('./infrastructure/routes/catalogo.routes');
const authRoutes = require('./infrastructure/routes/auth.routes');
const carritoRoutes = require('./infrastructure/routes/carrito.routes');
const checkoutRoutes = require('./infrastructure/routes/checkout.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/salud', (req, res) => res.json({ estado: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/carrito', carritoRoutes);
app.use('/api/checkout', checkoutRoutes);
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