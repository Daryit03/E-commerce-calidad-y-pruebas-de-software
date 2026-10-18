import { Link, Navigate, useLocation } from 'react-router-dom';
import { formatPrice } from '../utils/formatPrice';

const MENSAJE_PAGO = {
  Tarjeta: 'Tu pago con tarjeta fue aprobado.',
  Yape: 'Verificaremos tu pago con Yape y te confirmaremos el pedido.',
  'Efectivo en tienda': 'Pagarás en efectivo al recoger tu pedido en la tienda.',
  'Pago contra entrega': 'Pagarás en efectivo al recibir tu pedido.',
};

export default function CompraExitosa() {
  const { state } = useLocation();
  if (!state?.pedido) return <Navigate to="/" replace />;
  const { pedido, mensaje } = state;

  return (
    <div className="caja confirmacion">
      <div className="check">✓</div>
      <h1>{mensaje}</h1>
      <p>Tu pedido <b>N.º {pedido.id}</b> fue registrado y está <b>Pendiente</b> de atención.</p>

      <ul className="resumen-items">
        {pedido.items.map((i) => (
          <li key={i.idProducto}>
            <span>{i.nombre} <span className="texto-gris">× {i.cantidad}</span></span>
            <span>{formatPrice(i.subtotal)}</span>
          </li>
        ))}
      </ul>
      <div className="fila"><span>Subtotal</span><span>{formatPrice(pedido.subtotal)}</span></div>
      <div className="fila"><span>Envío</span><span>{pedido.costoEnvio > 0 ? formatPrice(pedido.costoEnvio) : 'Gratis'}</span></div>
      {pedido.comision > 0 && (
        <div className="fila"><span>Recargo por tarjeta</span><span>{formatPrice(pedido.comision)}</span></div>
      )}
      <div className="fila total"><span>Total</span><span>{formatPrice(pedido.total)}</span></div>

      <div className="confirmacion-datos">
        <p><b>Entrega:</b> {pedido.tipoEntrega}{pedido.direccion ? ` — ${pedido.direccion}` : ' — San Martín de Porres, Lima'}</p>
        <p><b>Pago:</b> {pedido.metodoPago}. {MENSAJE_PAGO[pedido.metodoPago]}</p>
      </div>

      <div className="confirmacion-botones">
        <Link to="/catalogo" className="btn">Seguir comprando</Link>
        <Link to={`/mis-pedidos/${pedido.id}`} className="btn btn-secundario">Ver mi pedido</Link>
      </div>
    </div>
  );
}