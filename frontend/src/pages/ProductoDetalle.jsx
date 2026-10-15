import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { obtenerProducto } from '../services/catalogo.service';
import { formatPrice } from '../utils/formatPrice';

export default function ProductoDetalle() {
  const { id } = useParams();
  const [p, setP] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [imgActiva, setImgActiva] = useState(0);

  useEffect(() => {
    setCargando(true);
    setError('');
    setCantidad(1);
    setImgActiva(0);
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

  // Normaliza imágenes y ficha técnica (acepta textos u objetos)
  const imagenes = (p.imagenes || []).map((i) => (typeof i === 'string' ? i : i.url)).filter(Boolean);
  if (imagenes.length === 0 && p.imagen) imagenes.push(p.imagen);
  const ficha = p.caracteristicas || [];
  const maximo = p.stock ?? 10;

  const cambiarCantidad = (n) => setCantidad(Math.min(Math.max(1, n), maximo));

  const claseBadge = !p.disponible ? 'badge-agotado'
    : p.disponibilidad?.startsWith('Últimas') ? 'badge-pocas' : 'badge-stock';

  return (
    <div>
      <p className="migas">
        <Link to="/">Inicio</Link> / <Link to="/catalogo">Catálogo</Link> / {p.nombre}
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
              <button onClick={() => cambiarCantidad(cantidad - 1)} disabled={!p.disponible}>−</button>
              <input type="number" value={cantidad} onChange={(e) => cambiarCantidad(Number(e.target.value))} disabled={!p.disponible} />
              <button onClick={() => cambiarCantidad(cantidad + 1)} disabled={!p.disponible}>+</button>
            </div>
            <button className="btn" disabled title="Disponible en el módulo Carrito">
              {p.disponible ? 'Agregar al carrito' : 'Agotado'}
            </button>
          </div>
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
                  <th>{c.nombre ?? c.atributo}</th>
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