const aCentimos = (n) => Math.round(Number(n) * 100);

export function calcularTotales({ subtotal, tipoEntrega, comisionPorcentaje, costoEnvio }) {
  const subCent = aCentimos(subtotal);
  const comCent = Math.round((subCent * Number(comisionPorcentaje || 0)) / 100);
  const envioCent = tipoEntrega === 'Delivery' ? aCentimos(costoEnvio) : 0;
  return {
    subtotal: subCent / 100,
    comision: comCent / 100,
    costoEnvio: envioCent / 100,
    total: (subCent + comCent + envioCent) / 100,
  };
}