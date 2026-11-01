import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ProductCard from '../components/product/ProductCard';
import Icono, { iconoCategoria } from '../components/ui/Icono';
import { enlaceWhatsapp } from '../config/tienda';
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

      <div className="inicio-arriba">
        {/* Columna izquierda: categorías y ayuda */}
        <aside className="inicio-lateral">
          <nav className="inicio-categorias" aria-label="Categorías">
            <h2><Icono nombre="menu" size={20} /> Todas las categorías</h2>
            <ul>
              {datos.categorias.map((c) => (
                <li key={c.id}>
                  <Link to={`/catalogo?categoria=${c.id}`}>
                    <Icono nombre={iconoCategoria(c.nombre)} size={18} />
                    <span>{c.nombre}</span>
                    <Icono nombre="derecha" size={16} className="inicio-chevron" />
                  </Link>
                </li>
              ))}
              {cargando && <li className="texto-gris inicio-cargando">Cargando…</li>}
            </ul>
          </nav>

          <a href={enlaceWhatsapp} target="_blank" rel="noopener noreferrer" className="inicio-ayuda">
            <span className="inicio-ayuda-icono"><Icono nombre="chat" size={26} /></span>
            <span>
              <b>¿Necesitas ayuda?</b>
              <small>Escríbenos por WhatsApp</small>
              <span className="inicio-ayuda-boton">Chatear ahora</span>
            </span>
          </a>
        </aside>

        {/* Banner principal */}
        <section className="inicio-banner">
          <div className="inicio-banner-texto">
            <h1>Todo lo que necesitas <span>para tus proyectos</span></h1>
            <p>Material eléctrico y de ferretería con la mejor calidad y precio, en San Martín de Porres.</p>
            <ul className="inicio-banner-puntos">
              <li><Icono nombre="escudo" size={22} /> Productos originales</li>
              <li><Icono nombre="asesor" size={22} /> Asesoría personalizada</li>
              <li><Icono nombre="camion" size={22} /> Delivery y recojo en tienda</li>
            </ul>
            <div className="hero-botones">
              <Link to="/catalogo" className="btn btn-amarillo">Ver catálogo <Icono nombre="flecha" size={18} /></Link>
              <Link to="/nosotros" className="btn btn-borde">Nosotros</Link>
              {/* Solo los visitantes sin sesión ven "Crear cuenta" */}
              {!usuario && <Link to="/registro" className="btn btn-borde">Crear cuenta</Link>}
            </div>
          </div>
        </section>
      </div>

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