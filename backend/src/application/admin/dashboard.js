const DIAS_GRAFICO = 14;
const DIAS_TOP = 30;
const OFFSET_LIMA = 5 * 60 * 60 * 1000; // Lima = UTC-5 (Perú no usa horario de verano)

// Inicio de "hoy", del mes y de los rangos, según la hora de Lima
function fechasLima(ahora = Date.now()) {
  const l = new Date(ahora - OFFSET_LIMA);
  const y = l.getUTCFullYear();
  const m = l.getUTCMonth();
  const d = l.getUTCDate();
  const aLima = (dia) => new Date(Date.UTC(y, m, dia) + OFFSET_LIMA);
  return {
    y, m, d,
    inicioHoy: aLima(d),
    inicioMes: aLima(1),
    desdeGrafico: aLima(d - (DIAS_GRAFICO - 1)),
    desdeTop: aLima(d - (DIAS_TOP - 1)),
  };
}

function crearCasosDeUsoDashboard({ dashboardRepository }) {
  return {
    async obtener() {
      const f = fechasLima();
      const r = await dashboardRepository.indicadores(f);

      // Completa los días sin ventas con 0
      const porDia = new Map(r.ventasPorDia.map((v) => [v.dia, v]));
      const ventasPorDia = Array.from({ length: DIAS_GRAFICO }, (_, i) => {
        const dia = new Date(Date.UTC(f.y, f.m, f.d - (DIAS_GRAFICO - 1 - i))).toISOString().slice(0, 10);
        const v = porDia.get(dia);
        return { dia, total: v ? Number(v.total) : 0, pedidos: v ? Number(v.pedidos) : 0 };
      });

      const ticketPromedio = r.mes.pedidos ? Math.round((r.mes.total * 100) / r.mes.pedidos) / 100 : 0;
      return { ...r, ventasPorDia, ticketPromedio };
    },
  };
}

module.exports = { crearCasosDeUsoDashboard };