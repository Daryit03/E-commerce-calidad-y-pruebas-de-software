const express = require('express');
const cors = require('cors');
const catalogoRoutes = require('./infrastructure/routes/catalogo.routes');

const app = express();

app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get('/api/salud', (req, res) => {
  res.json({ ok: true, mensaje: 'API funcionando' });
});

// Rutas del catálogo: /api/categorias, /api/productos, ...
app.use('/api', catalogoRoutes);

// Si la ruta no existe
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejador de errores: usa el código del error (400, 404) o 500 si es inesperado
app.use((err, req, res, next) => {
  if (!err.status) console.error(err);
  res.status(err.status || 500).json({
    error: err.status ? err.message : 'Error interno del servidor',
  });
});

module.exports = app;