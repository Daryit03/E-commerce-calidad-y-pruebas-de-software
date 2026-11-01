import { Link } from 'react-router-dom';

// Página para direcciones que no existen (error 404)
export default function NoEncontrado({ enlace = '/', textoEnlace = 'Ir al inicio' }) {
  return (
    <div className="caja vacio">
      <h1>Página no encontrada</h1>
      <p className="texto-gris">La dirección que buscas no existe o fue cambiada.</p>
      <div className="confirmacion-botones">
        <Link className="btn" to={enlace}>{textoEnlace}</Link>
        <Link className="btn btn-secundario" to="/catalogo">Ver catálogo</Link>
      </div>
    </div>
  );
}