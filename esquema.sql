CREATE DATABASE IF NOT EXISTS portal_win
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE portal_win;

DROP TABLE IF EXISTS historial_estados;
DROP TABLE IF EXISTS solicitudes;
DROP TABLE IF EXISTS notificaciones;
DROP TABLE IF EXISTS servicios;
DROP TABLE IF EXISTS preguntas_frecuentes;
DROP TABLE IF EXISTS clientes;
DROP TABLE IF EXISTS administradores;

CREATE TABLE administradores (
  usuario          VARCHAR(40)  PRIMARY KEY,
  contrasena_hash  VARCHAR(255) NOT NULL,
  nombre           VARCHAR(120) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE clientes (
  numero_cliente    VARCHAR(20)  PRIMARY KEY,
  dni               VARCHAR(20)  NOT NULL,
  contrasena_hash   VARCHAR(255) NOT NULL,
  nombre            VARCHAR(120) NOT NULL,
  telefono          VARCHAR(30),
  correo            VARCHAR(120)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE servicios (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  numero_cliente  VARCHAR(20)  NOT NULL,
  nombre          VARCHAR(120) NOT NULL,
  estado          VARCHAR(30)  NOT NULL DEFAULT 'Activo',
  FOREIGN KEY (numero_cliente) REFERENCES clientes(numero_cliente) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE notificaciones (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  numero_cliente  VARCHAR(20)  NOT NULL,
  mensaje         VARCHAR(255) NOT NULL,
  leida           BOOLEAN      NOT NULL DEFAULT FALSE,
  FOREIGN KEY (numero_cliente) REFERENCES clientes(numero_cliente) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE solicitudes (
  id                      INT AUTO_INCREMENT PRIMARY KEY,
  numero_cliente          VARCHAR(20)  NOT NULL,
  codigo_solicitud        VARCHAR(30)  NOT NULL UNIQUE,
  motivo                  VARCHAR(150) NOT NULL,
  comentarios             TEXT,
  estado_actual           VARCHAR(40)  NOT NULL,
  fecha_creacion          VARCHAR(20),
  hora_creacion           VARCHAR(20),
  tiempo_maximo_atencion  VARCHAR(40),
  ultima_actualizacion    DATETIME,
  FOREIGN KEY (numero_cliente) REFERENCES clientes(numero_cliente) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE historial_estados (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  solicitud_id  INT          NOT NULL,
  estado        VARCHAR(40)  NOT NULL,
  descripcion   VARCHAR(255),
  completado    BOOLEAN      NOT NULL DEFAULT FALSE,
  fecha         VARCHAR(20),
  hora          VARCHAR(20),
  orden         INT          NOT NULL,
  FOREIGN KEY (solicitud_id) REFERENCES solicitudes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE preguntas_frecuentes (
  id         VARCHAR(20)  PRIMARY KEY,
  pregunta   VARCHAR(255) NOT NULL,
  respuesta  TEXT         NOT NULL,
  orden      INT          NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO preguntas_frecuentes (id, pregunta, respuesta, orden) VALUES
('preg-01', '¿Cómo solicito la cancelación de mi servicio?',
 'Puedes solicitar la cancelación ingresando a tu portal de autogestión, seleccionando la opción ''Solicitud de cancelación'', completando el formulario de 2 pasos (Motivo y Confirmación) y enviándolo. Recibirás una confirmación automática inmediatamente.', 1),
('preg-02', '¿Cuánto tiempo demora el proceso de cancelación?',
 'El tiempo máximo de atención es de 24 horas hábiles desde que envías tu solicitud. Durante este periodo, nuestro equipo validará tu información y procesará la baja del servicio.', 2),
('preg-03', '¿Hasta qué fecha me cobrarán después de solicitar la cancelación?',
 'La facturación se detiene a partir de la fecha de registro de tu solicitud de cancelación. Solo deberás pagar por los días de servicio consumidos hasta esa fecha, lo cual se calculará en tu recibo final prorrateado.', 3),
('preg-04', '¿Cómo sabré que mi servicio fue cancelado?',
 'Te enviaremos notificaciones automáticas por correo electrónico y WhatsApp en cada etapa del proceso. Además, una vez completado, podrás descargar tu constancia digital de cancelación desde este portal.', 4),
('preg-05', '¿Puedo reactivar mi servicio después de cancelarlo?',
 'Sí, puedes reactivar tu servicio en cualquier momento comunicándote directamente a nuestro canal exclusivo de WhatsApp de soporte o llamando a nuestra central. Te brindaremos promociones especiales por reingreso.', 5);
