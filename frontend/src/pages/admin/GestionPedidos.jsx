import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listarPedidosAdmin } from '../../services/admin.service';
import { mensajeError } from '../../services/api';
import { formatPrice } from '../../utils/formatPrice';
import { formatFecha } from '../../utils/formatFecha';
import EstadoBadge from '../../components/pedido/EstadoBadge';

const ESTADOS = ['Pendiente', 'En proceso', 'Entregado', 'Anulado'];

export default function GestionPedidos() {
  const [filtros, setFiltros] = useState({ estado: '', q: '', pagina: 1 });
  const [texto, setTexto] = useState('');
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    listarPedidosAdmin(filtros)
      .then(setDatos)
      .catch((e) => setError(mensajeError(e, 'No se pudieron cargar los pedidos.')));
  }, [filtros]);

  if (error) return <p className="mensaje-error">{error}</p>;

  const conteo = datos?.conteoEstados ?? {};
  const totalTodos = Object.values(conteo).reduce((a, b) => a + b, 0);
  const filtrar = (cambios) => setFiltros((f) => ({ ...f, pagina: 1, ...cambios }));

  return (
    <div>
      <h1>Pedidos</h1>

      <div className="filtros-estado">
        <button className={`chip ${!filtros.estado ? 'activo' : ''}`} onClick={() => filtrar({ estado: '' })}>
          Todos ({totalTodos})
        </button>
        {ESTADOS.map((e) => (
          <button key={e} className={`chip ${filtros.estado === e ? 'activo' : ''}`} onClick={() => filtrar({ estado: e })}>
            {e} ({conteo[e] ?? 0})
          </button>
        ))}
      </div>

      <form className="caja admin-filtros" onSubmit={(e) => { e.preventDefault(); filtrar({ q: texto.trim() }); }}>
        <div className="admin-buscador">
          <input type="search" placeholder="N.º de pedido, nombre, DNI o correo del cliente..."
            value={texto} onChange={(e) => setTexto(e.target.value)} />
          <button className="btn btn-chico">Buscar</button>
        </div>
      </form>

      {!datos ? (
        <p>Cargando...</p>
      ) : datos.pedidos.length === 0 ? (
        <p className="caja vacio texto-gris">No hay pedidos con esos filtros.</p>
      ) : (
        <>
          <div className="caja tabla-contenedor">
            <table className="tabla-admin">
              <thead>
                <tr><th>N.º</th><th>Fecha</th><th>Cliente</th><th>Entrega</th><th>Pago</th><th>Total</th><th>Estado</th><th></th></tr>
              </thead>
              <tbody>
                {datos.pedidos.map((p) => (
                  <tr key={p.id}>
                    <td><b>{p.id}</b></td>
                    <td>{formatFecha(p.fecha)}</td>
                    <td>{p.cliente}<span className="texto-gris celda-sub">DNI {p.dni}</span></td>
                    <td>{p.tipoEntrega}</td>
                    <td>
                      {p.metodoPago}
                      {p.estadoPago && <span className="celda-sub"><EstadoBadge estado={p.estadoPago} /></span>}
                    </td>
                    <td><b>{formatPrice(p.total)}</b></td>
                    <td><EstadoBadge estado={p.estado} /></td>
                    <td><Link to={`/admin/pedidos/${p.id}`} className="btn-link">Atender →</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {datos.totalPaginas > 1 && (
            <div className="paginacion">
              <button className="btn btn-secundario" disabled={filtros.pagina <= 1}
                onClick={() => setFiltros((f) => ({ ...f, pagina: f.pagina - 1 }))}>← Anterior</button>
              <span>Página {datos.pagina} de {datos.totalPaginas}</span>
              <button className="btn btn-secundario" disabled={filtros.pagina >= datos.totalPaginas}
                onClick={() => setFiltros((f) => ({ ...f, pagina: f.pagina + 1 }))}>Siguiente →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}