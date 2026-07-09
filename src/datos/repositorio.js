import { consultar } from './conexion.js';

export const obtenerCredencialCliente = async (numeroCliente) => {
  const filas = await consultar(
    'SELECT numero_cliente, contrasena_hash FROM clientes WHERE numero_cliente = ?',
    [numeroCliente]
  );
  if (filas.length === 0) return null;
  return {
    numeroCliente: filas[0].numero_cliente,
    contrasenaHash: filas[0].contrasena_hash
  };
};

export const existeCliente = async (numeroCliente) => {
  const filas = await consultar('SELECT 1 FROM clientes WHERE numero_cliente = ?', [numeroCliente]);
  return filas.length > 0;
};

export const crearCliente = async ({ numeroCliente, dni, contrasenaHash, nombre, telefono, correo }) => {
  await consultar(
    `INSERT INTO clientes (numero_cliente, dni, contrasena_hash, nombre, telefono, correo)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [numeroCliente, dni, contrasenaHash, nombre, telefono || null, correo || null]
  );
  await consultar(
    `INSERT INTO servicios (numero_cliente, nombre, estado) VALUES (?, ?, 'Activo')`,
    [numeroCliente, 'Internet Fibra 200 Mbps']
  );
  await consultar(
    `INSERT INTO notificaciones (numero_cliente, mensaje, leida) VALUES (?, ?, 0)`,
    [numeroCliente, '¡Bienvenido a WIN! Tu cuenta ha sido creada con éxito.']
  );
};

export const obtenerClientePorNumero = async (numeroCliente) => {
  const clientes = await consultar(
    'SELECT numero_cliente, dni, nombre, telefono, correo FROM clientes WHERE numero_cliente = ?',
    [numeroCliente]
  );
  if (clientes.length === 0) return null;

  const servicios = await consultar(
    'SELECT id, nombre, estado FROM servicios WHERE numero_cliente = ?',
    [numeroCliente]
  );
  const notificaciones = await consultar(
    'SELECT id, mensaje, leida FROM notificaciones WHERE numero_cliente = ?',
    [numeroCliente]
  );

  const cliente = clientes[0];
  return {
    numeroCliente: cliente.numero_cliente,
    dni: cliente.dni,
    nombre: cliente.nombre,
    telefono: cliente.telefono,
    correo: cliente.correo,
    servicios: servicios.map(s => ({ id: s.id, nombre: s.nombre, estado: s.estado })),
    notificaciones: notificaciones.map(n => ({ id: n.id, mensaje: n.mensaje, leida: !!n.leida }))
  };
};

export const obtenerCredencialAdmin = async (usuario) => {
  const filas = await consultar(
    'SELECT usuario, contrasena_hash, nombre FROM administradores WHERE usuario = ?',
    [usuario]
  );
  if (filas.length === 0) return null;
  return {
    usuario: filas[0].usuario,
    contrasenaHash: filas[0].contrasena_hash,
    nombre: filas[0].nombre
  };
};

export const existeAdmin = async (usuario) => {
  const filas = await consultar('SELECT 1 FROM administradores WHERE usuario = ?', [usuario]);
  return filas.length > 0;
};

export const obtenerTodasLasSolicitudes = async () => {
  const filas = await consultar(
    `SELECT s.numero_cliente, c.nombre AS cliente_nombre, s.codigo_solicitud,
            s.motivo, s.comentarios, s.estado_actual, s.fecha_creacion, s.hora_creacion,
            s.ultima_actualizacion
       FROM solicitudes s
       JOIN clientes c ON c.numero_cliente = s.numero_cliente
      WHERE s.id IN (SELECT MAX(id) FROM solicitudes GROUP BY numero_cliente)
      ORDER BY s.ultima_actualizacion DESC`
  );
  return filas.map(f => ({
    numeroCliente: f.numero_cliente,
    clienteNombre: f.cliente_nombre,
    codigoSolicitud: f.codigo_solicitud,
    motivo: f.motivo,
    comentarios: f.comentarios,
    estadoActual: f.estado_actual,
    fechaCreacion: f.fecha_creacion,
    horaCreacion: f.hora_creacion,
    ultimaActualizacion: f.ultima_actualizacion
  }));
};

export const crearNotificacion = async (numeroCliente, mensaje) => {
  await consultar(
    'INSERT INTO notificaciones (numero_cliente, mensaje, leida) VALUES (?, ?, 0)',
    [numeroCliente, mensaje]
  );
};

const construirSolicitud = async (fila) => {
  const historial = await consultar(
    'SELECT estado, descripcion, completado, fecha, hora FROM historial_estados WHERE solicitud_id = ? ORDER BY orden ASC',
    [fila.id]
  );

  return {
    id: fila.id,
    codigoSolicitud: fila.codigo_solicitud,
    motivo: fila.motivo,
    comentarios: fila.comentarios,
    fechaCreacion: fila.fecha_creacion,
    horaCreacion: fila.hora_creacion,
    estadoActual: fila.estado_actual,
    tiempoMaximoAtencion: fila.tiempo_maximo_atencion,
    ultimaActualizacion: fila.ultima_actualizacion,
    historialEstados: historial.map(h => ({
      estado: h.estado,
      descripcion: h.descripcion,
      completado: !!h.completado,
      fecha: h.fecha,
      hora: h.hora
    }))
  };
};

export const obtenerSolicitudPorCliente = async (numeroCliente) => {
  const filas = await consultar(
    'SELECT * FROM solicitudes WHERE numero_cliente = ? ORDER BY id DESC LIMIT 1',
    [numeroCliente]
  );
  if (filas.length === 0) return null;
  return construirSolicitud(filas[0]);
};

export const crearSolicitud = async (numeroCliente, solicitud) => {
  const resultado = await consultar(
    `INSERT INTO solicitudes
       (numero_cliente, codigo_solicitud, motivo, comentarios, estado_actual,
        fecha_creacion, hora_creacion, tiempo_maximo_atencion, ultima_actualizacion)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
    [
      numeroCliente,
      solicitud.codigoSolicitud,
      solicitud.motivo,
      solicitud.comentarios || null,
      solicitud.estadoActual,
      solicitud.fechaCreacion,
      solicitud.horaCreacion,
      solicitud.tiempoMaximoAtencion
    ]
  );

  const solicitudId = resultado.insertId;
  await guardarHistorial(solicitudId, solicitud.historialEstados);
  solicitud.id = solicitudId;
  return solicitud;
};

