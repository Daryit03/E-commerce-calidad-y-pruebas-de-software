import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registrar } from '../services/auth.service';
import { mensajeError } from '../services/api';
import { validarRegistro, REGLAS_PASSWORD } from '../utils/validations';

const VACIO = { nombres: '', apellidos: '', dni: '', telefono: '', correo: '', password: '', confirmarPassword: '' };

const CAMPOS = [
  { nombre: 'nombres', etiqueta: 'Nombres', autoComplete: 'given-name' },
  { nombre: 'apellidos', etiqueta: 'Apellidos', autoComplete: 'family-name' },
  { nombre: 'dni', etiqueta: 'DNI', inputMode: 'numeric', maxLength: 8 },
  { nombre: 'telefono', etiqueta: 'Celular', inputMode: 'numeric', maxLength: 9, autoComplete: 'tel' },
  { nombre: 'correo', etiqueta: 'Correo electrónico', type: 'email', autoComplete: 'email', ancho: true },
  { nombre: 'password', etiqueta: 'Contraseña', type: 'password', autoComplete: 'new-password' },
  { nombre: 'confirmarPassword', etiqueta: 'Confirmar contraseña', type: 'password', autoComplete: 'new-password' },
];

export default function Registro() {
  const navigate = useNavigate();
  const [datos, setDatos] = useState(VACIO);
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState('');
  const [enviando, setEnviando] = useState(false);

  function cambiar(e) {
    const { name, value } = e.target;
    // DNI y celular: solo números
    const valor = name === 'dni' || name === 'telefono' ? value.replace(/\D/g, '') : value;
    setDatos((d) => ({ ...d, [name]: valor }));
    setErrores((er) => ({ ...er, [name]: undefined }));
  }

  async function enviar(e) {
    e.preventDefault();
    setErrorGeneral('');

    const encontrados = validarRegistro(datos);
    setErrores(encontrados);
    if (Object.keys(encontrados).length) return setErrorGeneral('Revisa los campos marcados en rojo.');

    setEnviando(true);
    try {
      const r = await registrar(datos);
      navigate('/verificar-correo', { state: { correo: r.correo, aviso: r.mensaje } }); // RF0012 + RF0078
    } catch (err) {
      setErrores(err.response?.data?.errores || {});
      setErrorGeneral(mensajeError(err, 'No se pudo crear la cuenta.'));
      setEnviando(false);
    }
  }

  return (
    <div className="auth-contenedor">
      <form className="caja auth-form auth-ancho" onSubmit={enviar} noValidate>
        <h1>Crear cuenta</h1>
        {errorGeneral && <p className="mensaje-error">{errorGeneral}</p>}

        <div className="form-grid">
          {CAMPOS.map((c) => (
            <label key={c.nombre} className={c.ancho ? 'ancho' : ''}>
              {c.etiqueta}
              <input
                name={c.nombre}
                type={c.type || 'text'}
                value={datos[c.nombre]}
                onChange={cambiar}
                inputMode={c.inputMode}
                maxLength={c.maxLength}
                autoComplete={c.autoComplete}
                className={errores[c.nombre] ? 'input-error' : ''}
              />
              {errores[c.nombre] && <span className="campo-error">{errores[c.nombre]}</span>}
            </label>
          ))}
        </div>

        {datos.password && (
          <ul className="reglas">
            {REGLAS_PASSWORD.map((r) => {
              const ok = r.cumple(datos.password);
              return <li key={r.texto} className={ok ? 'ok' : ''}>{ok ? '✓' : '•'} {r.texto}</li>;
            })}
          </ul>
        )}

        <button className="btn btn-bloque" disabled={enviando}>
          {enviando ? 'Creando cuenta...' : 'Registrarme'}
        </button>
        <p className="auth-pie">¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
      </form>
    </div>
  );
}