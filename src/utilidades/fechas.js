const dosDigitos = (n) => String(n).padStart(2, '0');

export const fechaActual = (fecha = new Date()) => {
  const dia = dosDigitos(fecha.getDate());
  const mes = dosDigitos(fecha.getMonth() + 1);
  const anio = fecha.getFullYear();
  return `${dia}/${mes}/${anio}`;
};

export const horaActual = (fecha = new Date()) => {
  return `${dosDigitos(fecha.getHours())}:${dosDigitos(fecha.getMinutes())}`;
};