export const actualizarSolicitud = async (solicitud) => {
  await consultar(
    'UPDATE solicitudes SET estado_actual = ?, ultima_actualizacion = NOW() WHERE id = ?',
    [solicitud.estadoActual, solicitud.id]
  );
  await consultar('DELETE FROM historial_estados WHERE solicitud_id = ?', [solicitud.id]);
  await guardarHistorial(solicitud.id, solicitud.historialEstados);
  return solicitud;
};

const guardarHistorial = async (solicitudId, historialEstados) => {
  for (let orden = 0; orden < historialEstados.length; orden++) {
    const paso = historialEstados[orden];
    await consultar(
      `INSERT INTO historial_estados
         (solicitud_id, estado, descripcion, completado, fecha, hora, orden)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [solicitudId, paso.estado, paso.descripcion, paso.completado ? 1 : 0, paso.fecha, paso.hora, orden]
    );
  }
};

export const eliminarSolicitudesDeCliente = async (numeroCliente) => {
  const resultado = await consultar(
    'DELETE FROM solicitudes WHERE numero_cliente = ?',
    [numeroCliente]
  );
  return resultado.affectedRows;
};

export const obtenerPreguntasFrecuentes = async () => {
  const filas = await consultar(
    'SELECT id, pregunta, respuesta FROM preguntas_frecuentes ORDER BY orden ASC'
  );
  return filas.map(f => ({ id: f.id, pregunta: f.pregunta, respuesta: f.respuesta }));
};
