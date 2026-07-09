import bcrypt from 'bcryptjs';
import { obtenerCredencialCliente, obtenerClientePorNumero, existeCliente, crearCliente } from '../datos/repositorio.js';

const perfilPublico = (cliente) => ({
  numeroCliente: cliente.numeroCliente,
  nombre: cliente.nombre,
  telefono: cliente.telefono,
  correo: cliente.correo,
  servicios: cliente.servicios,
  notificaciones: cliente.notificaciones
});

export const iniciarSesion = async (peticion, respuesta) => {
  const { numeroCliente, contrasena } = peticion.body;

  if (!numeroCliente || !contrasena) {
    return respuesta.status(400).json({
      exito: false,
      mensaje: 'El número de cliente y la contraseña son requeridos.'
    });
  }

  try {
    const credencial = await obtenerCredencialCliente(numeroCliente);

    const contrasenaValida = credencial
      ? await bcrypt.compare(contrasena, credencial.contrasenaHash)
      : false;

    if (!contrasenaValida) {
      return respuesta.status(401).json({
        exito: false,
        mensaje: 'Credenciales inválidas. Por favor verifique sus datos.'
      });
    }

    const cliente = await obtenerClientePorNumero(numeroCliente);
    return respuesta.status(200).json({
      exito: true,
      mensaje: 'Inicio de sesión exitoso.',
      cliente: perfilPublico(cliente)
    });
  } catch (error) {
    console.error('Error en iniciarSesion:', error);
    return respuesta.status(500).json({ exito: false, mensaje: 'Error interno del servidor.' });
  }
};

export const registrarCliente = async (peticion, respuesta) => {
  const { numeroCliente, dni, nombre, correo, telefono, contrasena } = peticion.body;

  if (!numeroCliente || !dni || !nombre || !contrasena) {
    return respuesta.status(400).json({
      exito: false,
      mensaje: 'Número de cliente, DNI, nombre y contraseña son obligatorios.'
    });
  }
  if (!/^\d{6,12}$/.test(numeroCliente)) {
    return respuesta.status(400).json({ exito: false, mensaje: 'El número de cliente debe tener entre 6 y 12 dígitos.' });
  }
  if (contrasena.length < 6) {
    return respuesta.status(400).json({ exito: false, mensaje: 'La contraseña debe tener al menos 6 caracteres.' });
  }

  try {
    if (await existeCliente(numeroCliente)) {
      return respuesta.status(409).json({ exito: false, mensaje: 'Ya existe una cuenta con ese número de cliente.' });
    }

    const contrasenaHash = await bcrypt.hash(contrasena, 10);
    await crearCliente({ numeroCliente, dni, contrasenaHash, nombre, telefono, correo });

    const cliente = await obtenerClientePorNumero(numeroCliente);
    return respuesta.status(201).json({
      exito: true,
      mensaje: 'Cuenta creada con éxito.',
      cliente: perfilPublico(cliente)
    });
  } catch (error) {
    console.error('Error en registrarCliente:', error);
    return respuesta.status(500).json({ exito: false, mensaje: 'Error interno del servidor.' });
  }
};

export const obtenerPerfil = async (peticion, respuesta) => {
  const numeroCliente = peticion.headers['x-numero-cliente'];

  if (!numeroCliente) {
    return respuesta.status(401).json({
      exito: false,
      mensaje: 'Acceso denegado. No se proporcionó credencial de sesión.'
    });
  }

  try {
    const cliente = await obtenerClientePorNumero(numeroCliente);
    if (!cliente) {
      return respuesta.status(404).json({ exito: false, mensaje: 'Cliente no encontrado.' });
    }
    return respuesta.status(200).json({ exito: true, cliente: perfilPublico(cliente) });
  } catch (error) {
    console.error('Error en obtenerPerfil:', error);
    return respuesta.status(500).json({ exito: false, mensaje: 'Error interno del servidor.' });
  }
};
