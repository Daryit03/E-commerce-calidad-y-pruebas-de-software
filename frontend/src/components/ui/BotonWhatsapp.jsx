import { useAuth } from '../../hooks/useAuth';
import { enlaceWhatsapp } from '../../config/tienda';

// Botón flotante de ayuda por WhatsApp (abajo a la derecha, en todas las páginas de la tienda)
export default function BotonWhatsapp() {
  const { usuario } = useAuth();
  if (usuario?.rol === 'Administrador') return null; // el admin no lo necesita

  return (
    <a
      href={enlaceWhatsapp}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-flotante"
      aria-label="¿Necesitas ayuda? Escríbenos por WhatsApp"
    >
      <span className="whatsapp-flotante-texto">
        <b>¿Necesitas ayuda?</b>
        <small>Escríbenos por WhatsApp</small>
      </span>
      <img src="/iconos/whatsapp.png" alt="" className="whatsapp-flotante-icono" />
    </a>
  );
}