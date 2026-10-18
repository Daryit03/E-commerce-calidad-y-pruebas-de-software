import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const MODULOS = [
  { to: 'productos', titulo: 'Productos', texto: 'Registrar, editar y publicar productos', listo: false },
  { to: 'clasificacion', titulo: 'Categorías y marcas', texto: 'Organizar el catálogo', listo: true },
  { to: 'pedidos', titulo: 'Pedidos', texto: 'Atender y cambiar el estado de los pedidos', listo: false },
  { to: 'clientes', titulo: 'Clientes', texto: 'Ver clientes y su historial de compras', listo: false },
];

export default function AdminInicio() {
  const { usuario } = useAuth();

  return (
    <div>
      <h1>¡Hola, {usuario.nombres}!</h1>
      <p className="texto-gris">Panel de administración de Electro Ferretero Darvin S.A.C.</p>
      <div className="admin-modulos">
        {MODULOS.map((m) => (
          <Link key={m.to} to={m.to} className="caja admin-modulo">
            <b>{m.titulo}</b>
            <span className="texto-gris">{m.texto}</span>
            {!m.listo && <span className="badge-estado estado-pendiente">Próximamente</span>}
          </Link>
        ))}
      </div>
    </div>
  );
}