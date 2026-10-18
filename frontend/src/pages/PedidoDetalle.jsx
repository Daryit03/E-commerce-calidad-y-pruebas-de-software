import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { obtenerPedido } from '../services/pedidos.service';
import { mensajeError } from '../services/api';
import { formatPrice } from '../utils/formatPrice';
import { formatFecha } from '../utils/formatFecha';
import EstadoBadge from '../components/pedido/EstadoBadge';

const PASOS = ['Pendiente', 'En proceso', 'Entregado'];

export default function PedidoDetalle() {
  const { id } = useParams();
  const [pedido, setPedido] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    obtenerPedido(id)
      .then(setPedido)
      .catch((e) =>
        setError(e.response?.status === 404 ? 'Pedido no encontrado.' : mensajeError(e, 'No se pudo cargar el pedido.'))
      );
  }, [id]);

  if (error) {
    return (
      <div className="caja vacio">
        <p className="mensaje-error">{error}</p>
        <Link className="btn" to="/mis-pedidos">Volver a mis pedidos</Link>
      </div>
    );
  }
  if (!pedido) return <p>Cargando pedido...</p>;

  const pasoActual = PASOS.indexOf(pedido.estado);

  return (
    <div>
      <p className="migas"><Link to="/mis-pedidos">Mis pedidos</Link> / Pedido N.º {pedido.id}</p>

      <div className="pedido-titulo">
        <h1>Pedido N.º {pedido.id}</h1>
        <EstadoBadge estado={pedido.estado} />
      </div>
      <p className="texto-gris">Realizado el {formatFecha(pedido.fecha)}</p>

      {pedido.estado === 'Anulado' ? (
        <p className="mensaje-error">Este pedido fue anulado.</p>
      ) : (
        <ol className="progreso">
          {PASOS.map((paso, i) => (
            <li key={paso} className={i <= pasoActual ? 'hecho' : ''}>
              <span className="punto">{i <= pasoActual ? '✓' : i + 1}</span>
              {paso}
            </li>
          ))}
        </ol>
      )}

      <div className="pedido-detalle">
        <section className="caja">
          <h2>Productos</h2>
          {pedido.items.map((i) => (
            <div key={i.idProducto} className="item-pedido">
              <Link to={`/producto/${i.idProducto}`} className="item-imagen">
                {i.imagen ? <img src={i.imagen} alt={i.nombre} /> : <span>Sin imagen</span>}
              </Link>
              <div>
                <p className="texto-gris">{i.marca}</p>
                <Link to={`/producto/${i.idProducto}`} className="item-nombre">{i.nombre}</Link>
                <p className="texto-gris">{formatPrice(i.precio)} × {i.cantidad}</p>
              </div>
              <p className="item-subtotal">{formatPrice(i.subtotal)}</p>
            </div>
          ))}

          <div className="pedido-totales">
            <div className="fila"><span>Subtotal</span><span>{formatPrice(pedido.subtotal)}</span></div>
            <div className="fila"><span>Envío</span><span>{pedido.costoEnvio > 0 ? formatPrice(pedido.costoEnvio) : 'Gratis'}</span></div>
            {pedido.comision > 0 && (
              <div className="fila"><span>Recargo por tarjeta</span><span>{formatPrice(pedido.comision)}</span></div>
            )}
            <div className="fila total"><span>Total</span><span>{formatPrice(pedido.total)}</span></div>
          </div>
        </section>

        <aside className="pedido-lateral">
          <section className="caja">
            <h2>Entrega</h2>
            <p><b>{pedido.tipoEntrega}</b></p>
            <p className="texto-gris">{pedido.direccion || 'Recojo en tienda: San Martín de Porres, Lima'}</p>
          </section>

          <section className="caja">
            <h2>Pago</h2>
            <p><b>{pedido.metodoPago}</b></p>
            {pedido.pago && <p>Estado: <EstadoBadge estado={pedido.pago.estado} /></p>}
            {pedido.pago?.referencia && <p className="texto-gris">Referencia: {pedido.pago.referencia}</p>}
          </section>

          <section className="caja">
            <h2>Historial</h2>
            <ul className="historial">
              {pedido.historial.map((h, i) => (
                <li key={i}>
                  <b>{h.estado}</b>
                  <span className="texto-gris">{formatFecha(h.fecha)}</span>
                  {h.observacion && <span>{h.observacion}</span>}
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}