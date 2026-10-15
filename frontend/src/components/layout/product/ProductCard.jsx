import { Link } from 'react-router-dom';
import { formatPrice } from '../../utils/formatPrice';

// Elige el color del aviso de stock según lo que diga el backend
function claseDisponibilidad(producto) {
  if (!producto.disponible) return 'badge badge-agotado';
  if (producto.disponibilidad.startsWith('Últimas')) return 'badge badge-pocas';
  return 'badge badge-stock';
}

export default function ProductCard({ producto }) {
  return (
    <Link to={`/producto/${producto.id}`} className="producto-card">
      <div className="producto-imagen">
        {producto.imagen
          ? <img src={producto.imagen} alt={producto.nombre} />
          : <span className="sin-imagen">Sin imagen</span>}
        {producto.destacado && <span className="badge-destacado">★ Destacado</span>}
      </div>
      <div className="producto-info">
        <span className="producto-marca">{producto.marca}</span>
        <span className="producto-nombre">{producto.nombre}</span>
        <span className="producto-precio">{formatPrice(producto.precio)}</span>
        <span className={claseDisponibilidad(producto)}>{producto.disponibilidad}</span>
      </div>
    </Link>
  );
}