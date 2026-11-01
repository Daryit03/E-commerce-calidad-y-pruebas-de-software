import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { verificarCorreo, reenviarVerificacion } from '../services/auth.service';
import { mensajeError } from '../services/api';
import Campo from '../components/ui/Campo';

export default function VerificarCorreo() {
  const navigate = useNavigate();
  const location = useLocation();
  // El correo llega desde Registro o Login; si no, el cliente lo escribe
  const [correo, setCorreo] = useState(location.state?.correo || '');
  const [codigo, setCodigo] = useState('');
  const [errores, setErrores] = useState({});
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState(location.state?.aviso || '');
  const [enviando, setEnviando] = useState(false);

  async function verificar(e) {
    e.preventDefault();
    setError('');
    const er = {};
    if (!correo.trim()) er.correo = 'Ingresa tu correo electrónico';
    if (!/^\d{6}$/.test(codigo)) er.codigo = 'Ingresa el código de 6 dígitos';
    setErrores(er);
    if (Object.keys(er).length) return;

    setEnviando(true);
    try {
      const r = await verificarCorreo(correo, codigo);
      navigate('/login', { replace: true, state: { aviso: r.mensaje } });
    } catch (err) {
      setErrores(err.response?.data?.errores || {});
      setError(mensajeError(err, 'No se pudo verificar el correo.'));
      setEnviando(false);
    }
  }

  async function reenviar() {
    setError('');
    if (!correo.trim()) return setErrores({ correo: 'Ingresa tu correo electrónico' });

    setEnviando(true);
    try {
      const r = await reenviarVerificacion(correo);
      setAviso(r.mensaje);
      setCodigo('');
      setErrores({});
    } catch (err) {
      setError(mensajeError(err, 'No se pudo reenviar el código.'));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="auth-contenedor">
      <form className="caja auth-form" onSubmit={verificar} noValidate>
        <h1>Verifica tu correo</h1>
        {aviso && <p className="mensaje-exito">{aviso}</p>}
        <p className="texto-gris">Escribe el código de 6 dígitos que enviamos a tu correo. Vence en 15 minutos.</p>
        {error && <p className="mensaje-error">{error}</p>}

        <Campo label="Correo electrónico" type="email" value={correo} error={errores.correo} autoComplete="email"
          onChange={(e) => { setCorreo(e.target.value); setErrores((x) => ({ ...x, correo: undefined })); }} />
        <Campo label="Código de 6 dígitos" value={codigo} error={errores.codigo}
          inputMode="numeric" autoComplete="one-time-code" maxLength={6}
          onChange={(e) => { setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6)); setErrores((x) => ({ ...x, codigo: undefined })); }} />

        <button className="btn btn-bloque" disabled={enviando}>
          {enviando ? 'Verificando...' : 'Verificar correo'}
        </button>

        <p className="auth-pie">
          ¿No te llegó?{' '}
          <button type="button" className="btn-link" onClick={reenviar} disabled={enviando}>Reenviar código</button>
        </p>
        <p className="auth-pie"><Link to="/login">Volver a iniciar sesión</Link></p>
      </form>
    </div>
  );
}