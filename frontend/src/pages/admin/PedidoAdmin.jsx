import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { obtenerPedidoAdmin, cambiarEstadoPedido, cambiarEstadoPago } from '../../services/admin.service';
import { mensajeError } from '../../services/api';
import { formatPrice } from '../../utils/formatPrice';
import { formatFecha } from '../../utils/formatFecha';
import EstadoBadge from '../../components/pedido/EstadoBadge';

export default function PedidoAdmin() {
  const { id } = useParams();
  const [pedido, setPedido] = useState(null);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState({ tipo: '', texto: '' });
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [observacion, setObservacion] = useState('');
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(() => {
    return obtenerPedidoAdmin(id)
      .then(setPedido)
      .catch((e) => setError(e.response?.status === 404 ? 'El pedido no existe.' : mensajeError(e, 'No se pudo cargar.')));
  }, [id]);

  useEffect(() => { cargar(); }, [cargar]);

  async function guardarEstado() {
    if (!nuevoEstado) return;
    if (nuevoEstado === 'Anulado') {
      if (!observacion.trim()) return setAviso({ tipo: 'error', texto: 'Escribe el motivo de la anulación.' });
      if (!window.confirm('¿Anular este pedido?\nEl stock de sus productos se devolverá al inventario.')) return;
    }
    setGuardando(true);
    try {
      const r = await cambiarEstadoPedido(id, nuevoEstado, observacion);
      setPedido(r.pedido);
      setAviso({ tipo: 'exito', texto: r.mensaje });
      setNuevoEstado('');
      setObservacion('');
    } catch (e) {
      setAviso({ tipo: 'error', texto: mensajeError(e, 'No se pudo cambiar el estado.') });
    } finally {
      setGuardando(false);
    }
  }

  async function cambiarPago(estado) {
    if (!window.confirm(`¿Marcar el pago como "${estado}"?`)) return;
    try {
      const r = await cambiarEstadoPago(id, estado);
      setPedido(r.pedido);
      setAviso({ tipo: 'exito', texto: r.mensaje });
    } catch (e) {
      setAviso({ tipo: 'error', texto: mensajeError(e, 'No se pudo actualizar el pago.') });
    }
  }

  if (error) return <div className="caja vacio"><p className="mensaje-error">{error}</p><Link className="btn" to="/admin/pedidos">Volver</Link></div>;
  if (!pedido) return <p>Cargando...</p>;

  const c = pedido.cliente;

  return (
    <div>
      <p className="migas"><Link to="/admin/pedidos">Pedidos</Link> / N.º {pedido.id}</p>
      <div className="pedido-titulo">
        <h1>Pedido N.º {pedido.id}</h1>
        <EstadoBadge estado={pedido.estado} />
      </div>
      <p className="texto-gris">Realizado el {formatFecha(pedido.fecha)}</p>
      {aviso.texto && <p className={aviso.tipo === 'exito' ? 'mensaje-exito' : 'mensaje-error'}>{aviso.texto}</p>}

      <div className="pedido-detalle">
        <div className="pedido-lateral">
          {/* CAMBIAR ESTADO */}
          <section className="caja">
            <h2>Atender pedido</h2>
            {pedido.transiciones.length === 0 ? (
              <p className="texto-gris">Este pedido está <b>{pedido.estado}</b> y ya no admite cambios.</p>
            ) : (
              <div className="auth-form cambiar-estado">
                <div className="opciones-estado">
                  {pedido.transiciones.map((t) => (
                    <button key={t} type="button"
                      className={`chip ${nuevoEstado === t ? 'activo' : ''} ${t === 'Anulado' ? 'chip-peligro' : ''}`}
                      onClick={() => setNuevoEstado(t)}>
                      {t === 'Anulado' ? 'Anular' : `Pasar a "${t}"`}
                    </button>
                  ))}
                </div>
                {nuevoEstado && (
                  <>
                    <label>
                      Observación {nuevoEstado === 'Anulado' ? '(motivo obligatorio)' : '(opcional)'}
                      <textarea rows={2} maxLength={300} value={observacion} onChange={(e) => setObservacion(e.target.value)}
                        placeholder={nuevoEstado === 'Anulado' ? 'Ej.: El cliente canceló la compra' : 'Ej.: Pedido en camino con el repartidor'} />
                    </label>
                    <button className={`btn ${nuevoEstado === 'Anulado' ? 'btn-peligro' : ''}`} onClick={guardarEstado} disabled={guardando}>
                      {guardando ? 'Guardando...' : `Confirmar: ${nuevoEstado}`}
                    </button>
                  </>
                )}
              </div>
            )}
          </section>

          {/* PRODUCTOS */}
          <section className="caja">
            <h2>Productos</h2>
            {pedido.items.map((i) => (
              <div key={i.idProducto} className="item-pedido">
                <span className="item-imagen">{i.imagen ? <img src={i.imagen} alt="" /> : <span>Sin imagen</span>}</span>
                <div>
                  <p className="texto-gris">{i.marca}</p>
                  <b>{i.nombre}</b>
                  <p className="texto-gris">{formatPrice(i.precio)} × {i.cantidad}</p>
                </div>
                <p className="item-subtotal">{formatPrice(i.subtotal)}</p>
              </div>
            ))}
            <div className="pedido-totales">
              <div className="fila"><span>Subtotal</span><span>{formatPrice(pedido.subtotal)}</span></div>
              <div className="fila"><span>Envío</span><span>{pedido.costoEnvio > 0 ? formatPrice(pedido.costoEnvio) : 'Gratis'}</span></div>
              {pedido.comision > 0 && <div className="fila"><span>Recargo por tarjeta</span><span>{formatPrice(pedido.comision)}</span></div>}
              <div className="fila total"><span>Total</span><span>{formatPrice(pedido.total)}</span></div>
            </div>
          </section>
        </div>

        <aside className="pedido-lateral">
          <section className="caja">
            <h2>Cliente</h2>
            <p><b>{c.nombres} {c.apellidos}</b></p>
            <p className="texto-gris">DNI: {c.dni}</p>
            <p className="texto-gris">Celular: {c.telefono || '—'}</p>
            <p className="texto-gris">Correo: {c.correo}</p>
            <Link to={`/admin/clientes/${c.id}`} className="btn-link">Ver historial del cliente →</Link>
          </section>

          <section className="caja">
            <h2>Entrega</h2>
            <p><b>{pedido.tipoEntrega}</b></p>
            <p className="texto-gris">{pedido.direccion || 'Recoge en la tienda (San Martín de Porres)'}</p>
          </section>

          <section className="caja">
            <h2>Pago</h2>
            <p><b>{pedido.metodoPago}</b></p>
            {pedido.pago && <p>Estado: <EstadoBadge estado={pedido.pago.estado} /></p>}
            {pedido.pago?.referencia && <p className="texto-gris">Referencia / N.º operación: <b>{pedido.pago.referencia}</b></p>}
            <div className="opciones-estado">
              {pedido.transicionesPago.map((t) => (
                <button key={t} className={`chip ${t === 'Rechazado' || t === 'Reembolsado' ? 'chip-peligro' : ''}`}
                  onClick={() => cambiarPago(t)}>
                  Marcar {t}
                </button>
              ))}
            </div>
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