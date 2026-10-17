class Usuario {
  constructor({ id, nombres, apellidos, dni, correo, telefono, rol, estado, passwordHash, fechaRegistro }) {
    Object.assign(this, { id, nombres, apellidos, dni, correo, telefono, rol, estado, passwordHash, fechaRegistro });
  }

  esAdministrador() {
    return this.rol === 'Administrador';
  }

  aPublico() {
    return {
      id: this.id,
      nombres: this.nombres,
      apellidos: this.apellidos,
      dni: this.dni,
      correo: this.correo,
      telefono: this.telefono,
      rol: this.rol,
    };
  }
}

module.exports = Usuario;