const formato = new Intl.DateTimeFormat('es-PE', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'America/Lima',
});

export const formatFecha = (fecha) => formato.format(new Date(fecha));