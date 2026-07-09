import { obtenerPreguntasFrecuentes } from '../datos/repositorio.js';

export const obtenerPreguntas = async (peticion, respuesta) => {
  try {
    const preguntas = await obtenerPreguntasFrecuentes();
    return respuesta.status(200).json({
      exito: true,
      preguntas
    });
  } catch (error) {
    return respuesta.status(500).json({
      exito: false,
      mensaje: 'Error al recuperar las preguntas frecuentes.'
    });
  }
};
