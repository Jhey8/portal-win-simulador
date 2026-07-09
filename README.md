# Portal de Autogestión de Cancelación - WIN Internet

Aplicación web para optimizar y transparentar el proceso de cancelación del servicio de internet de **WIN Internet**. Cuenta con **base de datos MySQL**, **autenticación con contraseñas cifradas (bcrypt)** y las vistas separadas en archivos independientes.

El sistema usa **español** para todas las variables, funciones, nombres de archivos y carpetas, siguiendo una arquitectura por capas (controladores → servicios → datos).

---

## 🛠️ Tecnologías Utilizadas

- **Backend (Node.js)**:
  - **Express**: Servidor web y APIs REST.
  - **EJS**: Motor de vistas; cada pantalla del portal vive en su propio archivo (`src/vistas/`).
  - **MySQL / MariaDB** (`mysql2`): Persistencia real de datos.
  - **bcryptjs**: Cifrado (hash) de contraseñas.
  - **PDFKit**: Generación dinámica de la constancia de baja en PDF.
  - **dotenv**: Configuración por variables de entorno.
- **Frontend**:
  - **HTML5 + EJS** en formato SPA (Single Page Application).
  - **Vanilla CSS**: Sistema de diseño con variables, Grid y Flexbox (naranja corporativo `#FF5A00`).
  - **Vanilla Javascript**: Enrutamiento virtual, flujo de pantallas y llamadas a la API.

---

## 📂 Estructura del Proyecto

```text
trabajoNicol/
│
├── package.json            # Configuración del proyecto y dependencias
├── servidor.js             # Punto de entrada del servidor Express
├── esquema.sql             # Definición de la base de datos (tablas + FAQ)
├── sembrar.js              # Carga los clientes de demo con contraseñas cifradas
├── .env                    # Variables de entorno (puerto y conexión a la BD)
├── configurar_bd.bat       # Configuración inicial de la base de datos (una vez)
├── iniciar.bat             # Arranca el servidor en Windows
│
└── src/
    ├── aplicacion.js       # Configuración de Express, motor EJS y rutas
    │
    ├── controladores/      # Controladores HTTP de la API
    ├── servicios/          # Lógica de negocio (cancelación y PDF)
    ├── utilidades/         # Utilidades (formato de fechas)
    │
    ├── datos/
    │   ├── conexion.js     # Pool de conexiones a MySQL
    │   └── repositorio.js  # Acceso a datos (consultas SQL)
    │
    ├── vistas/             # Vistas EJS (¡separadas por pantalla!)
    │   ├── index.ejs       # Layout principal que ensambla los parciales
    │   ├── parciales/      # sidebar, cabecera, panel simulador
    │   └── pantallas/      # login, menú, solicitud, seguimiento, constancia, faq...
    │
    └── publico/            # Estáticos del frontend
        ├── css/            # variables, diseño, componentes, pantallas
        ├── js/             # api.js, aplicacion.js, simulador.js
        └── imagenes/
```

---

## 🚀 Cómo Iniciar el Proyecto

### Requisito previo
Tener **XAMPP** instalado y el módulo **MySQL encendido** desde su panel de control.

### Paso 1: Configurar la base de datos (solo la primera vez)
Haz doble clic en **`configurar_bd.bat`**. Esto crea las tablas y carga los datos de demostración.

> Si tu XAMPP no está en `C:\xampp` ni `D:\xampp`, abre `configurar_bd.bat` y ajusta la ruta de `MYSQL_EXE`. También puedes configurar la conexión en el archivo `.env`.

### Paso 2: Iniciar el servidor
Haz doble clic en **`iniciar.bat`**. Instalará dependencias, levantará el servidor en el puerto **3005** y abrirá el navegador.

Luego entra a: **[http://localhost:3005](http://localhost:3005)**

### Alternativa manual (por comandos)
```bash
npm install
# Primera vez: crear BD y sembrar datos (con MySQL encendido)
"C:\xampp\mysql\bin\mysql.exe" -u root < esquema.sql
npm run sembrar
# Iniciar
npm start
```

---

## 🔑 Credenciales de Demostración

Las contraseñas se guardan **cifradas con bcrypt** en la base de datos.

| N° de Cliente | Contraseña | Titular                  |
|---------------|------------|--------------------------|
| `73193206`    | `MRjhey10` | Nicole Valderrama Bravo  |
| `88888888`    | `win2026`  | Inés Valderrama          |

El formulario de login viene prellenado con el primer cliente.

### Panel de Administrador (Asesor)

Accede en **[http://localhost:3005/admin](http://localhost:3005/admin)**:

| Usuario | Contraseña  | Rol         |
|---------|-------------|-------------|
| `admin` | `admin2026` | Asesor WIN  |

---

## 📋 Flujo de Interacción (7 Pantallas)

1. **Inicio de sesión**: Ingreso con número de cliente y contraseña (verificada con bcrypt).
2. **Menú principal**: Dashboard con métricas reales del cliente (servicios activos, notificaciones).
3. **Solicitud de cancelación**: Formulario de **2 pasos** (Motivo → Confirmación).
4. **Confirmación automática**: Número de ticket generado.
5. **Seguimiento en tiempo real**: Línea de tiempo del estado de la baja, con alerta de caducidad.
6. **Constancia de cancelación**: Descarga del comprobante PDF oficial generado por el servidor.
7. **Preguntas frecuentes**: Acordeón con buscador en tiempo real.

---

## 👩‍💼 Panel de Administrador (Backoffice)

En **`/admin`** un asesor de WIN inicia sesión (con contraseña cifrada por bcrypt) y **atiende** las solicitudes de baja de todos los clientes:
- Ve una tabla con la solicitud de cada cliente (titular, código, motivo, estado).
- Cambia el estado del trámite (`Recibida → En validación → En proceso → Completada`).
- El cliente ve el cambio reflejado en su portal (pantallas de seguimiento y constancia).

Este es el flujo **realista**: el trámite no avanza solo, lo procesa una persona.

> **Regla de negocio:** cada cliente solo puede tener **una solicitud activa** a la vez. Solo puede iniciar otra cuando la anterior llega a "Cancelación completada".

Cuando el cliente entra a su seguimiento o constancia, el portal vuelve a consultar el estado, por lo que **verá reflejados los cambios que hizo el asesor**.
