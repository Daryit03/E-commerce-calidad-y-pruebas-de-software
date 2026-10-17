import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function Navbar() {
  const [texto, setTexto] = useState('');
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();
  // Al buscar, lleva al catálogo con el texto en la URL: /catalogo?q=taladro
  function buscar(e) {
    e.preventDefault();
    const q = texto.trim();
    navigate(q ? `/catalogo?q=${encodeURIComponent(q)}` : '/catalogo');
  }

  return (
    <header className="navbar">
      <div className="navbar-interior">
        <Link to="/" className="logo">
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

        <nav className="nav-links" aria-label="Principal">
          <Link to="/catalogo">Catálogo</Link>
          <Link to="/mis-pedidos">Mis pedidos</Link>
          {usuario ? (
  <>
    <span className="nav-usuario">Hola, {usuario.nombres.split(' ')[0]}</span>
    <button className="nav-salir" onClick={() => { logout(); navigate('/'); }}>
      Cerrar sesión
    </button>
  </>
) : (
  <Link to="/login">Iniciar sesión</Link>
)}
          <Link to="/carrito">Carrito (0)</Link>
        </nav>
      </div>
    </header>
  );
}