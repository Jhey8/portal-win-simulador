import {
  obtenerSolicitudPorCliente,
  crearSolicitud,
  actualizarSolicitud,
  crearNotificacion
} from '../datos/repositorio.js';
import { fechaActual, horaActual } from '../utilidades/fechas.js';

const MENSAJE_POR_ESTADO = {
  'Solicitud recibida': (cod) => `Hemos recibido tu solicitud de cancelación ${cod}.`,
  'En validación': (cod) => `Tu solicitud ${cod} está en validación de datos.`,
  'En proceso': (cod) => `Tu solicitud ${cod} está siendo procesada por el área técnica.`,
  'Cancelación completada': (cod) => `¡Tu servicio fue dado de baja! Ya puedes descargar la constancia de ${cod}.`
};

const ESTADOS = ['Solicitud recibida', 'En validación', 'En proceso', 'Cancelación completada'];

export const crearSolicitudCancelacion = async (numeroCliente, motivo, comentarios = '') => {
  const solicitudExistente = await obtenerSolicitudPorCliente(numeroCliente);
  if (solicitudExistente && solicitudExistente.estadoActual !== 'Cancelación completada') {
    throw new Error('Ya tienes una solicitud de cancelación en curso.');
  }

  const idAleatorio = Math.floor(100 + Math.random() * 900);
  const codigoSolicitud = `WIN-2026-${idAleatorio}`;
  const fechaHoy = fechaActual();
  const horaHoy = horaActual();

  const historialEstados = [
    {
      estado: 'Solicitud recibida',
      descripcion: 'Hemos recibido tu solicitud de cancelación.',
      completado: true,
      fecha: fechaHoy,
      hora: horaHoy
    },
    {
      estado: 'En validación',
      descripcion: 'Estamos validando tus datos y estado de cuenta.',
      completado: false,
      fecha: null,
      hora: null
    },
    {
      estado: 'En proceso',
      descripcion: 'Procesando la baja técnica y administrativa del servicio.',
      completado: false,
      fecha: null,
      hora: null
    },
    {
      estado: 'Cancelación completada',
      descripcion: 'Tu servicio ha sido cancelado exitosamente. Ya no se generarán cobros.',
      completado: false,
      fecha: null,
      hora: null
    }
  ];

  const nuevaSolicitud = {
    codigoSolicitud,
    motivo,
    comentarios,
    fechaCreacion: fechaHoy,
    horaCreacion: horaHoy,
    estadoActual: 'Solicitud recibida',
    tiempoMaximoAtencion: '24 horas hábiles',
    historialEstados
  };

  const solicitudCreada = await crearSolicitud(numeroCliente, nuevaSolicitud);
  await crearNotificacion(numeroCliente, MENSAJE_POR_ESTADO['Solicitud recibida'](codigoSolicitud));
  return solicitudCreada;
};

export const obtenerEstadoSolicitud = async (numeroCliente) => {
  return obtenerSolicitudPorCliente(numeroCliente);
};

export const procesarCambioEstadoSimulado = async (numeroCliente, nuevoEstado) => {
  const solicitud = await obtenerSolicitudPorCliente(numeroCliente);
  if (!solicitud) {
    throw new Error('No existe una solicitud registrada para este cliente.');
  }

  if (!ESTADOS.includes(nuevoEstado)) {
    throw new Error('Estado de solicitud inválido.');
  }

  const fechaHoy = fechaActual();
  const horaHoy = horaActual();

  let encontradoNuevoEstado = false;
  solicitud.historialEstados = solicitud.historialEstados.map((paso) => {
    if (paso.estado === nuevoEstado) {
      encontradoNuevoEstado = true;
      return { ...paso, completado: true, fecha: paso.fecha || fechaHoy, hora: paso.hora || horaHoy };
    }

    if (!encontradoNuevoEstado) {
      return { ...paso, completado: true, fecha: paso.fecha || fechaHoy, hora: paso.hora || horaHoy };
    }

    return { ...paso, completado: false, fecha: null, hora: null };
  });

  solicitud.estadoActual = nuevoEstado;
  const actualizada = await actualizarSolicitud(solicitud);

  const generarMensaje = MENSAJE_POR_ESTADO[nuevoEstado];
  if (generarMensaje) {
    await crearNotificacion(numeroCliente, generarMensaje(solicitud.codigoSolicitud));
  }
  return actualizada;
};
