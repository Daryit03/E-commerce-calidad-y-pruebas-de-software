import { useEffect, useState } from 'react';
import { CartContext } from './CartContext';
import { useAuth } from '../hooks/useAuth';
import * as carritoService from '../services/carrito.service';

export default function CartProvider({ children }) {
  const { usuario } = useAuth();
  // Guardamos de qué usuario es el carrito, para no mostrar el de otra sesión
  const [estado, setEstado] = useState({ idUsuario: null, datos: null });

  useEffect(() => {
    if (!usuario) return;
    let activo = true;
    carritoService
      .obtenerCarrito()
      .then((datos) => activo && setEstado({ idUsuario: usuario.id, datos }))
      .catch(() => {});
    return () => { activo = false; };
  }, [usuario]);

  const carrito = usuario && estado.idUsuario === usuario.id ? estado.datos : null;

  // Ejecuta una acción y guarda el carrito actualizado que devuelve el backend
  async function ejecutar(promesa) {
    const r = await promesa;
    setEstado({ idUsuario: usuario.id, datos: r.carrito });
    return r;
  }

  const value = {
    carrito,
    cantidad: carrito?.cantidadTotal ?? 0,
    agregar: (idProducto, cantidad) => ejecutar(carritoService.agregarItem(idProducto, cantidad)),
    actualizar: (idProducto, cantidad) => ejecutar(carritoService.actualizarItem(idProducto, cantidad)),
    eliminar: (idProducto) => ejecutar(carritoService.eliminarItem(idProducto)),
    vaciar: () => ejecutar(carritoService.vaciarCarrito()),
    recargar: () =>
      carritoService.obtenerCarrito().then((datos) => setEstado({ idUsuario: usuario.id, datos })),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}