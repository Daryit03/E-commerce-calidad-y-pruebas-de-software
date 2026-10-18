const { ValidacionError } = require('../../domain/errors');
const Carrito = require('../../domain/carrito/Carrito');
const {
  TIPOS_ENTREGA, COSTO_ENVIO, METODO_TARJETA, METODO_YAPE,
  calcularTotales, metodoPermitido, validarDireccion, textoDireccion,
} = require('../../domain/pedido/reglas');

const entero = (v) => (Number.isInteger(Number(v)) ? Number(v) : NaN);
const limpiar = (v) => String(v ?? '').trim().replace(/\s+/g, ' ');
const REFERENCIA_YAPE = /^[A-Za-z0-9-]{4,30}$/;

function crearCasosDeUsoCheckout({ pedidoRepository, carritoRepository, pasarelaPago, yape }) {
  return {
    // Datos para armar la pantalla de compra
    async opciones(idUsuario) {
      const [metodosPago, direcciones] = await Promise.all([
        pedidoRepository.listarMetodosPago(),
        pedidoRepository.listarDirecciones(idUsuario),
      ]);
      return { tiposEntrega: TIPOS_ENTREGA, costoEnvio: COSTO_ENVIO, metodosPago, direcciones, yape };
    },

    // HO8 - Realizar compra
    async confirmar(idUsuario, datos = {}) {
      const tipoEntrega = String(datos.tipoEntrega ?? '');
      const idMetodoPago = entero(datos.idMetodoPago);
      const idDireccion = datos.idDireccion ? entero(datos.idDireccion) : null;
      const referenciaPago = limpiar(datos.referenciaPago);
      const nuevaDireccion = datos.nuevaDireccion
        ? {
            departamento: limpiar(datos.nuevaDireccion.departamento),
            provincia: limpiar(datos.nuevaDireccion.provincia),
            distrito: limpiar(datos.nuevaDireccion.distrito),
            direccion: limpiar(datos.nuevaDireccion.direccion),
            referencia: limpiar(datos.nuevaDireccion.referencia),
          }
        : null;

      // 1) Tipo de entrega y método de pago
      const errores = {};
      if (!TIPOS_ENTREGA.includes(tipoEntrega)) errores.tipoEntrega = 'Elige cómo quieres recibir tu pedido';

      const metodo = idMetodoPago > 0 ? await pedidoRepository.buscarMetodoPago(idMetodoPago) : null;
      if (!metodo || !metodo.estado) errores.idMetodoPago = 'Elige un método de pago válido';
      else if (!errores.tipoEntrega && !metodoPermitido(metodo, tipoEntrega))
        errores.idMetodoPago = `"${metodo.nombre}" solo está disponible para ${metodo.tipoEntrega}`;

      if (metodo?.nombre === METODO_YAPE && !REFERENCIA_YAPE.test(referenciaPago))
        errores.referenciaPago = 'Ingresa el número de operación de Yape';

      // 2) Dirección (solo delivery)
      let direccion = null;
      if (tipoEntrega === 'Delivery') {
        if (idDireccion) {
          direccion = await pedidoRepository.buscarDireccion(idUsuario, idDireccion);
          if (!direccion) errores.idDireccion = 'La dirección elegida no es válida';
        } else if (nuevaDireccion) {
          Object.assign(errores, validarDireccion(nuevaDireccion));
          direccion = nuevaDireccion;
        } else {
          errores.idDireccion = 'Elige o escribe una dirección de entrega';
        }
      }

      if (Object.keys(errores).length) throw new ValidacionError('Revisa los datos de tu compra', errores);

      // 3) Carrito: no vacío y sin productos con problemas
      const carrito = new Carrito(await carritoRepository.listarItems(idUsuario)).aJSON();
      if (carrito.items.length === 0) throw new ValidacionError('Tu carrito está vacío');
      if (!carrito.listoParaComprar) throw new ValidacionError('Hay productos en tu carrito que necesitan revisión');

      // 4) Totales calculados en el servidor
      const totales = calcularTotales({
        subtotal: carrito.total,
        tipoEntrega,
        comisionPorcentaje: metodo.comisionPorcentaje,
      });

      // Si el precio cambió mientras el cliente estaba en el checkout, le avisamos
      if (datos.totalEsperado != null && Math.abs(Number(datos.totalEsperado) - totales.total) > 0.001)
        throw new ValidacionError('Los precios de tu carrito cambiaron. Revisa el nuevo total antes de confirmar.');

      // 5) Registrar el pedido (transacción en el repositorio)
      const registrado = await pedidoRepository.registrar({
        idUsuario,
        tipoEntrega,
        idDireccion: direccion?.id ?? null,
        nuevaDireccion: tipoEntrega === 'Delivery' && !direccion?.id ? nuevaDireccion : null,
        idMetodoPago: metodo.id,
        items: carrito.items,
        totales,
        pago: {
          estado: 'Pendiente',
          referencia: metodo.nombre === METODO_YAPE ? referenciaPago : null,
        },
      });

      // 6) Tarjeta: se cobra con la pasarela (por ahora simulada)
      let estadoPago = 'Pendiente';
      if (metodo.nombre === METODO_TARJETA) {
        const cobro = await pasarelaPago.cobrarTarjeta({ idPedido: registrado.id, monto: totales.total });
        estadoPago = cobro.aprobado ? 'Aprobado' : 'Rechazado';
        await pedidoRepository.actualizarPago(registrado.id, { estado: estadoPago, referencia: cobro.referencia });
      }

      return {
        mensaje: '¡Compra realizada con éxito!',
        pedido: {
          id: registrado.id,
          fecha: registrado.fecha,
          tipoEntrega,
          direccion: textoDireccion(direccion),
          metodoPago: metodo.nombre,
          estadoPago,
          items: carrito.items.map((i) => ({
            idProducto: i.idProducto, nombre: i.nombre, cantidad: i.cantidad, precio: i.precio, subtotal: i.subtotal,
          })),
          ...totales,
        },
      };
    },
  };
}

module.exports = { crearCasosDeUsoCheckout };