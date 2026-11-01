import { Link } from 'react-router-dom';
import { TIENDA, formatoCelular, enlaceWhatsapp, enlaceMapa } from '../config/tienda';
import Icono from '../components/ui/Icono';

// Textos de la página: cámbialos a tu gusto
const OFRECEMOS = [
  { titulo: 'Material eléctrico', texto: 'Cables, tomacorrientes, interruptores, llaves térmicas, iluminación y más.' },
  { titulo: 'Herramientas', texto: 'Herramientas manuales y eléctricas para el hogar y para profesionales.' },
  { titulo: 'Gasfitería', texto: 'Tubos, conexiones, griferías y accesorios para instalaciones de agua.' },
  { titulo: 'Pinturas', texto: 'Pinturas, látex, esmaltes y accesorios para tus acabados.' },
];

const BENEFICIOS = [
  { titulo: 'Atención personalizada', texto: 'Te asesoramos para que elijas el producto correcto para tu proyecto.' },
  { titulo: 'Delivery a domicilio', texto: 'Llevamos tu pedido hasta tu casa u obra.' },
  { titulo: 'Recojo en tienda', texto: 'Compra en línea y recoge tu pedido sin costo de envío.' },
  { titulo: 'Varios medios de pago', texto: 'Paga con tarjeta, Yape, en efectivo en tienda o contra entrega.' },
];

export default function Nosotros() {
  return (
    <div className="nosotros">
      <section className="nosotros-hero">
        <small>SOBRE NOSOTROS</small>
        <h1>Tu ferretería de confianza en San Martín de Porres</h1>
        <p>
          {TIENDA.nombre} es una ferretería especializada en material eléctrico, herramientas y artículos
          para construcción. Atendemos a familias, maestros de obra y profesionales con productos de calidad
          y precios justos.
        </p>
        <div className="hero-botones">
          <Link to="/catalogo" className="btn btn-blanco">Ver catálogo</Link>
          <a href={enlaceWhatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-borde">
            Escríbenos por WhatsApp
          </a>
        </div>
      </section>

      <section className="seccion">
        <h2>¿Qué ofrecemos?</h2>
        <div className="nosotros-grid">
          {OFRECEMOS.map((o) => (
            <article key={o.titulo} className="caja nosotros-tarjeta">
              <h3>{o.titulo}</h3>
              <p className="texto-gris">{o.texto}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="seccion">
        <h2>¿Por qué elegirnos?</h2>
        <div className="nosotros-grid">
          {BENEFICIOS.map((b) => (
            <article key={b.titulo} className="caja nosotros-tarjeta">
              <h3>{b.titulo}</h3>
              <p className="texto-gris">{b.texto}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="seccion visita">
        {/* Izquierda: datos de la tienda */}
        <div className="visita-info">
          <small className="visita-etiqueta">NUESTRA TIENDA</small>
          <h2>Visítanos</h2>
          <p className="visita-intro">Te esperamos en nuestra tienda física. Ven, revisa los productos y recibe asesoría personalizada.</p>

          <ul className="visita-datos">
            <li>
              <span className="visita-icono"><Icono nombre="ubicacion" size={22} /></span>
              <div>
                <b>Dirección</b>
                <a href={enlaceMapa} target="_blank" rel="noopener noreferrer">{TIENDA.direccion}</a>
              </div>
            </li>
            <li>
              <span className="visita-icono"><Icono nombre="reloj" size={22} /></span>
              <div>
                <b>Horario de atención</b>
                {TIENDA.horario.map((h) => <span key={h}>{h}</span>)}
              </div>
            </li>
            <li>
              <span className="visita-icono"><Icono nombre="chat" size={22} /></span>
              <div>
                <b>WhatsApp</b>
                <a href={enlaceWhatsapp} target="_blank" rel="noopener noreferrer">{formatoCelular(TIENDA.whatsapp)}</a>
              </div>
            </li>
          </ul>

          <div className="visita-botones">
            <a href={enlaceMapa} target="_blank" rel="noopener noreferrer" className="btn btn-amarillo">
              <Icono nombre="ubicacion" size={18} /> Cómo llegar
            </a>
            <a href={enlaceWhatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-borde">
              <Icono nombre="chat" size={18} /> Escríbenos
            </a>
          </div>
        </div>

        {/* Derecha: mapa de Google */}
        <div className="visita-mapa">
          <iframe
            title="Ubicación de la tienda en Google Maps"
            src={`https://www.google.com/maps?q=${encodeURIComponent(TIENDA.direccion)}&output=embed`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </section>
    </div>
  );
}