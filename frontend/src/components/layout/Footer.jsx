// Datos de la tienda: cámbialos solo aquí
const TIENDA = {
  celular: '955 342 533', // 9 dígitos, sin espacios
  correo: 'darvinsac03@gmail.com',
  direccion: 'Av. los Próceres de Huandoy 8120',
  ruc: '20601617596',
};

const MENSAJE_WHATSAPP = 'Hola, quisiera hacer una consulta sobre un producto.';

// Arma los enlaces a partir de los datos
const enlaceWhatsapp = `https://wa.me/51${TIENDA.celular}?text=${encodeURIComponent(MENSAJE_WHATSAPP)}`;
const enlaceCorreo = `mailto:${TIENDA.correo}`;
const enlaceMapa = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(TIENDA.direccion)}`;
const celularVisible = TIENDA.celular.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3'); // 999 999 999

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-interior">
        <div>
          <strong>Electro Ferretero Darvin S.A.C.</strong>
          <p className="footer-ruc">RUC {TIENDA.ruc}</p>
        </div>

        <ul className="footer-contacto">
          <li>
            <span>WhatsApp:</span>{' '}
            <a href={enlaceWhatsapp} target="_blank" rel="noopener noreferrer">{celularVisible}</a>
          </li>
          <li>
            <span>Correo:</span>{' '}
            <a href={enlaceCorreo}>{TIENDA.correo}</a>
          </li>
          <li>
            <span>Dirección:</span>{' '}
            <a href={enlaceMapa} target="_blank" rel="noopener noreferrer">{TIENDA.direccion}</a>
          </li>
        </ul>
      </div>
    </footer>
  );
}