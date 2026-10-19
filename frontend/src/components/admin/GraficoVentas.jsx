
import { formatPrice } from '../../utils/formatPrice';

// Redondea el máximo hacia arriba a un número "bonito" (1, 2, 5, 10, 20, 50...)
function techoBonito(valor) {
  if (valor <= 0) return 100;
  const potencia = 10 ** Math.floor(Math.log10(valor));
  const n = valor / potencia;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * potencia;
}

const etiquetaDia = (iso) => {
  const [, mes, dia] = iso.split('-');
  return `${dia}/${mes}`;
};

export default function GraficoVentas({ datos }) {
  const techo = techoBonito(Math.max(...datos.map((d) => d.total)));
  const totalPeriodo = datos.reduce((t, d) => t + d.total, 0);

  return (
    <figure className="grafico">
      <figcaption className="texto-gris nota">
        Total del periodo: <b>{formatPrice(totalPeriodo)}</b> · no incluye pedidos anulados
      </figcaption>

      <div className="grafico-cuerpo">
        <div className="grafico-eje-y" aria-hidden="true">
          <span>{formatPrice(techo)}</span>
          <span>{formatPrice(techo / 2)}</span>
          <span>S/ 0</span>
        </div>

        <div className="grafico-area" role="img" aria-label={`Ventas diarias de los últimos ${datos.length} días`}>
          {datos.map((d) => (
            <div key={d.dia} className="grafico-col" tabIndex={0}>
              <div className="grafico-barra" style={{ height: `${(d.total / techo) * 100}%` }} />
              <div className="grafico-tooltip" role="tooltip">
                <b>{etiquetaDia(d.dia)}</b>
                <span>{formatPrice(d.total)}</span>
                <span>{d.pedidos} pedido(s)</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Etiqueta un día sí y otro no, terminando siempre en hoy */}
      <div className="grafico-eje-x" aria-hidden="true">
        {datos.map((d, i) => (
          <span key={d.dia}>{(datos.length - 1 - i) % 2 === 0 ? etiquetaDia(d.dia) : ''}</span>
        ))}
      </div>

      <details className="grafico-tabla">
        <summary>Ver como tabla</summary>
        <table className="tabla-admin">
          <thead><tr><th>Día</th><th>Pedidos</th><th>Ventas</th></tr></thead>
          <tbody>
            {datos.map((d) => (
              <tr key={d.dia}><td>{etiquetaDia(d.dia)}</td><td>{d.pedidos}</td><td>{formatPrice(d.total)}</td></tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}