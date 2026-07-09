import {
  crearSolicitudCancelacion,
  obtenerEstadoSolicitud
} from '../servicios/servicioCancelacion.js';
import { obtenerClientePorNumero } from '../datos/repositorio.js';
import { generarPdfConstancia } from '../servicios/servicioPdf.js';

export const obtenerEstado = async (peticion, respuesta) => {
  const numeroCliente = peticion.headers['x-numero-cliente'];

  if (!numeroCliente) {
    return respuesta.status(401).json({
      exito: false,
      mensaje: 'Acceso no autorizado.'
    });
  }

  try {
    const solicitud = await obtenerEstadoSolicitud(numeroCliente);
    return respuesta.status(200).json({ exito: true, solicitud });
  } catch (error) {
    console.error('Error en obtenerEstado:', error);
    return respuesta.status(500).json({ exito: false, mensaje: 'Error interno del servidor.' });
  }
};

export const solicitarCancelacion = async (peticion, respuesta) => {
  const numeroCliente = peticion.headers['x-numero-cliente'];
  const { motivo, comentarios } = peticion.body;

  if (!numeroCliente) {
    return respuesta.status(401).json({
      exito: false,
      mensaje: 'Acceso no autorizado.'
    });
  }

  if (!motivo) {
    return respuesta.status(400).json({
      exito: false,
      mensaje: 'Debe especificar un motivo para la cancelación.'
    });
  }

  if (motivo === 'Otro motivo' && !(comentarios && comentarios.trim())) {
    return respuesta.status(400).json({
      exito: false,
      mensaje: 'Cuando el motivo es "Otro", debe detallarlo en los comentarios.'
    });
  }

  try {
    const nuevaSolicitud = await crearSolicitudCancelacion(numeroCliente, motivo, comentarios);
    return respuesta.status(201).json({
      exito: true,
      mensaje: 'Solicitud de cancelación registrada exitosamente.',
      solicitud: nuevaSolicitud
    });
  } catch (error) {
    return respuesta.status(400).json({
      exito: false,
      mensaje: error.message
    });
  }
};

export const descargarPdf = async (peticion, respuesta) => {

  const numeroCliente = peticion.query.numeroCliente;

  if (!numeroCliente) {
    return respuesta.status(400).send('Falta especificar el número de cliente.');
  }

  try {
    const cliente = await obtenerClientePorNumero(numeroCliente);
    const solicitud = await obtenerEstadoSolicitud(numeroCliente);

    if (!cliente || !solicitud) {
      return respuesta.status(404).send('No se encontró información del cliente o la solicitud de cancelación.');
    }

    generarPdfConstancia(cliente, solicitud, respuesta);
  } catch (error) {
    console.error('Error al generar PDF:', error);
    return respuesta.status(500).send('Error al generar la constancia en PDF.');
  }
};
