const ESTADOS = ['Solicitud recibida', 'En validación', 'En proceso', 'Cancelación completada'];

const pantallaLogin = document.getElementById('admin-login');
const panel = document.getElementById('admin-panel');
const formLogin = document.getElementById('admin-form-login');
const inputUsuario = document.getElementById('admin-usuario');
const inputContrasena = document.getElementById('admin-contrasena');
const cajaError = document.getElementById('admin-error');

const nombreAdmin = document.getElementById('admin-nombre');
const tablaBody = document.getElementById('admin-tabla-body');
const avisoVacio = document.getElementById('admin-vacio');
const btnRefrescar = document.getElementById('admin-btn-refrescar');
const btnSalir = document.getElementById('admin-btn-salir');

const cabecerasAdmin = () => {
  const usuario = localStorage.getItem('adminUsuario');
  return {
    'Content-Type': 'application/json',
    ...(usuario ? { 'x-admin-usuario': usuario } : {})
  };
};

const claseEstado = (estado) => {
  switch (estado) {
    case 'Solicitud recibida': return 'recibido';
    case 'En validación':
    case 'En proceso': return 'en-proceso';
    case 'Cancelación completada': return 'completado';
    default: return '';
  }
};

const escaparHtml = (texto) => {
  const div = document.createElement('div');
  div.textContent = texto ?? '';
  return div.innerHTML;
};

formLogin.addEventListener('submit', async (e) => {
  e.preventDefault();
  cajaError.style.display = 'none';

  const usuario = inputUsuario.value.trim();
  const contrasena = inputContrasena.value;

  try {
    const respuesta = await fetch('/api/admin/iniciar-sesion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario, contrasena })
    });
    const resultado = await respuesta.json();

    if (resultado.exito) {
      localStorage.setItem('adminUsuario', resultado.admin.usuario);
      localStorage.setItem('adminNombre', resultado.admin.nombre);
      mostrarPanel(resultado.admin.nombre);
    } else {
      mostrarError(resultado.mensaje);
    }
  } catch (error) {
    mostrarError('Error de conexión con el servidor.');
  }
});

const mostrarError = (mensaje) => {
  cajaError.textContent = mensaje;
  cajaError.style.display = 'block';
};

const mostrarPanel = (nombre) => {
  pantallaLogin.style.display = 'none';
  panel.style.display = 'block';
  nombreAdmin.textContent = nombre;
  cargarSolicitudes();
};

const cerrarSesion = () => {
  localStorage.removeItem('adminUsuario');
  localStorage.removeItem('adminNombre');
  panel.style.display = 'none';
  pantallaLogin.style.display = 'flex';
  formLogin.reset();
  inputUsuario.value = 'admin';
  inputContrasena.value = 'admin2026';
};

btnSalir.addEventListener('click', cerrarSesion);
btnRefrescar.addEventListener('click', cargarSolicitudes);

async function cargarSolicitudes() {
  try {
    const respuesta = await fetch('/api/admin/solicitudes', { headers: cabecerasAdmin() });
    if (respuesta.status === 401) {
      cerrarSesion();
      return;
    }
    const resultado = await respuesta.json();
    if (!resultado.exito) return;

    renderizarTabla(resultado.solicitudes);
  } catch (error) {
    console.error('Error al cargar solicitudes:', error);
  }
}

