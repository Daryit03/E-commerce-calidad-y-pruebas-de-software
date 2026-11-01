import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TIENDA, REDES, formatoCelular, enlaceTelefono, enlaceWhatsapp, enlaceCorreo, enlaceMapa,
} from '../../config/tienda';

// Medios de pago: los logos van en la carpeta frontend/public/pagos/
const MEDIOS_PAGO = [
  { nombre: 'Visa', logo: '/pagos/visa.svg', icono: 'tarjeta' },
  { nombre: 'Yape', logo: '/pagos/yape.png' },
  { nombre: 'Efectivo', icono: 'billete' },
  { nombre: 'Contra entrega', icono: 'camion' },
];

// Íconos simples (dibujos genéricos)
const Icono = ({ d, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {d}
  </svg>
);
const ICONOS = {
  menu: <><path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h16" /></>,
  telefono: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />,
  compartir: <><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.6 13.5 6.8 4" /><path d="m15.4 6.5-6.8 4" /></>,
  chat: <path d="M21 12a8 8 0 0 1-11.8 7L4 20l1.1-4.7A8 8 0 1 1 21 12z" />,
  ubicacion: <><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></>,
  correo: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
  escudo: <><path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3z" /><path d="m9 12 2 2 4-4" /></>,
  camion: <><path d="M3 6h11v10H3z" /><path d="M14 10h4l3 3v3h-7" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" /></>,
  tienda: <><path d="M4 10v10h16V10" /><path d="M3 10 5 4h14l2 6z" /><path d="M10 20v-5h4v5" /></>,
  flecha: <path d="m9 6 6 6-6 6" />,
  tarjeta: <><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /><path d="M6 15h4" /></>,
  billete: <><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="2.5" /><path d="M6 12h.01M18 12h.01" /></>,
  enlace: <><path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" /><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" /></>,
};

// Muestra el logo del medio de pago; si la imagen no carga, muestra el ícono y el nombre
function MedioPago({ medio }) {
  const [sinLogo, setSinLogo] = useState(false);
  if (medio.logo && !sinLogo) {
    return (
      <span className="footer-pago" title={medio.nombre}>
        <img src={medio.logo} alt={medio.nombre} onError={() => setSinLogo(true)} />
      </span>
    );
  }
  return (
    <span className="footer-pago footer-pago-texto">
      {medio.icono && <Icono d={ICONOS[medio.icono]} size={18} />}
      {medio.nombre}
    </span>
  );
}

function TituloColumna({ icono, children }) {
  return (
    <h3 className="footer-titulo">
      <span className="footer-titulo-icono"><Icono d={ICONOS[icono]} /></span>
      {children}
    </h3>
  );
}

// Sube al inicio de la página (sirve también si ya estás en esa misma página)
const subir = () => window.scrollTo({ top: 0, behavior: 'smooth' });

export default function Footer() {
  const redes = REDES.filter((r) => r.url);

  return (
    <footer className="footer">
      <div className="footer-principal">
        {/* Marca */}
        <div className="footer-marca">
          <Link to="/" className="footer-logo" onClick={subir}>
            <span className="footer-logo-icono">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
                <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />
              </svg>
            </span>
            <span>
              <strong>ELECTRO FERRETERO</strong>
              <small>DARVIN S.A.C.</small>
            </span>
          </Link>
          <p className="footer-lema">Tu ferretería de confianza, siempre contigo.</p>
          <ul className="footer-beneficios">
            <li><Icono d={ICONOS.escudo} size={26} /><span>Compra segura</span></li>
            <li><Icono d={ICONOS.camion} size={26} /><span>Delivery a domicilio</span></li>
            <li><Icono d={ICONOS.tienda} size={26} /><span>Recojo en tienda</span></li>
          </ul>
        </div>

        {/* Navegación */}
        <nav className="footer-columna" aria-label="Navegación del pie de página">
          <TituloColumna icono="menu">Navegación</TituloColumna>
          <ul className="footer-lista">
            <li><Link to="/" onClick={subir}><Icono d={ICONOS.flecha} size={16} />Inicio</Link></li>
            <li><Link to="/nosotros" onClick={subir}><Icono d={ICONOS.flecha} size={16} />Nosotros</Link></li>
            <li><Link to="/catalogo" onClick={subir}><Icono d={ICONOS.flecha} size={16} />Tienda</Link></li>
            <li><Link to="/mis-pedidos" onClick={subir}><Icono d={ICONOS.flecha} size={16} />Mis pedidos</Link></li>
          </ul>
        </nav>

        {/* Contacto */}
        <div className="footer-columna" id="contacto">
          <TituloColumna icono="telefono">Contáctanos</TituloColumna>
          <ul className="footer-contacto">
            <li>
              <a href={enlaceTelefono} className="footer-numero">
                <Icono d={ICONOS.telefono} size={22} />{formatoCelular(TIENDA.telefono)}
              </a>
            </li>
            <li>
              <a href={enlaceWhatsapp} target="_blank" rel="noopener noreferrer" className="footer-numero">
                <Icono d={ICONOS.chat} size={22} />{formatoCelular(TIENDA.whatsapp)}
              </a>
            </li>
            <li className="footer-separado">
              <a href={enlaceMapa} target="_blank" rel="noopener noreferrer">
                <Icono d={ICONOS.ubicacion} size={22} />
                <span>{TIENDA.direccionCorta}<small>{TIENDA.detalleDireccion}</small></span>
              </a>
            </li>
            <li className="footer-separado">
              <a href={enlaceCorreo}><Icono d={ICONOS.correo} size={22} />{TIENDA.correo}</a>
            </li>
          </ul>
        </div>

        {/* Redes */}
        <div className="footer-columna">
          <TituloColumna icono="compartir">Síguenos</TituloColumna>
          {redes.length > 0 ? (
            <ul className="footer-redes">
              {redes.map((r) => (
                <li key={r.nombre}>
                  <a href={r.url} target="_blank" rel="noopener noreferrer">
                    <Icono d={ICONOS.enlace} size={16} />{r.nombre}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="footer-nota">Muy pronto en redes sociales.</p>
          )}
          <p className="footer-frase">¡Construye, repara y mejora con nosotros!</p>
        </div>
      </div>

      {/* Barra inferior */}
      <div className="footer-barra">
        <div className="footer-barra-interior">
          <div className="footer-pagos">
            <b>Medios de pago:</b>
            {MEDIOS_PAGO.map((m) => <MedioPago key={m.nombre} medio={m} />)}
          </div>
          <div className="footer-sello"><Icono d={ICONOS.escudo} size={28} /><span>Pago seguro<br />y confiable</span></div>
          <p className="footer-copy">
            © {new Date().getFullYear()} {TIENDA.nombre} · RUC {TIENDA.ruc}<br />
            Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}