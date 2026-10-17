import { useState } from 'react';
import { Link } from 'react-router-dom';
import { solicitarRecuperacion } from '../services/auth.service';
import { mensajeError } from '../services/api';
import Campo from '../components/ui/Campo';

export default function RecuperarCuenta() {
  const [correo, setCorreo] = useState('');
  const [error, setError] = useState('');
  const [enviado, setEnviado] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    setError('');
    if (!correo.trim()) return setError('Ingresa tu correo electrónico.');

    setEnviando(true);
    try {
      const r = await solicitarRecuperacion(correo);
      setEnviado(r.mensaje);
    } catch (err) {
      setError(mensajeError(err, 'No se pudo enviar el enlace. Intenta de nuevo.'));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="auth-contenedor">
      <form className="caja auth-form" onSubmit={enviar} noValidate>
        <h1>Recuperar cuenta</h1>
        {enviado ? (
          <>
            <p className="mensaje-exito">{enviado}</p>
            <p className="texto-gris">El enlace vence en 30 minutos y solo puede usarse una vez.</p>
          </>
        ) : (
          <>
            <p className="texto-gris">Escribe el correo con el que te registraste y te enviaremos un enlace para crear una nueva contraseña.</p>
            {error && <p className="mensaje-error">{error}</p>}
            <Campo label="Correo electrónico" type="email" value={correo}
              onChange={(e) => setCorreo(e.target.value)} autoComplete="email" />
            <button className="btn btn-bloque" disabled={enviando}>
              {enviando ? 'Enviando...' : 'Enviar enlace'}
            </button>
          </>
        )}
        <p className="auth-pie"><Link to="/login">Volver a iniciar sesión</Link></p>
      </form>
    </div>
  );
}