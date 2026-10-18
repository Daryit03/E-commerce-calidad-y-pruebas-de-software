const CLASES = {
  Pendiente: 'estado-pendiente',
  'En proceso': 'estado-proceso',
  Entregado: 'estado-ok',
  Anulado: 'estado-mal',
  Aprobado: 'estado-ok',
  Rechazado: 'estado-mal',
  Reembolsado: 'estado-proceso',
};

export default function EstadoBadge({ estado }) {
  return <span className={`badge-estado ${CLASES[estado] || ''}`}>{estado}</span>;
}