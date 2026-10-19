const multer = require('multer');
const { ValidacionError } = require('../domain/errors');

const TIPOS = ['image/jpeg', 'image/png', 'image/webp'];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 6 },
  fileFilter: (req, file, cb) =>
    TIPOS.includes(file.mimetype)
      ? cb(null, true)
      : cb(new ValidacionError('Solo se permiten imágenes JPG, PNG o WEBP')),
});

function subirImagenes(req, res, next) {
  upload.array('imagenes', 6)(req, res, (err) => {
    if (!err) return next();
    if (err.code === 'LIMIT_FILE_SIZE') return next(new ValidacionError('Cada imagen debe pesar como máximo 5 MB'));
    if (err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE')
      return next(new ValidacionError('Puedes subir como máximo 6 imágenes a la vez'));
    next(err);
  });
}

module.exports = { subirImagenes };