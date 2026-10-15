const STOCK_BAJO = 6;

class Producto {
  constructor({ id, nombre, descripcion, precio, stock, destacado,
                marca, subcategoria, categoria, imagenes = [], ficha = [] }) {
    this.id = id;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.precio = precio;
    this.stock = stock;
    this.destacado = destacado;
    this.marca = marca;
    this.subcategoria = subcategoria;
    this.categoria = categoria;
    this.imagenes = imagenes;
    this.ficha = ficha;
  }

  estaDisponible() {
    return this.stock > 0;
  }

  // RF0027: mostrar la disponibilidad del producto
  disponibilidad() {
    if (this.stock <= 0) return 'Agotado';
    if (this.stock <= STOCK_BAJO) return `Últimas ${this.stock} unidades`;
    return 'En stock';
  }

  imagenPrincipal() {
    const principal = this.imagenes.find((i) => i.esPrincipal) || this.imagenes[0];
    return principal ? principal.url : null;
  }
}

module.exports = Producto;