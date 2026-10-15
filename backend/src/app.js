const express = require('express');
const cors = require('cors');
const prisma = require('./config/db.config');

const app = express();

app.use(cors());          // permite peticiones desde React
app.use(express.json());  // permite leer JSON que llega en las peticiones

// Ruta de prueba: ¿la API está viva?
app.get('/api/salud', (req, res) => {
  res.json({ ok: true, mensaje: 'API funcionando' });
});

// Categorías activas con sus subcategorías
app.get('/api/categorias', async (req, res, next) => {
  try {
    const categorias = await prisma.categoria.findMany({
      where: { estado: true },
      include: { subcategoria: true },
    });
    res.json(categorias);
  } catch (err) {
    next(err);
  }
});

// Si algo falla, responde con error 500 sin apagar el servidor
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

module.exports = app;