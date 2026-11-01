import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import { obtenerCategorias } from "../../services/catalogo.service";
import { formatPrice } from "../../utils/formatPrice";
import { TIENDA, formatoCelular, enlaceWhatsapp } from "../../config/tienda";
import Icono, { iconoCategoria } from "../ui/Icono";

function Logo({ to }) {
  return (
    <Link to={to} className="logo">
      <img src="/logo.png" alt="Electro Ferretero Darvin S.A.C." className="logo-img" />
    </Link>
  );
}

export default function Navbar() {
  const [texto, setTexto] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario, logout } = useAuth();
  const { carrito, cantidad } = useCart();
  const esAdmin = usuario?.rol === "Administrador";

  // Categorías para el botón "Todas las categorías"
  useEffect(() => {
    if (esAdmin) return;
    obtenerCategorias().then(setCategorias).catch(() => setCategorias([]));
  }, [esAdmin]);

  // Cierra el menú de categorías al cambiar de página o al hacer clic fuera
  useEffect(() => setMenuAbierto(false), [location.pathname, location.search]);
  useEffect(() => {
    const cerrar = (e) => menuRef.current && !menuRef.current.contains(e.target) && setMenuAbierto(false);
    document.addEventListener("mousedown", cerrar);
    return () => document.removeEventListener("mousedown", cerrar);
  }, []);

  // Al buscar, lleva al catálogo con el texto en la URL: /catalogo?q=taladro
  function buscar(e) {
    e.preventDefault();
    const q = texto.trim();
    navigate(q ? `/catalogo?q=${encodeURIComponent(q)}` : "/catalogo");
  }

  function cerrarSesion() {
    logout();
    navigate("/");
  }

  // "Contacto" baja hasta los datos de contacto del footer
  function irAContacto(e) {
    e.preventDefault();
    document.getElementById("contacto")?.scrollIntoView({ behavior: "smooth" });
  }

  // ===== Administrador: cabecera simple =====
  if (esAdmin) {
    return (
      <header className="navbar">
        <div className="navbar-interior">
          <Logo to="/admin" />
          <nav className="nav-links nav-admin-barra" aria-label="Principal">
            <Link to="/admin" className="nav-admin">Panel admin</Link>
            <Link to="/perfil" className="nav-usuario" title="Mi perfil">
              <span className="avatar">{usuario.nombres.charAt(0).toUpperCase()}</span>
              Hola, {usuario.nombres.split(" ")[0]}
            </Link>
            <button className="nav-salir" onClick={cerrarSesion}>Cerrar sesión</button>
          </nav>
        </div>
      </header>
    );
  }

  // ===== Clientes y visitantes: cabecera completa de la tienda =====
  return (
    <header className="cabecera">
      {/* 1. Barra superior */}
      <div className="cab-top">
        <div className="cab-interior cab-top-interior">
          <span><Icono nombre="ubicacion" size={16} /> San Martín de Porres, Lima</span>
          <span className="cab-top-horario"><Icono nombre="reloj" size={16} /> {TIENDA.horario.join("  |  ")}</span>
          <a href={enlaceWhatsapp} target="_blank" rel="noopener noreferrer" className="cab-top-whatsapp">
            <Icono nombre="chat" size={16} /> Pedidos por WhatsApp: <b>{formatoCelular(TIENDA.whatsapp)}</b>
          </a>
        </div>
      </div>

      {/* 2. Logo, buscador, cuenta y carrito */}
      <div className="cab-principal">
        <div className="cab-interior cab-principal-interior">
          <Logo to="/" />

          <form className="cab-buscador" onSubmit={buscar} role="search">
            <input
              type="search"
              placeholder="Busca tu producto: cable, taladro, pintura…"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              aria-label="Buscar productos"
            />
            <button type="submit"><Icono nombre="buscar" size={18} /> Buscar</button>
          </form>

          <div className="cab-acciones">
            {usuario ? (
              <div className="cab-accion">
                <Icono nombre="usuario" size={28} />
                <span>
                  <Link to="/perfil"><small>Mi cuenta</small>Hola, {usuario.nombres.split(" ")[0]}</Link>
                  <button className="cab-salir" onClick={cerrarSesion}>Cerrar sesión</button>
                </span>
              </div>
            ) : (
              <Link to="/login" className="cab-accion">
                <Icono nombre="usuario" size={28} />
                <span><small>Mi cuenta</small>Iniciar sesión</span>
              </Link>
            )}

            <Link to="/mis-pedidos" className="cab-accion cab-ocultar-movil">
              <Icono nombre="pedidos" size={28} />
              <span><small>Mis</small>pedidos</span>
            </Link>

            <Link to="/carrito" className="cab-accion cab-carrito">
              <span className="cab-carrito-icono">
                <Icono nombre="carrito" size={30} />
                <span className="cab-contador">{cantidad}</span>
              </span>
              <span><small>Carrito</small>{formatPrice(carrito?.total ?? 0)}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Menú de navegación */}
      <div className="cab-menu">
        <div className="cab-interior cab-menu-interior">
          <div className="cab-categorias" ref={menuRef}>
            <button className="cab-categorias-boton" onClick={() => setMenuAbierto((a) => !a)} aria-expanded={menuAbierto}>
              <Icono nombre="menu" size={20} /> Todas las categorías <Icono nombre="abajo" size={18} />
            </button>
            {menuAbierto && (
              <ul className="cab-categorias-lista">
                {categorias.map((c) => (
                  <li key={c.id}>
                    <Link to={`/catalogo?categoria=${c.id}`}>
                      <Icono nombre={iconoCategoria(c.nombre)} size={18} /> {c.nombre}
                    </Link>
                  </li>
                ))}
                <li><Link to="/catalogo" className="cab-ver-todo">Ver todo el catálogo</Link></li>
              </ul>
            )}
          </div>

          <nav className="cab-enlaces" aria-label="Principal">
            <NavLink to="/" end>Inicio</NavLink>
            <NavLink to="/catalogo">Tienda</NavLink>
            <NavLink to="/nosotros">Nosotros</NavLink>
            <NavLink to="/mis-pedidos">Mis pedidos</NavLink>
            <a href="#contacto" onClick={irAContacto}>Contacto</a>
          </nav>

        </div>
      </div>
    </header>
  );
}