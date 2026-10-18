import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const ENLACES = [
  { to: '/admin', texto: 'Inicio', end: true },
  { to: '/admin/productos', texto: 'Productos' },
  { to: '/admin/clasificacion', texto: 'Categorías y marcas' },
  { to: '/admin/pedidos', texto: 'Pedidos' },
  { to: '/admin/clientes', texto: 'Clientes' },
];

export default function AdminLayout() {
  const { usuario } = useAuth();

  return (
    <div className="admin">
      <aside className="admin-menu">
        <p className="admin-saludo">
          Administrador
          <b>{usuario.nombres} {usuario.apellidos}</b>
        </p>
        <nav>
          {ENLACES.map((e) => (
            <NavLink key={e.to} to={e.to} end={e.end}
              className={({ isActive }) => `admin-link ${isActive ? 'activo' : ''}`}>
              {e.texto}
            </NavLink>
          ))}
        </nav>
      </aside>
      <section className="admin-contenido">
        <Outlet />
      </section>
    </div>
  );
}