import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { mensajeError } from '../services/api';
import { formatPrice } from '../utils/formatPrice';

export default function Carrito() {
  const { carrito, actualizar, eliminar, vaciar } = useCart();
  const [ocupado, setOcupado] = useState(null); // id del producto que se está actualizando
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  async function ejecutar(id, accion) {
    setOcupado(id);
    setMensaje({ tipo: '', texto: '' });
    try {
      const r = await accion();
      if (r?.mensaje) setMensaje({ tipo: 'exito', texto: r.mensaje });
    } catch (err) {
      setMensaje({ tipo: 'error', texto: mensajeError(err, 'No se pudo actualizar el carrito.') });
    } finally {
      setOcupado(null);
    }
  }

  function confirmarVaciar() {
    if (window.confirm('¿Seguro que quieres vaciar tu carrito?')) ejecutar('todo', vaciar);
  }

  if (!carrito) return <p>Cargando carrito...</p>;

  if (carrito.items.length === 0) {
    return (
      <div className="caja vacio">
        <h1>Tu carrito está vacío</h1>
        {mensaje.texto && <p className="mensaje-exito">{mensaje.texto}</p>}
        <p className="texto-gris">Agrega productos desde el catálogo.</p>
        <Link className="btn" to="/catalogo">Ir al catálogo</Link>
      </div>
    );
  }

  return (
    <div>
      <h1>Mi carrito</h1>
      {mensaje.texto && (
        <p className={mensaje.tipo === 'exito' ? 'mensaje-exito' : 'mensaje-error'}>{mensaje.texto}</p>
      )}

      <div className="carrito">
        <div className="caja carrito-lista">
          {carrito.items.map((item) => (
            <ItemCarrito
              key={item.idProducto}
              item={item}
              ocupado={ocupado !== null}
              onCantidad={(c) => ejecutar(item.idProducto, () => actualizar(item.idProducto, c))}
              onEliminar={() => ejecutar(item.idProducto, () => eliminar(item.idProducto))}
            />
          ))}
        </div>

        <aside className="caja carrito-resumen">
          <h2>Resumen</h2>
          <div className="fila">
            <span>Productos ({carrito.cantidadProductos})</span>
            <span>{formatPrice(carrito.total)}</span>
          </div>
          <p className="texto-gris nota">El costo de envío y el recargo por pago con tarjeta se calculan al finalizar la compra.</p>
          <div className="fila total">
            <span>Total</span>
            <span>{formatPrice(carrito.total)}</span>
          </div>
          {!carrito.listoParaComprar && (
            <p className="mensaje-error">Revisa los productos marcados antes de continuar.</p>
          )}
          {carrito.listoParaComprar ? (
            <Link to="/checkout" className="btn btn-bloque">Continuar compra</Link>
          ) : (
            <button className="btn btn-bloque" disabled>Continuar compra</button>
          )}
          <Link to="/catalogo" className="btn btn-secundario btn-bloque">Seguir comprando</Link>
          <button className="btn-link" onClick={confirmarVaciar} disabled={ocupado !== null}>
            Vaciar carrito
          </button>
        </aside>
      </div>
    </div>
  );
}

function ItemCarrito({ item, ocupado, onCantidad, onEliminar }) {
  const maximo = Math.min(item.stock, 99);

  return (
    <div className={`item-carrito ${item.aviso ? 'con-aviso' : ''}`}>
      <Link to={`/producto/${item.idProducto}`} className="item-imagen">
        {item.imagen ? <img src={item.imagen} alt={item.nombre} /> : <span>Sin imagen</span>}
      </Link>

      <div className="item-info">
        <p className="texto-gris">{item.marca}</p>
        <Link to={`/producto/${item.idProducto}`} className="item-nombre">{item.nombre}</Link>
        <p>{formatPrice(item.precio)} c/u</p>
        {item.aviso && <p className="campo-error">{item.aviso}</p>}
        {item.disponible && item.cantidad > maximo && (
          <button className="btn-link" onClick={() => onCantidad(maximo)} disabled={ocupado}>
            Ajustar a {maximo}
          </button>
        )}
      </div>

      <div className="cantidad">
        <button onClick={() => onCantidad(item.cantidad - 1)} disabled={ocupado || item.cantidad <= 1}>−</button>
        <span>{item.cantidad}</span>
        <button onClick={() => onCantidad(item.cantidad + 1)}
          disabled={ocupado || !item.disponible || item.cantidad >= maximo}>+</button>
      </div>

      <p className="item-subtotal">{formatPrice(item.subtotal)}</p>

      <button className="btn-link" onClick={onEliminar} disabled={ocupado}>Eliminar</button>
    </div>
  );
}