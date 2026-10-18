import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { obtenerOpciones, confirmarCompra } from '../services/checkout.service';
import { mensajeError } from '../services/api';
import { formatPrice } from '../utils/formatPrice';
import { calcularTotales } from '../utils/totales';
import Campo from '../components/ui/Campo';

const DIRECCION_VACIA = { departamento: 'Lima', provincia: 'Lima', distrito: '', direccion: '', referencia: '' };
const REFERENCIA_YAPE = /^[A-Za-z0-9-]{4,30}$/;

export default function Checkout() {
  const { carrito, recargar } = useCart();
  const navigate = useNavigate();

  const [opciones, setOpciones] = useState(null);
  const [errorCarga, setErrorCarga] = useState('');
  const [tipoEntrega, setTipoEntrega] = useState('');
  const [idDireccion, setIdDireccion] = useState('nueva');
  const [nuevaDireccion, setNuevaDireccion] = useState(DIRECCION_VACIA);
  const [idMetodoPago, setIdMetodoPago] = useState(null);
  const [referenciaPago, setReferenciaPago] = useState('');
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    obtenerOpciones()
      .then((o) => {
        setOpciones(o);
        if (o.direcciones.length) setIdDireccion(String(o.direcciones[0].id));
      })
      .catch((e) => setErrorCarga(mensajeError(e, 'No se pudieron cargar las opciones de compra.')));
  }, []);

  if (errorCarga) return <p className="mensaje-error">{errorCarga}</p>;
  if (!carrito || !opciones) return <p>Cargando...</p>;
  if (carrito.items.length === 0 || !carrito.listoParaComprar) return <Navigate to="/carrito" replace />;

  const metodo = opciones.metodosPago.find((m) => m.id === idMetodoPago) || null;
  const metodosVisibles = opciones.metodosPago.filter((m) => !m.tipoEntrega || m.tipoEntrega === tipoEntrega);
  const totales = calcularTotales({
    subtotal: carrito.total,
    tipoEntrega,
    comisionPorcentaje: metodo?.comisionPorcentaje ?? 0,
    costoEnvio: opciones.costoEnvio,
  });

  function limpiarError(campo) {
    setErrores((e) => ({ ...e, [campo]: undefined }));
    setErrorGeneral('');
  }

  function elegirEntrega(t) {
    setTipoEntrega(t);
    limpiarError('tipoEntrega');
    // Si el método elegido no sirve para esta entrega, se quita (RF0077)
    if (metodo && metodo.tipoEntrega && metodo.tipoEntrega !== t) setIdMetodoPago(null);
  }

  function cambiarDireccion(e) {
    const { name, value } = e.target;
    setNuevaDireccion((d) => ({ ...d, [name]: value }));
    limpiarError(name);
  }

  function validar() {
    const er = {};
    if (!tipoEntrega) er.tipoEntrega = 'Elige cómo quieres recibir tu pedido';
    if (!metodo) er.idMetodoPago = 'Elige un método de pago';
    if (tipoEntrega === 'Delivery' && idDireccion === 'nueva') {
      if (!nuevaDireccion.departamento.trim()) er.departamento = 'Ingresa el departamento';
      if (!nuevaDireccion.provincia.trim()) er.provincia = 'Ingresa la provincia';
      if (!nuevaDireccion.distrito.trim()) er.distrito = 'Ingresa el distrito';
      if (nuevaDireccion.direccion.trim().length < 5) er.direccion = 'Ingresa la dirección completa';
    }
    if (metodo?.nombre === 'Yape' && !REFERENCIA_YAPE.test(referenciaPago.trim()))
      er.referenciaPago = 'Ingresa el número de operación de Yape';
    return er;
  }

  async function confirmar() {
    const er = validar();
    setErrores(er);
    if (Object.keys(er).length) return setErrorGeneral('Completa los datos marcados en rojo.');

    const datos = { tipoEntrega, idMetodoPago, totalEsperado: totales.total };
    if (metodo.nombre === 'Yape') datos.referenciaPago = referenciaPago.trim();
    if (tipoEntrega === 'Delivery') {
      if (idDireccion === 'nueva') datos.nuevaDireccion = nuevaDireccion;
      else datos.idDireccion = Number(idDireccion);
    }

    setEnviando(true);
    try {
      const r = await confirmarCompra(datos);
      navigate('/compra-exitosa', { replace: true, state: { pedido: r.pedido, mensaje: r.mensaje } });
      recargar();
    } catch (err) {
      setErrores(err.response?.data?.errores || {});
      setErrorGeneral(mensajeError(err, 'No se pudo completar la compra.'));
      setEnviando(false);
      recargar(); // por si cambió el stock o el precio
    }
  }

  return (
    <div>
      <h1>Finalizar compra</h1>
      {errorGeneral && <p className="mensaje-error">{errorGeneral}</p>}

      <div className="checkout">
        <div className="checkout-pasos">
          {/* 1. ENTREGA */}
          <section className="caja">
            <h2>1. ¿Cómo quieres recibir tu pedido?</h2>
            <div className="opciones">
              <label className={`opcion ${tipoEntrega === 'Delivery' ? 'activa' : ''}`}>
                <input type="radio" name="entrega" checked={tipoEntrega === 'Delivery'} onChange={() => elegirEntrega('Delivery')} />
                <div>
                  <b>Delivery a domicilio</b>
                  <span className="texto-gris">Costo de envío: {formatPrice(opciones.costoEnvio)}</span>
                </div>
              </label>
              <label className={`opcion ${tipoEntrega === 'Recojo en tienda' ? 'activa' : ''}`}>
                <input type="radio" name="entrega" checked={tipoEntrega === 'Recojo en tienda'} onChange={() => elegirEntrega('Recojo en tienda')} />
                <div>
                  <b>Recojo en tienda</b>
                  <span className="texto-gris">San Martín de Porres, Lima · Gratis</span>
                </div>
              </label>
            </div>
            {errores.tipoEntrega && <p className="campo-error">{errores.tipoEntrega}</p>}
          </section>

          {/* 2. DIRECCIÓN (solo delivery) */}
          {tipoEntrega === 'Delivery' && (
            <section className="caja">
              <h2>2. Dirección de entrega</h2>
              <div className="opciones">
                {opciones.direcciones.map((d) => (
                  <label key={d.id} className={`opcion ${idDireccion === String(d.id) ? 'activa' : ''}`}>
                    <input type="radio" name="direccion" checked={idDireccion === String(d.id)}
                      onChange={() => { setIdDireccion(String(d.id)); limpiarError('idDireccion'); }} />
                    <div>
                      <b>{d.direccion}</b>
                      <span className="texto-gris">{d.distrito}, {d.provincia}{d.referencia ? ` · Ref.: ${d.referencia}` : ''}</span>
                    </div>
                  </label>
                ))}
                <label className={`opcion ${idDireccion === 'nueva' ? 'activa' : ''}`}>
                  <input type="radio" name="direccion" checked={idDireccion === 'nueva'}
                    onChange={() => { setIdDireccion('nueva'); limpiarError('idDireccion'); }} />
                  <div><b>Usar una dirección nueva</b></div>
                </label>
              </div>
              {errores.idDireccion && <p className="campo-error">{errores.idDireccion}</p>}

              {idDireccion === 'nueva' && (
                <div className="auth-form form-direccion">
                  <div className="form-grid">
                    <Campo label="Departamento" name="departamento" value={nuevaDireccion.departamento} onChange={cambiarDireccion} error={errores.departamento} />
                    <Campo label="Provincia" name="provincia" value={nuevaDireccion.provincia} onChange={cambiarDireccion} error={errores.provincia} />
                    <Campo label="Distrito" name="distrito" value={nuevaDireccion.distrito} onChange={cambiarDireccion} error={errores.distrito} />
                    <Campo label="Dirección (calle, número, dpto.)" name="direccion" value={nuevaDireccion.direccion} onChange={cambiarDireccion} error={errores.direccion} />
                    <div className="ancho">
                      <Campo label="Referencia (opcional)" name="referencia" value={nuevaDireccion.referencia} onChange={cambiarDireccion} error={errores.referencia} />
                    </div>
                  </div>
                  <p className="texto-gris nota">La dirección se guardará para tus próximas compras.</p>
                </div>
              )}
            </section>
          )}

          {/* 3. MÉTODO DE PAGO */}
          <section className="caja">
            <h2>{tipoEntrega === 'Delivery' ? '3' : '2'}. Método de pago</h2>
            {!tipoEntrega ? (
              <p className="texto-gris">Primero elige cómo quieres recibir tu pedido.</p>
            ) : (
              <div className="opciones">
                {metodosVisibles.map((m) => (
                  <label key={m.id} className={`opcion ${idMetodoPago === m.id ? 'activa' : ''}`}>
                    <input type="radio" name="pago" checked={idMetodoPago === m.id}
                      onChange={() => { setIdMetodoPago(m.id); limpiarError('idMetodoPago'); }} />
                    <div>
                      <b>{m.nombre}</b>
                      <span className="texto-gris">{m.descripcion}</span>
                      {/* El recargo solo se muestra cuando se elige tarjeta */}
                      {idMetodoPago === m.id && m.comisionPorcentaje > 0 && (
                        <span className="recargo">Este método tiene un recargo del {m.comisionPorcentaje} % sobre los productos.</span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}
            {errores.idMetodoPago && <p className="campo-error">{errores.idMetodoPago}</p>}

            {metodo?.nombre === 'Yape' && (
              <div className="caja-yape auth-form">
                <p>
                  Yapea <b>{formatPrice(totales.total)}</b> al número <b>{opciones.yape.numero}</b> ({opciones.yape.titular})
                  y escribe aquí el número de operación.
                </p>
                <Campo label="Número de operación" value={referenciaPago} error={errores.referenciaPago}
                  onChange={(e) => { setReferenciaPago(e.target.value); limpiarError('referenciaPago'); }} />
              </div>
            )}

            {metodo?.nombre === 'Tarjeta' && (
              <p className="aviso-pruebas">
                Modo de pruebas: el pago con tarjeta se simula y se aprueba automáticamente. No se piden datos de tarjeta.
              </p>
            )}
          </section>
        </div>

        {/* RESUMEN */}
        <aside className="caja carrito-resumen">
          <h2>Resumen del pedido</h2>
          <ul className="resumen-items">
            {carrito.items.map((i) => (
              <li key={i.idProducto}>
                <span>{i.nombre} <span className="texto-gris">× {i.cantidad}</span></span>
                <span>{formatPrice(i.subtotal)}</span>
              </li>
            ))}
          </ul>
          <div className="fila"><span>Subtotal</span><span>{formatPrice(totales.subtotal)}</span></div>
          {tipoEntrega && (
            <div className="fila">
              <span>Envío</span>
              <span>{tipoEntrega === 'Delivery' ? formatPrice(totales.costoEnvio) : 'Gratis'}</span>
            </div>
          )}
          {totales.comision > 0 && (
            <div className="fila"><span>Recargo por tarjeta ({metodo.comisionPorcentaje} %)</span><span>{formatPrice(totales.comision)}</span></div>
          )}
          <div className="fila total"><span>Total</span><span>{formatPrice(totales.total)}</span></div>
          <button className="btn btn-bloque" onClick={confirmar} disabled={enviando}>
            {enviando ? 'Procesando...' : 'Confirmar compra'}
          </button>
        </aside>
      </div>
    </div>
  );
}