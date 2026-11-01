import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ProductCard from '../components/product/ProductCard';
import { obtenerCategorias, obtenerDestacados } from '../services/catalogo.service';

export default function Home() {
  const [categorias, setCategorias] = useState([]);
  const [destacados, setDestacados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const { usuario } = useAuth();

  // useEffect se ejecuta una vez, cuando la página aparece
  useEffect(() => {
    Promise.all([obtenerCategorias(), obtenerDestacados()])
      .then(([cats, dest]) => {
        setCategorias(cats);
        setDestacados(dest);
      })
      .catch(() => setError('No pudimos cargar la tienda en este momento. Revisa tu conexión a internet y vuelve a intentarlo en unos segundos.'))
      .finally(() => setCargando(false));
  }, []);

  // El administrador no usa la tienda: va directo a su panel
  if (usuario?.rol === 'Administrador') return <Navigate to="/admin" replace />;

  return (
    <>
      <section className="hero">
        <small>SAN MARTÍN DE PORRES · LIMA</small>
        <h1>Material eléctrico y ferretería, sin salir de casa</h1>
        <p>Consulta precios y stock, arma tu pedido y elige: te lo llevamos o lo recoges en tienda.</p>
        <div className="hero-botones">
          <Link to="/catalogo" className="btn btn-blanco">Ver catálogo</Link>
          <Link to="/registro" className="btn btn-borde">Crear cuenta</Link>
        </div>
      </section>

      {error && <p className="mensaje-error">{error}</p>}

      <section className="seccion">
        <div className="seccion-titulo">
          <h2>Categorías</h2>
        </div>
        {cargando ? <p className="cargando">Cargando…</p> : (
          <div className="grid-categorias">
            {categorias.map((c) => (
              <Link key={c.id} to={`/catalogo?categoria=${c.id}`} className="tarjeta-categoria">
                <h3>{c.nombre}</h3>
                <span>{c.subcategorias.map((s) => s.nombre).join(' · ')}</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="seccion">
        <div className="seccion-titulo">
          <h2>★ Productos destacados</h2>
          <Link to="/catalogo">Ver todo el catálogo →</Link>
        </div>
        {cargando ? <p className="cargando">Cargando…</p> : (
          <div className="grid-productos">
            {destacados.map((p) => <ProductCard key={p.id} producto={p} />)}
          </div>
        )}
      </section>

      <section className="seccion caja">
        <h2>Quiénes somos</h2>
        <p>
          Electro Ferretero Darvin S.A.C. es una ferretería de San Martín de Porres, Lima,
          especializada en material eléctrico, herramientas y artículos para construcción.
        </p>
      </section>
    </>
  );
}