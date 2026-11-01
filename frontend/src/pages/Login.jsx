import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { mensajeError } from '../services/api';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [enviando, setEnviando] = useState(false);

  const aviso = location.state?.aviso;          // mensaje que llega desde Registro
  const errorSesion = location.state?.error;    // sesión vencida o cuenta desactivada
  const destino = location.state?.desde || '/'; // a dónde volver después

  async function enviar(e) {
    e.preventDefault();
    setError('');
    if (!correo.trim() || !password) return setError('Ingresa tu correo y contraseña.');

    setEnviando(true);
    try {
      const datos = await login(correo, password);
      setExito(datos.mensaje);
      setTimeout(() => navigate(destino, { replace: true }), 1000);
    } catch (err) {
      setError(mensajeError(err, 'No se pudo iniciar sesión.'));
      setEnviando(false);
    }
  }

  return (
    <div className="auth-contenedor">
      <form className="caja auth-form" onSubmit={enviar} noValidate>
        <h1>Iniciar sesión</h1>
        {aviso && !exito && <p className="mensaje-exito">{aviso}</p>}
        {errorSesion && !error && !exito && <p className="mensaje-error">{errorSesion}</p>}
        {error && <p className="mensaje-error">{error}</p>}
        {exito && <p className="mensaje-exito">{exito}</p>}

        <label>
          Correo electrónico
          <input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} autoComplete="email" />
        </label>
        <label>
          Contraseña
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        </label>

        <button className="btn btn-bloque" disabled={enviando}>
          {enviando ? 'Ingresando...' : 'Ingresar'}
        </button>

        <p className="auth-pie"><Link to="/recuperar">¿Olvidaste tu contraseña?</Link></p>
        <p className="auth-pie">¿No tienes cuenta? <Link to="/registro">Regístrate aquí</Link></p>
      </form>
    </div>
  );
}