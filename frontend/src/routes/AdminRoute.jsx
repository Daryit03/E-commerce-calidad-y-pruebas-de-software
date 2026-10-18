import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function AdminRoute({ children }) {
  const { usuario, cargandoSesion } = useAuth();
  const location = useLocation();

  if (cargandoSesion) return <p>Cargando...</p>;
  if (!usuario) return <Navigate to="/login" replace state={{ desde: location.pathname }} />;
  if (usuario.rol !== 'Administrador') {
    return (
      <div className="caja vacio">
        <h1>Acceso restringido</h1>
        <p className="texto-gris">Esta sección es solo para administradores.</p>
        <Link className="btn" to="/">Ir al inicio</Link>
      </div>
    );
  }
  return children;
}