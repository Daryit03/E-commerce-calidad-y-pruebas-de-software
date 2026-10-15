require('dotenv').config();
const app = require('./app');
const prisma = require('./config/db.config');

const PORT = process.env.PORT || 4000;

async function iniciar() {
  try {
    await prisma.$connect();
    console.log('Conectado a PostgreSQL');
    app.listen(PORT, () => console.log(`API en http://localhost:${PORT}`));
  } catch (err) {
    console.error('No se pudo conectar a la base de datos:', err.message);
    process.exit(1);
  }
}

iniciar();