import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { obtenerProducto } from '../services/catalogo.service';
import { mensajeError } from '../services/api';
import { formatPrice } from '../utils/formatPrice';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';

export default function ProductoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario } = useAuth();
  const { agregar } = useCart();

  const [p, setP] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [imgActiva, setImgActiva] = useState(0);
  const [aviso, setAviso] = useState({ tipo: '', texto: '' });
  const [agregando, setAgregando] = useState(false);

  useEffect(() => {
    setCargando(true);
    setError('');
    setCantidad(1);
    setImgActiva(0);
    setAviso({ tipo: '', texto: '' });
    obtenerProducto(id)
      .then(setP)
      .catch((e) =>
        setError(e.response?.status === 404
          ? 'Este producto no existe o ya no está disponible.'
          : 'No se pudo cargar el producto.')
      )
      .finally(() => setCargando(false));
  }, [id]);

  if (cargando) return <p>Cargando producto...</p>;
  if (error) return <div className="caja vacio"><p>{error}</p><Link className="btn" to="/catalogo">Volver al catálogo</Link></div>;

  const imagenes = (p.imagenes || []).map((i) => (typeof i === 'string' ? i : i.url)).filter(Boolean);
  if (imagenes.length === 0 && p.imagen) imagenes.push(p.imagen);
  const ficha = p.ficha || [];
  const maximo = Math.max(1, Math.min(p.stock ?? 1, 99));

  const cambiarCantidad = (n) => setCantidad(Math.min(Math.max(1, n || 1), maximo));

  const claseBadge = !p.disponible ? 'badge-agotado'
    : p.disponibilidad?.startsWith('Últimas') ? 'badge-pocas' : 'badge-stock';

  async function agregarAlCarrito() {
    // Sin sesión: al login y luego de vuelta a este producto
    if (!usuario) return navigate('/login', { state: { desde: location.pathname } });

    setAgregando(true);
    setAviso({ tipo: '', texto: '' });
    try {
      const r = await agregar(p.id, cantidad);
      setAviso({ tipo: 'exito', texto: r.mensaje });
      setCantidad(1);
    } catch (err) {
      setAviso({ tipo: 'error', texto: mensajeError(err, 'No se pudo agregar al carrito.') });
    } finally {
      setAgregando(false);
    }
  }

  return (
    <div>
      <p className="migas">
        <Link to="/">Inicio</Link> /{' '}
        {p.categoria && <><Link to={`/catalogo?categoria=${p.categoria.id}`}>{p.categoria.nombre}</Link> /{' '}</>}
        {p.subcategoria && <><Link to={`/catalogo?categoria=${p.categoria?.id}&subcategoria=${p.subcategoria.id}`}>{p.subcategoria.nombre}</Link> /{' '}</>}
        {p.nombre}
      </p>

      <div className="detalle caja">
        <div className="galeria">
          <div className="imagen-grande">
            {imagenes.length > 0 ? <img src={imagenes[imgActiva]} alt={p.nombre} /> : <span>Sin imagen</span>}
          </div>
          {imagenes.length > 1 && (
            <div className="miniaturas">
              {imagenes.map((src, i) => (
                <img key={src} src={src} alt="" className={i === imgActiva ? 'activa' : ''} onClick={() => setImgActiva(i)} />
              ))}
            </div>
          )}
        </div>

        <div className="detalle-info">
          {p.destacado && <span className="badge badge-destacado">★ Destacado</span>}
          <p className="texto-gris">{p.marca}</p>
          <h1>{p.nombre}</h1>
          <p className="precio-grande">{formatPrice(p.precio)}</p>
          <span className={`badge ${claseBadge}`}>{p.disponibilidad}</span>

          {p.descripcion && <p className="descripcion">{p.descripcion}</p>}

          <div className="comprar">
            <div className="cantidad">
              <button onClick={() => cambiarCantidad(cantidad - 1)} disabled={!p.disponible || cantidad <= 1}>−</button>
              <input type="number" value={cantidad} onChange={(e) => cambiarCantidad(Number(e.target.value))} disabled={!p.disponible} />
              <button onClick={() => cambiarCantidad(cantidad + 1)} disabled={!p.disponible || cantidad >= maximo}>+</button>
            </div>
            <button className="btn" onClick={agregarAlCarrito} disabled={!p.disponible || agregando}>
              {!p.disponible ? 'Agotado' : agregando ? 'Agregando...' : 'Agregar al carrito'}
            </button>
          </div>

          {aviso.texto && (
            <p className={`aviso-carrito ${aviso.tipo === 'exito' ? 'mensaje-exito' : 'mensaje-error'}`}>
              {aviso.texto}{' '}
              {aviso.tipo === 'exito' && <Link to="/carrito">Ver carrito →</Link>}
            </p>
          )}
        </div>
      </div>

      <div className="caja ficha">
        <h2>Ficha técnica</h2>
        {ficha.length === 0 ? (
          <p className="texto-gris">Este producto no tiene ficha técnica registrada.</p>
        ) : (
          <table>
            <tbody>
              {ficha.map((c, i) => (
                <tr key={i}>
                  <th>{c.nombre}</th>
                  <td>{c.valor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}