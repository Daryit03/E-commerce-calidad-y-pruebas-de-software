import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ProductCard from '../components/product/ProductCard';
import Icono from '../components/ui/Icono';
import { TIENDA } from '../config/tienda';
import {
  obtenerCategorias, obtenerDestacados, obtenerNuevos, obtenerMarcasTienda,
} from '../services/catalogo.service';

const BENEFICIOS = [
  { icono: 'camion', titulo: 'Delivery a domicilio', texto: 'Te lo llevamos a tu casa u obra' },
  { icono: 'tienda', titulo: 'Recojo en tienda', texto: 'Sin costo de envío' },
  { icono: 'escudo', titulo: 'Productos garantizados', texto: 'Calidad y confianza' },
  { icono: 'candado', titulo: 'Compra 100 % segura', texto: 'Tus datos protegidos' },
];

export default function Home() {
  const { usuario } = useAuth();
  const [datos, setDatos] = useState({ categorias: [], destacados: [], nuevos: [], marcas: [] });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  // Carga todo lo que muestra el inicio, al mismo tiempo
  useEffect(() => {
    Promise.all([obtenerCategorias(), obtenerDestacados(), obtenerNuevos(), obtenerMarcasTienda()])
      .then(([categorias, destacados, nuevos, marcas]) => setDatos({ categorias, destacados, nuevos, marcas }))
      .catch(() => setError('No pudimos cargar la tienda en este momento. Revisa tu conexión a internet y vuelve a intentarlo en unos segundos.'))
      .finally(() => setCargando(false));
  }, []);

  // El administrador no usa la tienda: va directo a su panel
  if (usuario?.rol === 'Administrador') return <Navigate to="/admin" replace />;

  return (
    <div className="inicio">
      {error && <p className="mensaje-error">{error}</p>}

      {/* Banner principal con la foto de la tienda */}
      <section className="hero-tienda">
        <div className="hero-tienda-texto">
          <span className="hero-tienda-etiqueta"><Icono nombre="rayo" size={16} /> Ferretería en San Martín de Porres</span>
          <h1>Todo lo que necesitas<br />para tus <span>proyectos</span></h1>
          <p>Material eléctrico, herramientas, gasfitería y pinturas con la mejor calidad y precio.</p>
          <ul className="hero-tienda-puntos">
            <li><Icono nombre="escudo" size={24} /><span>Productos<br />originales</span></li>
            <li><Icono nombre="asesor" size={24} /><span>Asesoría<br />personalizada</span></li>
            <li><Icono nombre="camion" size={24} /><span>Delivery y<br />recojo en tienda</span></li>
          </ul>
          <div className="hero-botones">
            <Link to="/catalogo" className="btn btn-amarillo">Ver catálogo <Icono nombre="flecha" size={18} /></Link>
            <Link to="/nosotros" className="btn btn-borde">Nosotros</Link>
            {!usuario && <Link to="/registro" className="btn btn-borde">Crear cuenta</Link>}
          </div>
        </div>

        {/* Tarjetas sobre la foto */}
        <div className="hero-tienda-tarjetas">
          <div className="hero-tienda-tarjeta">
            <Icono nombre="tienda" size={22} />
            <span><b>Visita nuestra tienda</b><small>{TIENDA.direccionCorta}</small></span>
          </div>
          <div className="hero-tienda-tarjeta">
            <Icono nombre="reloj" size={22} />
            <span><b>Lunes a sábado</b><small>8:00 a. m. – 8:00 p. m.</small></span>
          </div>
        </div>
      </section>

      {/* Franja de beneficios */}
      <section className="inicio-beneficios">
        {BENEFICIOS.map((b) => (
          <div key={b.titulo} className="inicio-beneficio">
            <Icono nombre={b.icono} size={32} />
            <span><b>{b.titulo}</b><small>{b.texto}</small></span>
          </div>
        ))}
      </section>

      {/* Productos */}
      <SeccionProductos titulo="Productos destacados" icono="estrella" productos={datos.destacados} cargando={cargando} />
      <SeccionProductos titulo="Nuevos productos" icono="nuevo" productos={datos.nuevos} cargando={cargando} />

      {/* Marcas */}
      {datos.marcas.length > 0 && (
        <section className="inicio-marcas">
          <b>Nuestras marcas</b>
          <div className="inicio-marcas-lista">
            {datos.marcas.map((m) => (
              <Link key={m.id} to={`/catalogo?q=${encodeURIComponent(m.nombre)}`}>{m.nombre}</Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function SeccionProductos({ titulo, icono, productos, cargando }) {
  if (!cargando && productos.length === 0) return null;
  return (
    <section className="seccion">
      <div className="seccion-titulo">
        <h2><Icono nombre={icono} size={22} /> {titulo}</h2>
        <Link to="/catalogo">Ver todo el catálogo →</Link>
      </div>
      {cargando ? <p className="cargando">Cargando…</p> : (
        <div className="grid-productos">
          {productos.map((p) => <ProductCard key={p.id} producto={p} />)}
        </div>
      )}
    </section>
  );
}