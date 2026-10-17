const SOLO_LETRAS = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü' ]{2,100}$/;
const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const DNI = /^\d{8}$/;
const CELULAR = /^9\d{8}$/;
const PASSWORD_SEGURA = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

function validarPassword(password) {
  if (!password) return 'Ingresa una contraseña';
  if (!PASSWORD_SEGURA.test(password))
    return 'Mínimo 8 caracteres, una mayúscula, un número y un carácter especial';
  return null;
}

function validarRegistro(d) {
  const e = {};

  if (!d.nombres) e.nombres = 'Ingresa tus nombres';
  else if (!SOLO_LETRAS.test(d.nombres)) e.nombres = 'Solo letras (mínimo 2)';

  if (!d.apellidos) e.apellidos = 'Ingresa tus apellidos';
  else if (!SOLO_LETRAS.test(d.apellidos)) e.apellidos = 'Solo letras (mínimo 2)';

  if (!d.dni) e.dni = 'Ingresa tu DNI';
  else if (!DNI.test(d.dni)) e.dni = 'El DNI debe tener exactamente 8 dígitos';

  if (!d.telefono) e.telefono = 'Ingresa tu celular';
  else if (!CELULAR.test(d.telefono)) e.telefono = 'Debe tener 9 dígitos y empezar con 9';

  if (!d.correo) e.correo = 'Ingresa tu correo';
  else if (!CORREO.test(d.correo) || d.correo.length > 150) e.correo = 'El formato del correo no es válido';

  const errPass = validarPassword(d.password);
  if (errPass) e.password = errPass;

  if (!d.confirmarPassword) e.confirmarPassword = 'Confirma tu contraseña';
  else if (d.confirmarPassword !== d.password) e.confirmarPassword = 'Las contraseñas no coinciden';

  return e;
}

function validarPerfil(d) {
  const e = {};

  if (!d.nombres) e.nombres = 'Ingresa tus nombres';
  else if (!SOLO_LETRAS.test(d.nombres)) e.nombres = 'Solo letras (mínimo 2)';

  if (!d.apellidos) e.apellidos = 'Ingresa tus apellidos';
  else if (!SOLO_LETRAS.test(d.apellidos)) e.apellidos = 'Solo letras (mínimo 2)';

  if (!d.telefono) e.telefono = 'Ingresa tu celular';
  else if (!CELULAR.test(d.telefono)) e.telefono = 'Debe tener 9 dígitos y empezar con 9';

  return e;
}

module.exports = { validarRegistro, validarPassword, validarPerfil };