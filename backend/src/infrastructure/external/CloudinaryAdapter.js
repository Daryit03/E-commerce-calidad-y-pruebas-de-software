const { v2: cloudinary } = require('cloudinary');

let configurado = false;
function cliente() {
  if (!configurado) {
    const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET)
      throw new Error('Faltan las variables CLOUDINARY_* en el archivo .env');
    cloudinary.config({
      cloud_name: CLOUDINARY_CLOUD_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
      secure: true,
    });
    configurado = true;
  }
  return cloudinary;
}

module.exports = {
  // Sube la imagen (desde memoria) y devuelve su enlace e id
  subir(buffer) {
    return new Promise((resolve, reject) => {
      const stream = cliente().uploader.upload_stream(
        {
          folder: process.env.CLOUDINARY_CARPETA || 'electro-ferretero/productos',
          resource_type: 'image',
          // Máximo 1200 px y calidad/formato automáticos: fotos livianas
          transformation: [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto', fetch_format: 'auto' }],
        },
        (err, r) => {
          if (err) {
            console.error('Cloudinary:', err);
            const error = new Error('No se pudo subir la imagen. Revisa las credenciales de Cloudinary en el .env.');
            error.status = 502;
            return reject(error);
          }
          resolve({ url: r.secure_url, publicId: r.public_id });
        }
      );
      stream.end(buffer);
    });
  },

  // Borra imágenes (si alguna falla, no detiene nada)
  async eliminar(publicIds = []) {
    const ids = publicIds.filter(Boolean);
    if (!ids.length) return;
    const resultados = await Promise.allSettled(ids.map((id) => cliente().uploader.destroy(id)));
    resultados.filter((r) => r.status === 'rejected').forEach((r) => console.error('Cloudinary destroy:', r.reason));
  },
};