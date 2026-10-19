import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listarClientesAdmin } from '../../services/admin.service';
import { mensajeError } from '../../services/api';
import { formatPrice } from '../../utils/formatPrice';
import { formatFecha } from '../../utils/formatFecha';

export default function GestionClientes() {
  const [filtros, setFiltros] = useState({ q: '', estado: 'todos', pagina: 1 });
  const [texto, setTexto] = useState('');
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    listarClientesAdmin(filtros)
      .then(setDatos)
      .catch((e) => setError(mensajeError(e, 'No se pudieron cargar los clientes.')));
  }, [filtros]);

  if (error) return <p className="mensaje-error">{error}</p>;

  return (
    <div>
      <h1>Clientes</h1>

      <div className="caja admin-filtros">
        <form className="admin-buscador" onSubmit={(e) => { e.preventDefault(); setFiltros((f) => ({ ...f, q: texto.trim(), pagina: 1 })); }}>
          <input type="search" placeholder="Nombre, apellido, DNI o correo..." value={texto} onChange={(e) => setTexto(e.target.value)} />
          <button className="btn btn-chico">Buscar</button>
        </form>
        <select value={filtros.estado} onChange={(e) => setFiltros((f) => ({ ...f, estado: e.target.value, pagina: 1 }))}>
          <option value="todos">Todos</option>
          <option value="activos">Activos</option>
          <option value="inactivos">Desactivados</option>
        </select>
      </div>

      {!datos ? (
        <p>Cargando...</p>
      ) : datos.clientes.length === 0 ? (
        <p className="caja vacio texto-gris">No hay clientes con esos filtros.</p>
      ) : (
        <>
          <p className="texto-gris">{datos.total} cliente(s)</p>
          <div className="caja tabla-contenedor">
            <table className="tabla-admin">
              <thead>
                <tr><th>Cliente</th><th>DNI</th><th>Contacto</th><th>Registro</th><th>Pedidos</th><th>Total comprado</th><th>Estado</th><th></th></tr>
              </thead>
              <tbody>
                {datos.clientes.map((c) => (
                  <tr key={c.id} className={c.estado ? '' : 'fila-inactiva'}>
                    <td><b>{c.nombres} {c.apellidos}</b></td>
                    <td>{c.dni}</td>
                    <td>{c.correo}<span className="texto-gris celda-sub">{c.telefono || '—'}</span></td>
                    <td>{formatFecha(c.fechaRegistro)}</td>
                    <td>{c.totalPedidos}</td>
                    <td><b>{formatPrice(c.totalGastado)}</b></td>
                    <td>
                      <span className={`badge-estado ${c.estado ? 'estado-ok' : 'estado-mal'}`}>{c.estado ? 'Activo' : 'Desactivado'}</span>
                    </td>
                    <td><Link to={`/admin/clientes/${c.id}`} className="btn-link">Ver →</Link></td>
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