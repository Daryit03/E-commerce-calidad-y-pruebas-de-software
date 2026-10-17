import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { actualizarPerfil, cambiarPassword } from '../services/auth.service';
import { mensajeError } from '../services/api';
import { REGLAS_PASSWORD } from '../utils/validations';
import Campo from '../components/ui/Campo';
import ReglasPassword from '../components/ui/ReglasPassword';

export default function Perfil() {
  const { usuario, actualizarUsuario } = useAuth();

  return (
    <div>
      <h1>Mi perfil</h1>
      <div className="perfil-grid">
        <DatosPersonales usuario={usuario} onGuardado={actualizarUsuario} />
        <CambiarPassword />
      </div>
    </div>
  );
}

function Mensaje({ mensaje }) {
  if (!mensaje.texto) return null;
  return <p className={mensaje.tipo === 'exito' ? 'mensaje-exito' : 'mensaje-error'}>{mensaje.texto}</p>;
}

function DatosPersonales({ usuario, onGuardado }) {
  const [datos, setDatos] = useState({
    nombres: usuario.nombres,
    apellidos: usuario.apellidos,
    telefono: usuario.telefono || '',
  });
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [guardando, setGuardando] = useState(false);

  function cambiar(e) {
    const { name, value } = e.target;
    setDatos((d) => ({ ...d, [name]: name === 'telefono' ? value.replace(/\D/g, '') : value }));
    setErrores((er) => ({ ...er, [name]: undefined }));
    setMensaje({ tipo: '', texto: '' });
  }

  async function guardar(e) {
    e.preventDefault();
    const er = {};
    if (!datos.nombres.trim()) er.nombres = 'Ingresa tus nombres';
    if (!datos.apellidos.trim()) er.apellidos = 'Ingresa tus apellidos';
    if (!/^9\d{8}$/.test(datos.telefono)) er.telefono = 'Debe tener 9 dígitos y empezar con 9';
    setErrores(er);
    if (Object.keys(er).length) return;

    setGuardando(true);
    try {
      const r = await actualizarPerfil(datos);
      onGuardado(r.usuario);
      setMensaje({ tipo: 'exito', texto: r.mensaje });
    } catch (err) {
      setErrores(err.response?.data?.errores || {});
      setMensaje({ tipo: 'error', texto: mensajeError(err, 'No se pudieron guardar los cambios.') });
    } finally {
      setGuardando(false);
    }
  }

  return (
    <form className="caja auth-form perfil-form" onSubmit={guardar} noValidate>
      <h2>Datos personales</h2>
      <Mensaje mensaje={mensaje} />
      <Campo label="Nombres" name="nombres" value={datos.nombres} onChange={cambiar} error={errores.nombres} />
      <Campo label="Apellidos" name="apellidos" value={datos.apellidos} onChange={cambiar} error={errores.apellidos} />
      <Campo label="Celular" name="telefono" value={datos.telefono} onChange={cambiar} error={errores.telefono}
        inputMode="numeric" maxLength={9} />
      <Campo label="DNI" value={usuario.dni} disabled />
      <Campo label="Correo electrónico" value={usuario.correo} disabled />
      <p className="texto-gris nota">El DNI y el correo no se pueden modificar.</p>
      <button className="btn" disabled={guardando}>{guardando ? 'Guardando...' : 'Guardar cambios'}</button>
    </form>
  );
}

const PASSWORD_VACIO = { passwordActual: '', passwordNueva: '', confirmarPassword: '' };

function CambiarPassword() {
  const [datos, setDatos] = useState(PASSWORD_VACIO);
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [guardando, setGuardando] = useState(false);

  function cambiar(e) {
    const { name, value } = e.target;
    setDatos((d) => ({ ...d, [name]: value }));
    setErrores((er) => ({ ...er, [name]: undefined }));
    setMensaje({ tipo: '', texto: '' });
  }

  async function guardar(e) {
    e.preventDefault();
    const er = {};
    if (!datos.passwordActual) er.passwordActual = 'Ingresa tu contraseña actual';
    if (!REGLAS_PASSWORD.every((r) => r.cumple(datos.passwordNueva)))
      er.passwordNueva = 'La contraseña no cumple los requisitos';
    if (datos.confirmarPassword !== datos.passwordNueva) er.confirmarPassword = 'Las contraseñas no coinciden';
    setErrores(er);
    if (Object.keys(er).length) return;

    setGuardando(true);
    try {
      const r = await cambiarPassword(datos);
      setDatos(PASSWORD_VACIO);
      setMensaje({ tipo: 'exito', texto: r.mensaje });
    } catch (err) {
      setErrores(err.response?.data?.errores || {});
      setMensaje({ tipo: 'error', texto: mensajeError(err, 'No se pudo cambiar la contraseña.') });
    } finally {
      setGuardando(false);
    }
  }

  return (
    <form className="caja auth-form perfil-form" onSubmit={guardar} noValidate>
      <h2>Cambiar contraseña</h2>
      <Mensaje mensaje={mensaje} />
      <Campo label="Contraseña actual" type="password" name="passwordActual" value={datos.passwordActual}
        onChange={cambiar} error={errores.passwordActual} autoComplete="current-password" />
      <Campo label="Nueva contraseña" type="password" name="passwordNueva" value={datos.passwordNueva}
        onChange={cambiar} error={errores.passwordNueva} autoComplete="new-password" />
      <ReglasPassword password={datos.passwordNueva} />
      <Campo label="Confirmar nueva contraseña" type="password" name="confirmarPassword" value={datos.confirmarPassword}
        onChange={cambiar} error={errores.confirmarPassword} autoComplete="new-password" />
      <button className="btn" disabled={guardando}>{guardando ? 'Guardando...' : 'Cambiar contraseña'}</button>
    </form>
  );
}