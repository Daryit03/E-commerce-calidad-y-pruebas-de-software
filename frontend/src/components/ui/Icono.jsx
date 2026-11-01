// Íconos simples de línea (dibujos genéricos) que usa toda la tienda
const RUTAS = {
  ubicacion: <><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></>,
  reloj: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  chat: <path d="M21 12a8 8 0 0 1-11.8 7L4 20l1.1-4.7A8 8 0 1 1 21 12z" />,
  usuario: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  pedidos: <><path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" /><path d="M9 8h6M9 12h6" /></>,
  carrito: <><circle cx="9" cy="20" r="1.5" /><circle cx="18" cy="20" r="1.5" /><path d="M2 3h3l2.7 12.2a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.5L21 8H6" /></>,
  menu: <><path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h16" /></>,
  abajo: <path d="m6 9 6 6 6-6" />,
  derecha: <path d="m9 6 6 6-6 6" />,
  flecha: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
  buscar: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
  rayo: <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />,
  foco: <><path d="M9 18h6M10 21h4" /><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z" /></>,
  gota: <path d="M12 3s6 6.7 6 11a6 6 0 0 1-12 0c0-4.3 6-11 6-11z" />,
  llave: <path d="M14.7 6.3a4 4 0 0 0-5.4 5.2L3 17.8V21h3.2l6.3-6.3a4 4 0 0 0 5.2-5.4l-2.6 2.6-2.4-.6-.6-2.4z" />,
  brocha: <><path d="M14 3h6v6l-6 6-6-6z" /><path d="M8 15c-2 0-4 2-4 6 4 0 6-2 6-4" /></>,
  escudo: <><path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3z" /><path d="m9 12 2 2 4-4" /></>,
  caja: <><path d="M3 7l9-4 9 4v10l-9 4-9-4z" /><path d="M3 7l9 4 9-4M12 11v10" /></>,
  camion: <><path d="M3 6h11v10H3z" /><path d="M14 10h4l3 3v3h-7" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" /></>,
  etiqueta: <><path d="M3 12V4h8l10 10-8 8z" /><circle cx="7.5" cy="8.5" r="1.5" /></>,
  candado: <><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></>,
  tienda: <><path d="M4 10v10h16V10" /><path d="M3 10 5 4h14l2 6z" /><path d="M10 20v-5h4v5" /></>,
  asesor: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /><path d="M8 8a4 4 0 0 1 8 0" /></>,
  check: <path d="m5 12 5 5 9-10" />,
  salir: <><path d="M15 4h4v16h-4" /><path d="M10 8l-4 4 4 4M6 12h10" /></>,
  estrella: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2-5.5-2.9-5.5 2.9 1-6.2L3 9.6l6.2-.9z" />,
  nuevo: <><path d="M12 3v4M12 17v4M3 12h4M17 12h4" /><path d="m6 6 2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" /></>,
};

export default function Icono({ nombre, size = 20, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      {RUTAS[nombre] || RUTAS.caja}
    </svg>
  );
}

// Elige un ícono para cada categoría según su nombre
export function iconoCategoria(nombre = '') {
  const n = nombre.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  if (n.includes('electric')) return 'rayo';
  if (n.includes('ilumin') || n.includes('foco') || n.includes('luz')) return 'foco';
  if (n.includes('gasfit') || n.includes('agua') || n.includes('tub')) return 'gota';
  if (n.includes('herramient')) return 'llave';
  if (n.includes('pintur')) return 'brocha';
  if (n.includes('segur') || n.includes('cerradur') || n.includes('chapa')) return 'candado';
  return 'caja';
}