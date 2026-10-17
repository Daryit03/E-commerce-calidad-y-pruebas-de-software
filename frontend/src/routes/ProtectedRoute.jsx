import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute({ children }) {
  const { usuario, cargandoSesion } = useAuth();
  const location = useLocation();

  if (cargandoSesion) return <p>Cargando...</p>;
  if (!usuario) return <Navigate to="/login" replace state={{ desde: location.pathname }} />;
  return children;
}