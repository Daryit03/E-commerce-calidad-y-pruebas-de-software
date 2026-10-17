const aCentimos = (n) => Math.round(Number(n) * 100);

class Carrito {
  constructor(items = []) {
    this.items = items;
  }

  aJSON() {
    let totalCent = 0;
    let cantidadProductos = 0; // solo los que se pueden comprar
    let cantidadTotal = 0;     // todos (para el contador del Navbar)

    const items = this.items.map((i) => {
      const disponible = i.publicado && i.stock > 0;
      const excedeStock = disponible && i.cantidad > i.stock;
      const subtotalCent = aCentimos(i.precio) * i.cantidad;

      cantidadTotal += i.cantidad;
      if (disponible && !excedeStock) {
        totalCent += subtotalCent;
        cantidadProductos += i.cantidad;
      }

      let aviso = null;
      if (!i.publicado) aviso = 'Este producto ya no está disponible. Elimínalo de tu carrito.';
      else if (i.stock === 0) aviso = 'Producto agotado. Elimínalo de tu carrito.';
      else if (excedeStock) aviso = `Solo quedan ${i.stock} unidades. Ajusta la cantidad.`;

      return { ...i, subtotal: subtotalCent / 100, disponible, aviso };
    });

    return {
      items,
      cantidadProductos,
      cantidadTotal,
      total: totalCent / 100,
      listoParaComprar: items.length > 0 && items.every((i) => !i.aviso),
    };
  }
}

module.exports = Carrito;