function renderizarTabla(solicitudes) {
  tablaBody.innerHTML = '';

  if (!solicitudes || solicitudes.length === 0) {
    avisoVacio.style.display = 'block';
    return;
  }
  avisoVacio.style.display = 'none';

  solicitudes.forEach(sol => {
    const opciones = ESTADOS.map(estado =>
      `<option value="${estado}" ${estado === sol.estadoActual ? 'selected' : ''}>${estado}</option>`
    ).join('');

    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td class="admin-cliente-nombre">
        ${escaparHtml(sol.clienteNombre)}
        <button class="admin-toggle-fila" aria-label="Ver más datos">Ver más ▼</button>
      </td>
      <td class="col-extra" data-label="N° Cliente">${escaparHtml(sol.numeroCliente)}</td>
      <td class="admin-codigo col-extra" data-label="Código">${escaparHtml(sol.codigoSolicitud)}</td>
      <td class="col-extra" data-label="Motivo">${escaparHtml(sol.motivo)}</td>
      <td data-label="Estado"><span class="admin-estado ${claseEstado(sol.estadoActual)}">${escaparHtml(sol.estadoActual)}</span></td>
      <td class="col-extra" data-label="Registrada">${escaparHtml(sol.fechaCreacion)} · ${escaparHtml(sol.horaCreacion)}</td>
      <td class="col-extra" data-label="Atender">
        <div class="admin-accion">
          <select data-cliente="${escaparHtml(sol.numeroCliente)}">${opciones}</select>
          <button class="admin-btn admin-btn-primario btn-actualizar" style="width:auto; margin:0; height:auto; padding:8px 14px;" data-cliente="${escaparHtml(sol.numeroCliente)}">Actualizar</button>
          <button class="admin-btn admin-btn-reiniciar" style="width:auto; margin:0; height:auto; padding:8px 14px;" data-cliente="${escaparHtml(sol.numeroCliente)}" title="Elimina la solicitud para que el cliente pueda volver a solicitarla">Reiniciar</button>
        </div>
      </td>
    `;
    tablaBody.appendChild(fila);
  });

  tablaBody.querySelectorAll('.admin-toggle-fila').forEach(boton => {
    boton.addEventListener('click', () => {
      const fila = boton.closest('tr');
      const expandida = fila.classList.toggle('expandida');
      boton.textContent = expandida ? 'Ver menos ▲' : 'Ver más ▼';
    });
  });

  tablaBody.querySelectorAll('.btn-actualizar').forEach(boton => {
    boton.addEventListener('click', () => {
      const numeroCliente = boton.getAttribute('data-cliente');
      const selector = tablaBody.querySelector(`select[data-cliente="${numeroCliente}"]`);
      actualizarEstado(numeroCliente, selector.value);
    });
  });

  tablaBody.querySelectorAll('.admin-btn-reiniciar').forEach(boton => {
    boton.addEventListener('click', async () => {
      const numeroCliente = boton.getAttribute('data-cliente');
      const confirmado = await window.confirmarAccion(
        `Se eliminará el trámite del cliente ${numeroCliente} y podrá solicitar la baja de nuevo.`,
        { titulo: '¿Reiniciar solicitud?', confirmar: 'Sí, reiniciar', peligro: true }
      );
      if (confirmado) reiniciarSolicitud(numeroCliente);
    });
  });
}

async function actualizarEstado(numeroCliente, nuevoEstado) {
  try {
    const respuesta = await fetch('/api/admin/solicitudes/estado', {
      method: 'POST',
      headers: cabecerasAdmin(),
      body: JSON.stringify({ numeroCliente, nuevoEstado })
    });
    const resultado = await respuesta.json();

    if (resultado.exito) {
      window.notificar(resultado.mensaje, 'exito');
      cargarSolicitudes();
    } else {
      window.notificar(resultado.mensaje, 'error');
    }
  } catch (error) {
    window.notificar('Error de conexión al actualizar el estado.', 'error');
  }
}

async function reiniciarSolicitud(numeroCliente) {
  try {
    const respuesta = await fetch('/api/admin/solicitudes/reiniciar', {
      method: 'POST',
      headers: cabecerasAdmin(),
      body: JSON.stringify({ numeroCliente })
    });
    const resultado = await respuesta.json();

    if (resultado.exito) {
      window.notificar(resultado.mensaje, 'exito');
      cargarSolicitudes();
    } else {
      window.notificar(resultado.mensaje, 'error');
    }
  } catch (error) {
    window.notificar('Error de conexión al reiniciar la solicitud.', 'error');
  }
}

if (localStorage.getItem('adminUsuario')) {
  mostrarPanel(localStorage.getItem('adminNombre') || 'Administrador');
}
