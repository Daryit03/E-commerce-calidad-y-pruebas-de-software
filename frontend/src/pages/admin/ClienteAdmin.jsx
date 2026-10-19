import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { obtenerClienteAdmin, cambiarEstadoCliente } from '../../services/admin.service';
import { mensajeError } from '../../services/api';
import { formatPrice } from '../../utils/formatPrice';
import { formatFecha } from '../../utils/formatFecha';
import EstadoBadge from '../../components/pedido/EstadoBadge';

export default function ClienteAdmin() {
  const { id } = useParams();
  const [cliente, setCliente] = useState(null);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState({ tipo: '', texto: '' });

  const cargar = useCallback(() => {
    return obtenerClienteAdmin(id)
      .then(setCliente)
      .catch((e) => setError(e.response?.status === 404 ? 'El cliente no existe.' : mensajeError(e, 'No se pudo cargar.')));
  }, [id]);

  useEffect(() => { cargar(); }, [cargar]);

  async function alternarEstado() {
    const pregunta = cliente.estado
      ? `¿Desactivar la cuenta de ${cliente.nombres}?\nYa no podrá iniciar sesión ni comprar. Sus pedidos se conservan.`
      : `¿Activar la cuenta de ${cliente.nombres}?`;
    if (!window.confirm(pregunta)) return;
    try {
      const r = await cambiarEstadoCliente(id, !cliente.estado);
      setAviso({ tipo: 'exito', texto: r.mensaje });
      cargar();
    } catch (e) {
      setAviso({ tipo: 'error', texto: mensajeError(e, 'No se pudo cambiar el estado.') });
    }
  }

  if (error) return <div className="caja vacio"><p className="mensaje-error">{error}</p><Link className="btn" to="/admin/clientes">Volver</Link></div>;
  if (!cliente) return <p>Cargando...</p>;

  const { resumen } = cliente;

  return (
    <div>
      <p className="migas"><Link to="/admin/clientes">Clientes</Link> / {cliente.nombres} {cliente.apellidos}</p>
      <div className="seccion-cabecera">
        <div className="pedido-titulo">
          <h1>{cliente.nombres} {cliente.apellidos}</h1>
          <span className={`badge-estado ${cliente.estado ? 'estado-ok' : 'estado-mal'}`}>{cliente.estado ? 'Activo' : 'Desactivado'}</span>
        </div>
        <button className={`btn ${cliente.estado ? 'btn-peligro' : ''}`} onClick={alternarEstado}>
          {cliente.estado ? 'Desactivar cuenta' : 'Activar cuenta'}
        </button>
      </div>
      {aviso.texto && <p className={aviso.tipo === 'exito' ? 'mensaje-exito' : 'mensaje-error'}>{aviso.texto}</p>}

      <div className="resumen-cards">
        <div className="caja"><span className="texto-gris">Pedidos</span><b>{resumen.totalPedidos}</b></div>
        <div className="caja"><span className="texto-gris">Total comprado</span><b>{formatPrice(resumen.totalGastado)}</b></div>
        <div className="caja"><span className="texto-gris">Último pedido</span><b>{resumen.ultimoPedido ? formatFecha(resumen.ultimoPedido) : '—'}</b></div>
      </div>

      <div className="pedido-detalle">
        <section className="caja">
          <h2>Historial de compras</h2>
          {cliente.pedidos.length === 0 ? (
            <p className="texto-gris">Este cliente aún no ha realizado pedidos.</p>
          ) : (
            <div className="tabla-contenedor">
              <table className="tabla-admin">
                <thead><tr><th>N.º</th><th>Fecha</th><th>Productos</th><th>Total</th><th>Estado</th><th></th></tr></thead>
                <tbody>
                  {cliente.pedidos.map((p) => (
                    <tr key={p.id}>
                      <td><b>{p.id}</b></td>
                      <td>{formatFecha(p.fecha)}</td>
                      <td>{p.items.map((i) => `${i.nombre} ×${i.cantidad}`).join(', ')}</td>
                      <td><b>{formatPrice(p.total)}</b></td>
                      <td><EstadoBadge estado={p.estado} /></td>
                      <td><Link to={`/admin/pedidos/${p.id}`} className="btn-link">Ver →</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <aside className="caja">
          <h2>Datos</h2>
          <p><span className="texto-gris">DNI:</span> {cliente.dni}</p>
          <p><span className="texto-gris">Correo:</span> {cliente.correo}</p>
          <p><span className="texto-gris">Celular:</span> {cliente.telefono || '—'}</p>
          <p><span className="texto-gris">Registrado:</span> {formatFecha(cliente.fechaRegistro)}</p>
        </aside>
      </div>
    </div>
  );
}