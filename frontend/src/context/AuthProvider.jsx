import { useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';
import { leerToken, guardarToken } from '../services/api';
import * as authService from '../services/auth.service';

export default function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargandoSesion, setCargandoSesion] = useState(() => Boolean(leerToken()));

  useEffect(() => {
    if (!leerToken()) return;
    authService
      .obtenerYo()
      .then(setUsuario)
      .catch(() => guardarToken(null)) // token vencido o inválido
      .finally(() => setCargandoSesion(false));
  }, []);

  async function login(correo, password) {
    const datos = await authService.login(correo, password);
    guardarToken(datos.token);
    setUsuario(datos.usuario);
    return datos;
  }

  function logout() {
    guardarToken(null);
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, cargandoSesion, login, logout, actualizarUsuario: setUsuario }}>
      {children}
    </AuthContext.Provider>
  );
}