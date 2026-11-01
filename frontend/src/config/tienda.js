// ===== Datos de la tienda: cámbialos solo aquí (los usan el footer y la página Nosotros) =====
export const TIENDA = {
  nombre: 'Electro Ferretero Darvin S.A.C.',
  telefono: '955342533',   // llamadas (9 dígitos)
  whatsapp: '936900990',   // WhatsApp (9 dígitos)
  correo: 'darvinsac03@gmail.com',
  direccion: 'Av. los Próceres de Huandoy 8120, San Martín de Porres, Lima',
  direccionCorta: 'Av. los Próceres de Huandoy 8120',
  detalleDireccion: 'Tienda física',
  horario: ['Lunes a sábado: 8:00 a. m. – 8:00 p. m.', 'Domingo: 8:30 a. m. – 1:00 p. m.'],
  ruc: '20601617596',
};

// Redes sociales: pega el enlace de cada página entre las comillas.
// Las que queden vacías ('') no se muestran.
export const REDES = [
  { nombre: 'Facebook', url: 'https://www.facebook.com/profile.php?id=100093704599828' },
  { nombre: 'Instagram', url: 'https://www.instagram.com/ferreteriadarvinsac?dlrf=ZDNlZDc0MzIxNw==' },
  { nombre: 'TikTok', url: 'https://www.tiktok.com/@ferreteria.darvin.sac?is_from_webapp=1&sender_device=pc' },
];

const MENSAJE_WHATSAPP = 'Hola, quisiera hacer una consulta sobre un producto.';

// Enlaces armados a partir de los datos
export const formatoCelular = (n) => n.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
export const enlaceTelefono = `tel:+51${TIENDA.telefono}`;
export const enlaceWhatsapp = `https://wa.me/51${TIENDA.whatsapp}?text=${encodeURIComponent(MENSAJE_WHATSAPP)}`;
export const enlaceCorreo = `mailto:${TIENDA.correo}`;
export const enlaceMapa = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(TIENDA.direccion)}`;