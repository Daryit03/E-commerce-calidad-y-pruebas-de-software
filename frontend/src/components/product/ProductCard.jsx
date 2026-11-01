import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { formatPrice } from '../../utils/formatPrice';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { mensajeError } from '../../services/api';
import Icono from '../ui/Icono';

// Elige el color del aviso de stock según lo que diga el backend
function claseDisponibilidad(producto) {
  if (!producto.disponible) return 'badge badge-agotado';
  if (producto.disponibilidad.startsWith('Últimas')) return 'badge badge-pocas';
  return 'badge badge-stock';
}

export default function ProductCard({ producto }) {
  const { usuario } = useAuth();
  const { agregar } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [estado, setEstado] = useState({ tipo: '', texto: '' }); // '' | 'cargando' | 'ok' | 'error'

  async function agregarAlCarrito() {
    // Sin sesión: al login y luego de vuelta a esta página
    if (!usuario) return navigate('/login', { state: { desde: location.pathname + location.search } });

    setEstado({ tipo: 'cargando', texto: '' });
    try {
      await agregar(producto.id, 1);
      setEstado({ tipo: 'ok', texto: 'Agregado al carrito' });
    } catch (err) {
      setEstado({ tipo: 'error', texto: mensajeError(err, 'No se pudo agregar') });
    }
    setTimeout(() => setEstado({ tipo: '', texto: '' }), 2500);
  }

  return (
    <article className="producto-card">
      <Link to={`/producto/${producto.id}`} className="producto-imagen">
        {producto.imagen
          ? <img src={producto.imagen} alt={producto.nombre} />
          : <span className="sin-imagen">Sin imagen</span>}
        {producto.destacado && <span className="badge-destacado">★ Destacado</span>}
      </Link>

      <div className="producto-info">
        <span className="producto-marca">{producto.marca}</span>
        <Link to={`/producto/${producto.id}`} className="producto-nombre">{producto.nombre}</Link>
        <span className={claseDisponibilidad(producto)}>{producto.disponibilidad}</span>

        <div className="producto-pie">
          <span className="producto-precio">{formatPrice(producto.precio)}</span>
          <button
            className={`producto-agregar ${estado.tipo === 'ok' ? 'ok' : ''}`}
            onClick={agregarAlCarrito}
            disabled={!producto.disponible || estado.tipo === 'cargando'}
            title={producto.disponible ? 'Agregar al carrito' : 'Agotado'}
            aria-label={`Agregar ${producto.nombre} al carrito`}
          >
            <Icono nombre={estado.tipo === 'ok' ? 'check' : 'carrito'} size={20} />
          </button>
        </div>

        {estado.texto && (
          <p className={`producto-aviso ${estado.tipo === 'error' ? 'error' : ''}`}>{estado.texto}</p>
        )}
      </div>
    </article>
  );
}