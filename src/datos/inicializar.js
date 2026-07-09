import bcrypt from 'bcryptjs';
import { consultar } from './conexion.js';

const TABLAS = [
  `CREATE TABLE IF NOT EXISTS administradores (
    usuario VARCHAR(40) PRIMARY KEY,
    contrasena_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(120) NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS clientes (
    numero_cliente VARCHAR(20) PRIMARY KEY,
    dni VARCHAR(20) NOT NULL,
    contrasena_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(120) NOT NULL,
    telefono VARCHAR(30),
    correo VARCHAR(120)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS servicios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_cliente VARCHAR(20) NOT NULL,
    nombre VARCHAR(120) NOT NULL,
    estado VARCHAR(30) NOT NULL DEFAULT 'Activo',
    FOREIGN KEY (numero_cliente) REFERENCES clientes(numero_cliente) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS notificaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_cliente VARCHAR(20) NOT NULL,
    mensaje VARCHAR(255) NOT NULL,
    leida BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (numero_cliente) REFERENCES clientes(numero_cliente) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS solicitudes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_cliente VARCHAR(20) NOT NULL,
    codigo_solicitud VARCHAR(30) NOT NULL UNIQUE,
    motivo VARCHAR(150) NOT NULL,
    comentarios TEXT,
    estado_actual VARCHAR(40) NOT NULL,
    fecha_creacion VARCHAR(20),
    hora_creacion VARCHAR(20),
    tiempo_maximo_atencion VARCHAR(40),
    ultima_actualizacion DATETIME,
    FOREIGN KEY (numero_cliente) REFERENCES clientes(numero_cliente) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS historial_estados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    solicitud_id INT NOT NULL,
    estado VARCHAR(40) NOT NULL,
    descripcion VARCHAR(255),
    completado BOOLEAN NOT NULL DEFAULT FALSE,
    fecha VARCHAR(20),
    hora VARCHAR(20),
    orden INT NOT NULL,
    FOREIGN KEY (solicitud_id) REFERENCES solicitudes(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS preguntas_frecuentes (
    id VARCHAR(20) PRIMARY KEY,
    pregunta VARCHAR(255) NOT NULL,
    respuesta TEXT NOT NULL,
    orden INT NOT NULL DEFAULT 0
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
];

const PREGUNTAS = [
  ['preg-01', '¿Cómo solicito la cancelación de mi servicio?', 'Puedes solicitar la cancelación ingresando a tu portal de autogestión, seleccionando la opción \'Solicitud de cancelación\', completando el formulario de 2 pasos (Motivo y Confirmación) y enviándolo. Recibirás una confirmación automática inmediatamente.', 1],
  ['preg-02', '¿Cuánto tiempo demora el proceso de cancelación?', 'El tiempo máximo de atención es de 24 horas hábiles desde que envías tu solicitud. Durante este periodo, nuestro equipo validará tu información y procesará la baja del servicio.', 2],
  ['preg-03', '¿Hasta qué fecha me cobrarán después de solicitar la cancelación?', 'La facturación se detiene a partir de la fecha de registro de tu solicitud de cancelación. Solo deberás pagar por los días de servicio consumidos hasta esa fecha, lo cual se calculará en tu recibo final prorrateado.', 3],
  ['preg-04', '¿Cómo sabré que mi servicio fue cancelado?', 'Te enviaremos notificaciones automáticas por correo electrónico y WhatsApp en cada etapa del proceso. Además, una vez completado, podrás descargar tu constancia digital de cancelación desde este portal.', 4],
  ['preg-05', '¿Puedo reactivar mi servicio después de cancelarlo?', 'Sí, puedes reactivar tu servicio en cualquier momento comunicándote directamente a nuestro canal exclusivo de WhatsApp de soporte o llamando a nuestra central. Te brindaremos promociones especiales por reingreso.', 5]
];

const CLIENTES = [
  {
    numeroCliente: '73193206', dni: '72458913', contrasena: 'MRjhey10',
    nombre: 'Jheymy Barboza Mondragon', telefono: '+51 942231107', correo: 'jheymybm@gmail.com',
    servicios: [['Internet Fibra 300 Mbps', 'Activo'], ['WIN TV Plus', 'Activo']],
    notificaciones: [['Tu recibo de Junio ha sido facturado con éxito.', 0], ['Mantenimiento programado en tu zona para el 15/07/2026.', 0], ['¡Bienvenido a tu nuevo portal de autogestión!', 1]]
  },
  {
    numeroCliente: '88888888', dni: '70112233', contrasena: 'win2026',
    nombre: 'Inés Valderrama', telefono: '+51 912 345 678', correo: 'ines.valderrama@email.com',
    servicios: [['Internet Fibra 500 Mbps', 'Activo']],
    notificaciones: []
  }
];

const ADMIN = { usuario: 'admin', contrasena: 'admin2026', nombre: 'Administrador WIN' };

async function contar(tabla) {
  const filas = await consultar(`SELECT COUNT(*) AS n FROM ${tabla}`);
  return filas[0].n;
}

export async function inicializarBaseDatos() {
  for (const ddl of TABLAS) await consultar(ddl);

  if ((await contar('preguntas_frecuentes')) === 0) {
    for (const p of PREGUNTAS) {
      await consultar('INSERT INTO preguntas_frecuentes (id, pregunta, respuesta, orden) VALUES (?, ?, ?, ?)', p);
    }
  }

  if ((await contar('administradores')) === 0) {
    const hash = await bcrypt.hash(ADMIN.contrasena, 10);
    await consultar('INSERT INTO administradores (usuario, contrasena_hash, nombre) VALUES (?, ?, ?)', [ADMIN.usuario, hash, ADMIN.nombre]);
  }

  if ((await contar('clientes')) === 0) {
    for (const c of CLIENTES) {
      const hash = await bcrypt.hash(c.contrasena, 10);
      await consultar('INSERT INTO clientes (numero_cliente, dni, contrasena_hash, nombre, telefono, correo) VALUES (?, ?, ?, ?, ?, ?)', [c.numeroCliente, c.dni, hash, c.nombre, c.telefono, c.correo]);
      for (const s of c.servicios) {
        await consultar('INSERT INTO servicios (numero_cliente, nombre, estado) VALUES (?, ?, ?)', [c.numeroCliente, s[0], s[1]]);
      }
      for (const n of c.notificaciones) {
        await consultar('INSERT INTO notificaciones (numero_cliente, mensaje, leida) VALUES (?, ?, ?)', [c.numeroCliente, n[0], n[1]]);
      }
    }
  }

  console.log('Base de datos verificada e inicializada.');
}
