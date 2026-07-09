import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import { iniciarSesion, obtenerPerfil, registrarCliente } from './controladores/controladorAutenticacion.js';
import { obtenerEstado, solicitarCancelacion, descargarPdf } from './controladores/controladorCancelacion.js';
import { obtenerPreguntas } from './controladores/controladorPreguntas.js';
import { iniciarSesionAdmin, listarSolicitudes, cambiarEstadoSolicitud, reiniciarSolicitud } from './controladores/controladorAdmin.js';
import { fechaActual } from './utilidades/fechas.js';

const __directorioActual = path.dirname(fileURLToPath(import.meta.url));
const aplicacion = express();

aplicacion.set('view engine', 'ejs');
aplicacion.set('views', path.join(__directorioActual, 'vistas'));

aplicacion.use(express.json());
aplicacion.use(express.urlencoded({ extended: true }));

aplicacion.use(express.static(path.join(__directorioActual, 'publico')));

aplicacion.post('/api/autenticacion/iniciar-sesion', iniciarSesion);
aplicacion.post('/api/autenticacion/registrar', registrarCliente);
aplicacion.get('/api/cliente/perfil', obtenerPerfil);

aplicacion.get('/api/cancelacion/estado', obtenerEstado);
aplicacion.post('/api/cancelacion/solicitar', solicitarCancelacion);
aplicacion.get('/api/cancelacion/descargar-pdf', descargarPdf);

aplicacion.get('/api/preguntas-frecuentes', obtenerPreguntas);

aplicacion.post('/api/admin/iniciar-sesion', iniciarSesionAdmin);
aplicacion.get('/api/admin/solicitudes', listarSolicitudes);
aplicacion.post('/api/admin/solicitudes/estado', cambiarEstadoSolicitud);
aplicacion.post('/api/admin/solicitudes/reiniciar', reiniciarSolicitud);

aplicacion.get('/admin', (peticion, respuesta) => {
  respuesta.render('admin');
});

aplicacion.get('*', (peticion, respuesta) => {
  respuesta.render('index', { fechaHoy: fechaActual() });
});

aplicacion.use((error, peticion, respuesta, siguiente) => {
  console.error('Error en el Servidor:', error);
  respuesta.status(500).json({
    exito: false,
    mensaje: 'Ha ocurrido un error interno en el servidor.'
  });
});

export default aplicacion;
