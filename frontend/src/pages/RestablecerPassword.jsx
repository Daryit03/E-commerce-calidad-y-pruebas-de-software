import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { restablecerPassword } from '../services/auth.service';
import { mensajeError } from '../services/api';
import { REGLAS_PASSWORD } from '../utils/validations';
import Campo from '../components/ui/Campo';
import ReglasPassword from '../components/ui/ReglasPassword';

export default function RestablecerPassword() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState('');
  const [enviando, setEnviando] = useState(false);

  if (!token) {
    return (
      <div className="auth-contenedor">
        <div className="caja auth-form">
          <h1>Enlace incompleto</h1>
          <p className="mensaje-error">Este enlace no es válido. Solicita uno nuevo.</p>
          <Link className="btn btn-bloque" to="/recuperar">Solicitar nuevo enlace</Link>
        </div>
      </div>
    );
  }

  async function enviar(e) {
    e.preventDefault();
    setErrorGeneral('');
    const er = {};
    if (!REGLAS_PASSWORD.every((r) => r.cumple(password))) er.password = 'La contraseña no cumple los requisitos';
    if (confirmar !== password) er.confirmarPassword = 'Las contraseñas no coinciden';
    setErrores(er);
    if (Object.keys(er).length) return;

    setEnviando(true);
    try {
      const r = await restablecerPassword({ token, password, confirmarPassword: confirmar });
      navigate('/login', { state: { aviso: r.mensaje } });
    } catch (err) {
      setErrores(err.response?.data?.errores || {});
      setErrorGeneral(mensajeError(err, 'No se pudo restablecer la contraseña.'));
      setEnviando(false);
    }
  }

  return (
    <div className="auth-contenedor">
      <form className="caja auth-form" onSubmit={enviar} noValidate>
        <h1>Nueva contraseña</h1>
        {errorGeneral && <p className="mensaje-error">{errorGeneral}</p>}
        <Campo label="Nueva contraseña" type="password" value={password} error={errores.password}
          onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
        <ReglasPassword password={password} />
        <Campo label="Confirmar contraseña" type="password" value={confirmar} error={errores.confirmarPassword}
          onChange={(e) => setConfirmar(e.target.value)} autoComplete="new-password" />
        <button className="btn btn-bloque" disabled={enviando}>
          {enviando ? 'Guardando...' : 'Guardar nueva contraseña'}
        </button>
        <p className="auth-pie"><Link to="/recuperar">Solicitar un nuevo enlace</Link></p>
      </form>
    </div>
  );
}