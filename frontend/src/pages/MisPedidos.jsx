import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { obtenerMisPedidos } from '../services/pedidos.service';
import { mensajeError } from '../services/api';
import { formatPrice } from '../utils/formatPrice';
import { formatFecha } from '../utils/formatFecha';
import EstadoBadge from '../components/pedido/EstadoBadge';

const FILTROS = ['Todos', 'Pendiente', 'En proceso', 'Entregado', 'Anulado'];

export default function MisPedidos() {
  const [pedidos, setPedidos] = useState(null);
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState('Todos');

  useEffect(() => {
    obtenerMisPedidos()
      .then(setPedidos)
      .catch((e) => setError(mensajeError(e, 'No se pudieron cargar tus pedidos.')));
  }, []);

  if (error) return <p className="mensaje-error">{error}</p>;
  if (!pedidos) return <p>Cargando pedidos...</p>;

  if (pedidos.length === 0) {
    return (
      <div className="caja vacio">
        <h1>Aún no tienes pedidos</h1>
        <p className="texto-gris">Cuando realices una compra, aparecerá aquí.</p>
        <Link className="btn" to="/catalogo">Ir al catálogo</Link>
      </div>
    );
  }

  const contar = (f) => (f === 'Todos' ? pedidos.length : pedidos.filter((p) => p.estado === f).length);
  const visibles = filtro === 'Todos' ? pedidos : pedidos.filter((p) => p.estado === filtro);

  return (
    <div>
      <h1>Mis pedidos</h1>

      <div className="filtros-estado">
        {FILTROS.map((f) => (
          <button key={f} className={`chip ${filtro === f ? 'activo' : ''}`} onClick={() => setFiltro(f)}>
            {f} ({contar(f)})
          </button>
        ))}
      </div>

      {visibles.length === 0 ? (
        <p className="caja vacio texto-gris">No tienes pedidos con estado "{filtro}".</p>
      ) : (
        <div className="lista-pedidos">
          {visibles.map((p) => <TarjetaPedido key={p.id} pedido={p} />)}
        </div>
      )}
    </div>
  );
}

function TarjetaPedido({ pedido }) {
  const primeros = pedido.items.slice(0, 3);
  const resto = pedido.items.length - primeros.length;

  return (
    <article className="caja pedido-card">
      <header className="pedido-cabecera">
        <div>
          <h2>Pedido N.º {pedido.id}</h2>
          <p className="texto-gris">{formatFecha(pedido.fecha)}</p>
        </div>
        <EstadoBadge estado={pedido.estado} />
      </header>

      <ul className="pedido-productos">
        {primeros.map((i) => (
          <li key={i.idProducto}>
            <span className="mini-imagen">{i.imagen ? <img src={i.imagen} alt="" /> : '—'}</span>
            <span>{i.nombre} <span className="texto-gris">× {i.cantidad}</span></span>
          </li>
        ))}
        {resto > 0 && <li className="texto-gris">y {resto} producto(s) más</li>}
      </ul>

      <footer className="pedido-pie">
        <span className="texto-gris">{pedido.tipoEntrega} · {pedido.metodoPago}</span>
        <span className="pedido-total">Total: {formatPrice(pedido.total)}</span>
        <Link to={`/mis-pedidos/${pedido.id}`} className="btn btn-secundario">Ver detalle</Link>
      </footer>
    </article>
  );
}