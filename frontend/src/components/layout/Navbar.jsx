import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";

export default function Navbar() {
  const [texto, setTexto] = useState("");
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();
  const { cantidad } = useCart();
  const esAdmin = usuario?.rol === "Administrador";

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

  return (
    <header className="navbar">
      <div className="navbar-interior">
        {/* El logo lleva al panel si es administrador, o al inicio de la tienda si no */}
        <Link to={esAdmin ? "/admin" : "/"} className="logo">
          <span className="logo-icono">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
              <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />
            </svg>
          </span>
          <span className="logo-texto">
            <strong>ELECTRO FERRETERO</strong>
            <small>DARVIN S.A.C.</small>
          </span>
        </Link>

        {/* Buscador: solo para clientes y visitantes */}
        {!esAdmin && (
          <form className="buscador" onSubmit={buscar} role="search">
            <input
              type="search"
              placeholder="Busca cables, focos, taladros…"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              aria-label="Buscar productos"
            />
            <button type="submit">Buscar</button>
          </form>
        )}

        <nav className={`nav-links ${esAdmin ? "nav-admin-barra" : ""}`} aria-label="Principal">
          {esAdmin ? (
            // Administrador: solo su panel, su nombre y cerrar sesión
            <>
              <Link to="/admin" className="nav-admin">Panel admin</Link>
              <Link to="/perfil" className="nav-usuario" title="Mi perfil">
                <span className="avatar">{usuario.nombres.charAt(0).toUpperCase()}</span>
                Hola, {usuario.nombres.split(" ")[0]}
              </Link>
              <button className="nav-salir" onClick={cerrarSesion}>Cerrar sesión</button>
            </>
          ) : (
            // Clientes y visitantes: la tienda completa
            <>
              <Link to="/catalogo">Catálogo</Link>
              <Link to="/mis-pedidos">Mis pedidos</Link>
              {usuario ? (
                <>
                  <Link to="/perfil" className="nav-usuario">
                    Hola, {usuario.nombres.split(" ")[0]}
                  </Link>
                  <button className="nav-salir" onClick={cerrarSesion}>Cerrar sesión</button>
                </>
              ) : (
                <Link to="/login">Iniciar sesión</Link>
              )}
              <Link to="/carrito" className="nav-carrito">Carrito ({cantidad})</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}