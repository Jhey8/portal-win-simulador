import bcrypt from 'bcryptjs';
import { obtenerCredencialAdmin, existeAdmin, obtenerTodasLasSolicitudes, eliminarSolicitudesDeCliente } from '../datos/repositorio.js';
import { procesarCambioEstadoSimulado } from '../servicios/servicioCancelacion.js';

const verificarAdmin = async (peticion) => {
  const usuario = peticion.headers['x-admin-usuario'];
  if (!usuario) return false;
  return existeAdmin(usuario);
};

export const iniciarSesionAdmin = async (peticion, respuesta) => {
  const { usuario, contrasena } = peticion.body;

  if (!usuario || !contrasena) {
    return respuesta.status(400).json({ exito: false, mensaje: 'Usuario y contraseña son requeridos.' });
  }

  try {
    const credencial = await obtenerCredencialAdmin(usuario);
    const contrasenaValida = credencial
      ? await bcrypt.compare(contrasena, credencial.contrasenaHash)
      : false;

    if (!contrasenaValida) {
      return respuesta.status(401).json({ exito: false, mensaje: 'Credenciales de administrador inválidas.' });
    }

    return respuesta.status(200).json({
      exito: true,
      mensaje: 'Inicio de sesión exitoso.',
      admin: { usuario: credencial.usuario, nombre: credencial.nombre }
    });
  } catch (error) {
    console.error('Error en iniciarSesionAdmin:', error);
    return respuesta.status(500).json({ exito: false, mensaje: 'Error interno del servidor.' });
  }
};

export const listarSolicitudes = async (peticion, respuesta) => {
  if (!(await verificarAdmin(peticion))) {
    return respuesta.status(401).json({ exito: false, mensaje: 'Acceso no autorizado.' });
  }

  try {
    const solicitudes = await obtenerTodasLasSolicitudes();
    return respuesta.status(200).json({ exito: true, solicitudes });
  } catch (error) {
    console.error('Error en listarSolicitudes:', error);
    return respuesta.status(500).json({ exito: false, mensaje: 'Error interno del servidor.' });
  }
};

export const cambiarEstadoSolicitud = async (peticion, respuesta) => {
  if (!(await verificarAdmin(peticion))) {
    return respuesta.status(401).json({ exito: false, mensaje: 'Acceso no autorizado.' });
  }

  const { numeroCliente, nuevoEstado } = peticion.body;
  if (!numeroCliente || !nuevoEstado) {
    return respuesta.status(400).json({ exito: false, mensaje: 'El número de cliente y el nuevo estado son obligatorios.' });
  }

  try {
    const solicitud = await procesarCambioEstadoSimulado(numeroCliente, nuevoEstado);
    return respuesta.status(200).json({
      exito: true,
      mensaje: `Solicitud de ${numeroCliente} actualizada a: ${nuevoEstado}`,
      solicitud
    });
  } catch (error) {
    return respuesta.status(400).json({ exito: false, mensaje: error.message });
  }
};

export const reiniciarSolicitud = async (peticion, respuesta) => {
  if (!(await verificarAdmin(peticion))) {
    return respuesta.status(401).json({ exito: false, mensaje: 'Acceso no autorizado.' });
  }

  const { numeroCliente } = peticion.body;
  if (!numeroCliente) {
    return respuesta.status(400).json({ exito: false, mensaje: 'El número de cliente es obligatorio.' });
  }

  try {
    const eliminadas = await eliminarSolicitudesDeCliente(numeroCliente);
    return respuesta.status(200).json({
      exito: true,
      mensaje: `Se reinició la solicitud del cliente ${numeroCliente} (${eliminadas} eliminada(s)).`
    });
  } catch (error) {
    console.error('Error en reiniciarSolicitud:', error);
    return respuesta.status(500).json({ exito: false, mensaje: 'Error interno del servidor.' });
  }
};
