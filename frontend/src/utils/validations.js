export const REGLAS_PASSWORD = [
  { texto: 'Mínimo 8 caracteres', cumple: (p) => p.length >= 8 },
  { texto: 'Una letra mayúscula', cumple: (p) => /[A-Z]/.test(p) },
  { texto: 'Un número', cumple: (p) => /\d/.test(p) },
  { texto: 'Un carácter especial (ej. * # @)', cumple: (p) => /[^A-Za-z0-9]/.test(p) },
];

const SOLO_LETRAS = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü' ]{2,100}$/;
const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validarRegistro(datos) {
  const d = Object.fromEntries(Object.entries(datos).map(([k, v]) => [k, k.includes('assword') ? v : v.trim()]));
  const e = {};

  if (!d.nombres) e.nombres = 'Ingresa tus nombres';
  else if (!SOLO_LETRAS.test(d.nombres)) e.nombres = 'Solo letras (mínimo 2)';

  if (!d.apellidos) e.apellidos = 'Ingresa tus apellidos';
  else if (!SOLO_LETRAS.test(d.apellidos)) e.apellidos = 'Solo letras (mínimo 2)';

  if (!d.dni) e.dni = 'Ingresa tu DNI';
  else if (!/^\d{8}$/.test(d.dni)) e.dni = 'El DNI debe tener exactamente 8 dígitos';

  if (!d.telefono) e.telefono = 'Ingresa tu celular';
  else if (!/^9\d{8}$/.test(d.telefono)) e.telefono = 'Debe tener 9 dígitos y empezar con 9';

  if (!d.correo) e.correo = 'Ingresa tu correo';
  else if (!CORREO.test(d.correo)) e.correo = 'El formato del correo no es válido';

  if (!d.password) e.password = 'Ingresa una contraseña';
  else if (!REGLAS_PASSWORD.every((r) => r.cumple(d.password)))
    e.password = 'La contraseña no cumple los requisitos';

  if (!d.confirmarPassword) e.confirmarPassword = 'Confirma tu contraseña';
  else if (d.confirmarPassword !== d.password) e.confirmarPassword = 'Las contraseñas no coinciden';

  return e;
}