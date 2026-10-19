import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { obtenerDashboard } from '../../services/admin.service';
import { mensajeError } from '../../services/api';
import { formatPrice } from '../../utils/formatPrice';
import { formatFecha } from '../../utils/formatFecha';
import EstadoBadge from '../../components/pedido/EstadoBadge';
import GraficoVentas from '../../components/admin/GraficoVentas';

// RF0053 - Acceso rápido a los módulos
const ACCESOS = [
  { to: '/admin/productos/nuevo', texto: '+ Publicar producto' },
  { to: '/admin/productos', texto: 'Productos' },
  { to: '/admin/pedidos', texto: 'Pedidos' },
  { to: '/admin/clientes', texto: 'Clientes' },
  { to: '/admin/clasificacion', texto: 'Categorías y marcas' },
];

function Kpi({ titulo, valor, detalle, enlace }) {
  const contenido = (
    <>
      <span className="texto-gris">{titulo}</span>
      <span className="kpi-valor">{valor}</span>
      <span className="texto-gris nota">{detalle}</span>
    </>
  );
  return enlace
    ? <Link to={enlace} className="caja kpi">{contenido}</Link>
    : <div className="caja kpi">{contenido}</div>;
}

export default function AdminInicio() {
  const { usuario } = useAuth();
  const [d, setD] = useState(null);
  const [error, setError] = useState('');

  const cargar = useCallback(() => {
    setError('');
    return obtenerDashboard()
      .then(setD)
      .catch((e) => setError(mensajeError(e, 'No se pudieron cargar los indicadores.')));
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  return (
    <div>
      {/* RF0054 - Nombre del administrador */}
      <div className="seccion-cabecera">
        <div>
          <h1>¡Hola, {usuario.nombres}!</h1>
          <p className="texto-gris">Resumen de Electro Ferretero Darvin S.A.C.</p>
        </div>
        <button className="btn btn-secundario btn-chico" onClick={cargar}>↻ Actualizar</button>
      </div>

      <nav className="accesos" aria-label="Accesos rápidos">
        {ACCESOS.map((a) => <Link key={a.to} to={a.to} className="chip">{a.texto}</Link>)}
      </nav>

      {error && <p className="mensaje-error">{error}</p>}

      {!d ? (
        !error && <p>Cargando indicadores...</p>
      ) : (
        <>
          {/* RF0052 - Indicadores de ventas */}
          <div className="kpis">
            <Kpi titulo="Ventas de hoy" valor={formatPrice(d.hoy.total)} detalle={`${d.hoy.pedidos} pedido(s)`} />
            <Kpi titulo="Ventas del mes" valor={formatPrice(d.mes.total)}
              detalle={`${d.mes.pedidos} pedido(s) · ticket prom. ${formatPrice(d.ticketPromedio)}`} />
            <Kpi titulo="Pedidos por atender" valor={d.pendientes} detalle={`${d.enProceso} en proceso`} enlace="/admin/pedidos" />
            <Kpi titulo="Yape por verificar" valor={d.yapePorVerificar} detalle="pagos pendientes" enlace="/admin/pedidos" />
            <Kpi titulo="Clientes nuevos" valor={d.clientesNuevos} detalle="este mes" enlace="/admin/clientes" />
          </div>

          <section className="caja">
            <h2 className="titulo-seccion">Ventas de los últimos 14 días</h2>
            <GraficoVentas datos={d.ventasPorDia} />
          </section>

          <div className="dashboard-grid">
            <section className="caja">
              <h2 className="titulo-seccion">Más vendidos (últimos 30 días)</h2>
              {d.masVendidos.length === 0 ? (
                <p className="texto-gris">Aún no hay ventas en este periodo.</p>
              ) : (
                <table className="tabla-admin">
                  <thead><tr><th>#</th><th>Producto</th><th>Unidades</th></tr></thead>
                  <tbody>
                    {d.masVendidos.map((p, i) => (
                      <tr key={p.id}><td>{i + 1}</td><td>{p.nombre}</td><td><b>{p.unidades}</b></td></tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>

            <section className="caja">
              <h2 className="titulo-seccion">Stock bajo (6 o menos)</h2>
              {d.stockBajo.length === 0 ? (
                <p className="texto-gris">Todo el inventario está bien abastecido.</p>
              ) : (
                <table className="tabla-admin">
                  <thead><tr><th>Producto</th><th>Stock</th><th></th></tr></thead>
                  <tbody>
                    {d.stockBajo.map((p) => (
                      <tr key={p.id}>
                        <td>{p.nombre}</td>
                        <td className={p.stock === 0 ? 'stock-cero' : 'stock-bajo'}>{p.stock === 0 ? 'Agotado' : p.stock}</td>
                        <td><Link to={`/admin/productos/${p.id}`} className="btn-link">Reponer →</Link></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          </div>

          <section className="caja">
            <div className="seccion-cabecera">
              <h2 className="titulo-seccion">Últimos pedidos</h2>
              <Link to="/admin/pedidos" className="btn-link">Ver todos →</Link>
            </div>
            {d.ultimosPedidos.length === 0 ? (
              <p className="texto-gris">Aún no hay pedidos.</p>
            ) : (
              <div className="tabla-contenedor">
                <table className="tabla-admin">
                  <thead><tr><th>N.º</th><th>Fecha</th><th>Cliente</th><th>Total</th><th>Estado</th><th></th></tr></thead>
                  <tbody>
                    {d.ultimosPedidos.map((p) => (
                      <tr key={p.id}>
                        <td><b>{p.id}</b></td>
                        <td>{formatFecha(p.fecha)}</td>
                        <td>{p.cliente}</td>
                        <td>{formatPrice(p.total)}</td>
                        <td><EstadoBadge estado={p.estado} /></td>
                        <td><Link to={`/admin/pedidos/${p.id}`} className="btn-link">Atender →</Link></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}