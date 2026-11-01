import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { solicitarRecuperacion, restablecerPassword } from '../services/auth.service';
import { mensajeError } from '../services/api';
import { REGLAS_PASSWORD } from '../utils/validations';
import Campo from '../components/ui/Campo';
import ReglasPassword from '../components/ui/ReglasPassword';

const VACIO = { codigo: '', password: '', confirmarPassword: '' };

export default function RecuperarCuenta() {
  const navigate = useNavigate();
  const [paso, setPaso] = useState('correo'); // 'correo' → 'codigo'
  const [correo, setCorreo] = useState('');
  const [datos, setDatos] = useState(VACIO);
  const [errores, setErrores] = useState({});
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [enviando, setEnviando] = useState(false);

  // Paso 1: pedir el código (también sirve para "Reenviar código")
  async function pedirCodigo(e) {
    e?.preventDefault();
    setError('');
    if (!correo.trim()) return setError('Ingresa tu correo electrónico.');

    setEnviando(true);
    try {
      const r = await solicitarRecuperacion(correo);
      setAviso(r.mensaje);
      setDatos(VACIO);
      setErrores({});
      setPaso('codigo');
    } catch (err) {
      setError(mensajeError(err, 'No se pudo enviar el código. Intenta de nuevo.'));
    } finally {
      setEnviando(false);
    }
  }

  function cambiar(e) {
    const { name, value } = e.target;
    // El código solo acepta números (máximo 6)
    const valor = name === 'codigo' ? value.replace(/\D/g, '').slice(0, 6) : value;
    setDatos((d) => ({ ...d, [name]: valor }));
    setErrores((er) => ({ ...er, [name]: undefined }));
    setError('');
  }

  // Paso 2: código + nueva contraseña
  async function cambiarPassword(e) {
    e.preventDefault();
    setError('');
    const er = {};
    if (!/^\d{6}$/.test(datos.codigo)) er.codigo = 'Ingresa el código de 6 dígitos';
    if (!REGLAS_PASSWORD.every((r) => r.cumple(datos.password))) er.password = 'La contraseña no cumple los requisitos';
    if (datos.confirmarPassword !== datos.password) er.confirmarPassword = 'Las contraseñas no coinciden';
    setErrores(er);
    if (Object.keys(er).length) return;

    setEnviando(true);
    try {
      const r = await restablecerPassword({ correo, ...datos });
      navigate('/login', { state: { aviso: r.mensaje } });
    } catch (err) {
      setErrores(err.response?.data?.errores || {});
      setError(mensajeError(err, 'No se pudo cambiar la contraseña.'));
      setEnviando(false);
    }
  }

  function usarOtroCorreo() {
    setPaso('correo');
    setAviso('');
    setError('');
    setDatos(VACIO);
    setErrores({});
  }

  if (paso === 'correo') {
    return (
      <div className="auth-contenedor">
        <form className="caja auth-form" onSubmit={pedirCodigo} noValidate>
          <h1>Recuperar cuenta</h1>
          <p className="texto-gris">Escribe el correo con el que te registraste y te enviaremos un código de 6 dígitos.</p>
          {error && <p className="mensaje-error">{error}</p>}
          <Campo label="Correo electrónico" type="email" value={correo}
            onChange={(e) => setCorreo(e.target.value)} autoComplete="email" />
          <button className="btn btn-bloque" disabled={enviando}>
            {enviando ? 'Enviando...' : 'Enviar código'}
          </button>
          <p className="auth-pie"><Link to="/login">Volver a iniciar sesión</Link></p>
        </form>
      </div>
    );
  }

  return (
    <div className="auth-contenedor">
      <form className="caja auth-form" onSubmit={cambiarPassword} noValidate>
        <h1>Crea tu nueva contraseña</h1>
        {aviso && <p className="mensaje-exito">{aviso}</p>}
        <p className="texto-gris">Código enviado a <b>{correo.trim().toLowerCase()}</b>. Vence en 15 minutos.</p>
        {error && <p className="mensaje-error">{error}</p>}

        <Campo label="Código de 6 dígitos" name="codigo" value={datos.codigo} onChange={cambiar}
          error={errores.codigo} inputMode="numeric" autoComplete="one-time-code" maxLength={6} />
        <Campo label="Nueva contraseña" type="password" name="password" value={datos.password}
          onChange={cambiar} error={errores.password} autoComplete="new-password" />
        <ReglasPassword password={datos.password} />
        <Campo label="Confirmar contraseña" type="password" name="confirmarPassword" value={datos.confirmarPassword}
          onChange={cambiar} error={errores.confirmarPassword} autoComplete="new-password" />

        <button className="btn btn-bloque" disabled={enviando}>
          {enviando ? 'Guardando...' : 'Cambiar contraseña'}
        </button>

        <p className="auth-pie">
          ¿No te llegó?{' '}
          <button type="button" className="btn-link" onClick={pedirCodigo} disabled={enviando}>Reenviar código</button>
          {' · '}
          <button type="button" className="btn-link" onClick={usarOtroCorreo} disabled={enviando}>Usar otro correo</button>
        </p>
      </form>
    </div>
  );
}