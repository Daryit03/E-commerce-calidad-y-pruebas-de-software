import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  listarProductosAdmin, cambiarEstadoProducto, cambiarDestacadoProducto, eliminarProducto,
} from '../../services/admin.service';
import { mensajeError } from '../../services/api';
import { formatPrice } from '../../utils/formatPrice';

export default function GestionProductos() {
  const location = useLocation();
  const [filtros, setFiltros] = useState({ q: '', estado: 'todos', pagina: 1 });
  const [texto, setTexto] = useState('');
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState(
    location.state?.aviso ? { tipo: 'exito', texto: location.state.aviso } : { tipo: '', texto: '' }
  );

  const cargar = useCallback(() => {
    return listarProductosAdmin(filtros)
      .then(setDatos)
      .catch((e) => setError(mensajeError(e, 'No se pudieron cargar los productos.')));
  }, [filtros]);

  useEffect(() => { cargar(); }, [cargar]);

  async function accion(promesa) {
    try {
      const r = await promesa;
      setAviso({ tipo: 'exito', texto: r.mensaje });
      cargar();
    } catch (e) {
      setAviso({ tipo: 'error', texto: mensajeError(e, 'No se pudo completar la acción.') });
    }
  }

  function alternarEstado(p) {
    if (p.estado && !window.confirm(`¿Desactivar "${p.nombre}"?\nDejará de mostrarse en la tienda, pero no se borra.`)) return;
    accion(cambiarEstadoProducto(p.id, !p.estado));
  }

  function borrar(p) {
    if (!window.confirm(`¿Eliminar DEFINITIVAMENTE "${p.nombre}"?\nEsta acción no se puede deshacer.`)) return;
    accion(eliminarProducto(p.id));
  }

  function buscar(e) {
    e.preventDefault();
    setFiltros((f) => ({ ...f, q: texto.trim(), pagina: 1 }));
  }

  if (error) return <p className="mensaje-error">{error}</p>;

  return (
    <div>
      <div className="seccion-cabecera">
        <h1>Productos</h1>
        <Link to="/admin/productos/nuevo" className="btn">+ Nuevo producto</Link>
      </div>

      {aviso.texto && <p className={aviso.tipo === 'exito' ? 'mensaje-exito' : 'mensaje-error'}>{aviso.texto}</p>}

      <div className="caja admin-filtros">
        <form onSubmit={buscar} className="admin-buscador">
          <input type="search" placeholder="Buscar por nombre o marca..." value={texto} onChange={(e) => setTexto(e.target.value)} />
          <button className="btn btn-chico">Buscar</button>
        </form>
        <select value={filtros.estado} onChange={(e) => setFiltros((f) => ({ ...f, estado: e.target.value, pagina: 1 }))}>
          <option value="todos">Todos</option>
          <option value="activos">Publicados</option>
          <option value="inactivos">Desactivados</option>
        </select>
      </div>

      {!datos ? (
        <p>Cargando...</p>
      ) : datos.productos.length === 0 ? (
        <p className="caja vacio texto-gris">No hay productos con esos filtros.</p>
      ) : (
        <>
          <p className="texto-gris">{datos.total} producto(s)</p>
          <div className="caja tabla-contenedor">
            <table className="tabla-admin">
              <thead>
                <tr>
                  <th></th><th>Producto</th><th>Precio</th><th>Stock</th><th>Estado</th>
                  <th title="Destacado en el inicio">★</th><th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {datos.productos.map((p) => (
                  <tr key={p.id} className={p.estado ? '' : 'fila-inactiva'}>
                    <td><span className="mini-imagen">{p.imagen ? <img src={p.imagen} alt="" /> : '—'}</span></td>
                    <td>
                      <b>{p.nombre}</b>
                      <span className="texto-gris celda-sub">{p.marca} · {p.categoria} › {p.subcategoria}</span>
                    </td>
                    <td>{formatPrice(p.precio)}</td>
                    <td className={p.stock === 0 ? 'stock-cero' : p.stock <= 6 ? 'stock-bajo' : ''}>{p.stock}</td>
                    <td>
                      <span className={`badge-estado ${p.estado ? 'estado-ok' : 'estado-mal'}`}>
                        {p.estado ? 'Publicado' : 'Desactivado'}
                      </span>
                    </td>
                    <td>
                      <button className={`estrella ${p.destacado ? 'activa' : ''}`}
                        title={p.destacado ? 'Quitar de destacados' : 'Marcar como destacado'}
                        onClick={() => accion(cambiarDestacadoProducto(p.id, !p.destacado))}>★</button>
                    </td>
                    <td className="acciones">
                      <Link to={`/admin/productos/${p.id}`} className="btn-link">Editar</Link>
                      <button className="btn-link" onClick={() => alternarEstado(p)}>{p.estado ? 'Desactivar' : 'Activar'}</button>
                      <button className="btn-link texto-peligro" onClick={() => borrar(p)}>Eliminar</button>
                    </td>
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