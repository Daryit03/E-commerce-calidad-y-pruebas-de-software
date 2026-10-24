// Pruebas unitarias de las reglas de compra (HO8)
// No usan base de datos: solo prueban los cálculos y validaciones.
const {
  COSTO_ENVIO,
  calcularTotales,
  metodoPermitido,
  validarDireccion,
  textoDireccion,
} = require('../src/domain/pedido/reglas');

// ---------------------------------------------------------------
// RF0037, RF0070, RF0076: cálculo de totales
// ---------------------------------------------------------------
describe('calcularTotales', () => {
  test('DP01: Delivery + Tarjeta suma envío y recargo del 5 %', () => {
    const r = calcularTotales({ subtotal: 326.8, tipoEntrega: 'Delivery', comisionPorcentaje: 5 });
    expect(r).toEqual({ subtotal: 326.8, comision: 16.34, costoEnvio: 15, total: 358.14 });
  });

  test('DP02: Delivery + Yape cobra envío pero no recargo', () => {
    const r = calcularTotales({ subtotal: 326.8, tipoEntrega: 'Delivery', comisionPorcentaje: 0 });
    expect(r.comision).toBe(0);
    expect(r.costoEnvio).toBe(15);
    expect(r.total).toBe(341.8);
  });

  test('DP04: Recojo en tienda no cobra envío', () => {
    const r = calcularTotales({ subtotal: 59.9, tipoEntrega: 'Recojo en tienda', comisionPorcentaje: 0 });
    expect(r.costoEnvio).toBe(0);
    expect(r.total).toBe(59.9);
  });

  test('DP05: Recojo + Tarjeta aplica el 5 % solo sobre los productos', () => {
    const r = calcularTotales({ subtotal: 119.8, tipoEntrega: 'Recojo en tienda', comisionPorcentaje: 5 });
    expect(r.comision).toBe(5.99);
    expect(r.total).toBe(125.79);
  });

  test('el recargo NO se calcula sobre el envío', () => {
    const r = calcularTotales({ subtotal: 100, tipoEntrega: 'Delivery', comisionPorcentaje: 5 });
    expect(r.comision).toBe(5);          // 5 % de 100, no de 115
    expect(r.total).toBe(120);           // 100 + 5 + 15
  });

  test('si no se indica el porcentaje, no hay recargo', () => {
    const r = calcularTotales({ subtotal: 50, tipoEntrega: 'Recojo en tienda' });
    expect(r.comision).toBe(0);
    expect(r.total).toBe(50);
  });

  test('trabaja en céntimos: evita el error 0.1 + 0.2 = 0.30000000000000004', () => {
    const r = calcularTotales({ subtotal: 0.1 + 0.2, tipoEntrega: 'Recojo en tienda', comisionPorcentaje: 0 });
    expect(r.total).toBe(0.3);
  });

  test('el costo de envío es S/ 15', () => {
    expect(COSTO_ENVIO).toBe(15);
  });
});

// ---------------------------------------------------------------
// RF0077: método de pago según el tipo de entrega
// ---------------------------------------------------------------
describe('metodoPermitido', () => {
  const efectivoTienda = { nombre: 'Efectivo en tienda', tipoEntrega: 'Recojo en tienda' };
  const contraEntrega = { nombre: 'Pago contra entrega', tipoEntrega: 'Delivery' };
  const tarjeta = { nombre: 'Tarjeta', tipoEntrega: null };

  test('Efectivo en tienda solo se permite con Recojo en tienda', () => {
    expect(metodoPermitido(efectivoTienda, 'Recojo en tienda')).toBe(true);
    expect(metodoPermitido(efectivoTienda, 'Delivery')).toBe(false);
  });

  test('Pago contra entrega solo se permite con Delivery', () => {
    expect(metodoPermitido(contraEntrega, 'Delivery')).toBe(true);
    expect(metodoPermitido(contraEntrega, 'Recojo en tienda')).toBe(false);
  });

  test('Tarjeta (y Yape) sirven para ambos tipos de entrega', () => {
    expect(metodoPermitido(tarjeta, 'Delivery')).toBe(true);
    expect(metodoPermitido(tarjeta, 'Recojo en tienda')).toBe(true);
  });
});

// ---------------------------------------------------------------
// RF0036 / RF0039: validación de la dirección de entrega
// ---------------------------------------------------------------
describe('validarDireccion', () => {
  const valida = {
    departamento: 'Lima',
    provincia: 'Lima',
    distrito: 'San Martín de Porres',
    direccion: 'Av. Perú 1234',
    referencia: 'Frente al parque',
  };

  test('una dirección completa no tiene errores', () => {
    expect(validarDireccion(valida)).toEqual({});
  });

  test('DP07: una dirección vacía marca los 4 campos obligatorios', () => {
    const e = validarDireccion({});
    expect(Object.keys(e).sort()).toEqual(['departamento', 'direccion', 'distrito', 'provincia']);
  });

  test('la dirección debe tener al menos 5 caracteres (valor límite)', () => {
    expect(validarDireccion({ ...valida, direccion: 'Av 1' }).direccion).toBeDefined(); // 4: error
    expect(validarDireccion({ ...valida, direccion: 'Av 12' }).direccion).toBeUndefined(); // 5: válido
  });

  test('el departamento acepta hasta 100 caracteres (valor límite)', () => {
    expect(validarDireccion({ ...valida, departamento: 'a'.repeat(100) }).departamento).toBeUndefined();
    expect(validarDireccion({ ...valida, departamento: 'a'.repeat(101) }).departamento).toBe('Máximo 100 caracteres');
  });

  test('la referencia es opcional, pero máximo 250 caracteres', () => {
    expect(validarDireccion({ ...valida, referencia: '' })).toEqual({});
    expect(validarDireccion({ ...valida, referencia: 'a'.repeat(251) }).referencia).toBe('Máximo 250 caracteres');
  });
});

// ---------------------------------------------------------------
// Texto de la dirección que se muestra en el pedido
// ---------------------------------------------------------------
describe('textoDireccion', () => {
  test('arma el texto "dirección, distrito, provincia"', () => {
    const d = { direccion: 'Av. Perú 1234', distrito: 'San Martín de Porres', provincia: 'Lima' };
    expect(textoDireccion(d)).toBe('Av. Perú 1234, San Martín de Porres, Lima');
  });

  test('sin dirección (recojo en tienda) devuelve null', () => {
    expect(textoDireccion(null)).toBeNull();
  });
});