import { api } from './api.js';

class AplicacionPortal {
  constructor() {
    this.contenedorApp = document.getElementById('contenedor-aplicacion');
    this.clienteActual = null;
    this.solicitudActiva = null;

    this.formularioLogin = document.getElementById('form-login');
    this.inputNumeroCliente = document.getElementById('login-numero-cliente');
    this.inputContrasena = document.getElementById('login-contrasena');
    this.errorLogin = document.getElementById('error-login');

    this.botonCerrarSesion = document.getElementById('btn-cerrar-sesion');
    this.nombreCabecera = document.getElementById('cabecera-nombre-cliente');
    this.numeroCabecera = document.getElementById('cabecera-numero-cliente');
    this.inicialesAvatar = document.getElementById('avatar-iniciales');
    this.notificacionesCampana = document.getElementById('campana-notificaciones');

    this.formularioCancelacion = document.getElementById('form-cancelacion');
    this.selectorMotivo = document.getElementById('cancelacion-motivo');
    this.textareaComentarios = document.getElementById('cancelacion-comentarios');
    this.inputFechaSolicitud = document.getElementById('cancelacion-fecha');
    this.botonCancelarForm = document.getElementById('btn-cancelar-formulario');

    this.inputBuscadorFaq = document.getElementById('buscador-faq');
    this.contenedorListaFaq = document.getElementById('lista-faq');

    this.inicializarEventos();
    this.verificarSesionExistente();
  }

  inicializarEventos() {

    if (this.formularioLogin) {
      this.formularioLogin.addEventListener('submit', (e) => this.ejecutarLogin(e));
    }

    const enlaceIrRegistro = document.getElementById('ir-a-registro');
    if (enlaceIrRegistro) {
      enlaceIrRegistro.addEventListener('click', (e) => { e.preventDefault(); this.navegarA('registro'); });
    }
    const enlaceIrLogin = document.getElementById('ir-a-login');
    if (enlaceIrLogin) {
      enlaceIrLogin.addEventListener('click', (e) => { e.preventDefault(); this.navegarA('inicio-sesion'); });
    }

    this.formularioRegistro = document.getElementById('form-registro');
    this.errorRegistro = document.getElementById('error-registro');
    if (this.formularioRegistro) {
      this.formularioRegistro.addEventListener('submit', (e) => this.ejecutarRegistro(e));
    }
    this.configurarCamposNumericos();

    if (this.botonCerrarSesion) {
      this.botonCerrarSesion.addEventListener('click', (e) => {
        e.preventDefault();
        this.cerrarSesion();
      });
    }

    document.querySelectorAll('.menu-item-enlace').forEach(enlace => {
      enlace.addEventListener('click', (e) => {
        e.preventDefault();
        const vista = e.currentTarget.getAttribute('data-vista');
        if (vista) {
          this.navegarA(vista);
          this.cerrarMenuMovil();
        }
      });
    });

    if (this.notificacionesCampana) {
      this.notificacionesCampana.addEventListener('click', (e) => {
        e.stopPropagation();
        const panel = document.getElementById('panel-notificaciones');
        if (panel) panel.classList.toggle('abierto');
      });
    }

    document.addEventListener('click', (e) => {
      const panel = document.getElementById('panel-notificaciones');
      if (panel && panel.classList.contains('abierto') && !e.target.closest('.notif-contenedor')) {
        panel.classList.remove('abierto');
      }
    });

    const botonMenuMovil = document.getElementById('btn-menu-movil');
    const overlayMovil = document.getElementById('overlay-movil');
    this.barraLateral = document.getElementById('barra-lateral');
    if (botonMenuMovil) {
      botonMenuMovil.addEventListener('click', () => this.alternarMenuMovil());
    }
    if (overlayMovil) {
      overlayMovil.addEventListener('click', () => this.cerrarMenuMovil());
    }

    document.querySelectorAll('.card-opcion').forEach(tarjeta => {
      tarjeta.addEventListener('click', (e) => {
        const vista = e.currentTarget.getAttribute('data-vista');
        if (vista) {
          e.preventDefault();
          this.navegarA(vista);
        }
      });
    });

    if (this.formularioCancelacion) {
      this.formularioCancelacion.addEventListener('submit', (e) => {
        e.preventDefault();
        this.ejecutarEnvioCancelacion(e);
      });
    }

    if (this.botonCancelarForm) {
      this.botonCancelarForm.addEventListener('click', () => {
        this.navegarA('menu-principal');
      });
    }

    const botonSiguientePaso = document.getElementById('btn-siguiente-paso');
    if (botonSiguientePaso) {
      botonSiguientePaso.addEventListener('click', () => {
        if (!this.selectorMotivo.value) {
          window.notificar('Por favor, selecciona el motivo de tu cancelación.', 'advertencia');
          this.selectorMotivo.focus();
          return;
        }

        if (this.selectorMotivo.value === 'Otro motivo' && !this.textareaComentarios.value.trim()) {
          window.notificar('Seleccionaste "Otro motivo": por favor detállalo en los comentarios.', 'advertencia');
          this.textareaComentarios.focus();
          return;
        }
        this.mostrarPasoFormulario(2);
      });
    }

    const botonAtrasPaso = document.getElementById('btn-atras-paso');
    if (botonAtrasPaso) {
      botonAtrasPaso.addEventListener('click', () => {
        this.mostrarPasoFormulario(1);
      });
    }

    if (this.inputBuscadorFaq) {
      this.inputBuscadorFaq.addEventListener('input', () => this.filtrarPreguntasFrecuentes());
    }

    document.querySelectorAll('.btn-retorno, .btn-volver-inicio').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.navegarA('menu-principal');
      });
    });
  }

  async verificarSesionExistente() {
    const numeroCliente = localStorage.getItem('numeroCliente');
    if (numeroCliente) {
      try {
        const resultado = await api.obtenerPerfil();
        if (resultado.exito) {
          this.autenticarCliente(resultado.cliente);
          return;
        }
      } catch (error) {
        console.error('Error al verificar sesión:', error);
      }
    }
    this.mostrarLogin();
  }

  mostrarLogin() {
    this.contenedorApp.className = 'no-autenticado';
    this.navegarA('inicio-sesion');
  }

  autenticarCliente(cliente) {
    this.clienteActual = cliente;
    localStorage.setItem('numeroCliente', cliente.numeroCliente);

    this.nombreCabecera.textContent = cliente.nombre;
    this.numeroCabecera.textContent = `Cliente N° ${cliente.numeroCliente}`;

    const partesNombre = cliente.nombre.split(' ');
    const iniciales = partesNombre.map(n => n[0]).join('').substring(0, 2).toUpperCase();
    this.inicialesAvatar.textContent = iniciales;

    const notificacionesNoLeidas = cliente.notificaciones.filter(n => !n.leida).length;
    if (notificacionesNoLeidas > 0) {
      this.notificacionesCampana.classList.add('con-notificaciones');
    } else {
      this.notificacionesCampana.classList.remove('con-notificaciones');
    }
    this.actualizarDashboard(cliente, notificacionesNoLeidas);

    this.contenedorApp.className = 'autenticado';

    this.navegarA('menu-principal');

    this.cargarPreguntasFrecuentes();

    this.sincronizarEstadoSolicitud();
  }

  cerrarSesion() {
    localStorage.removeItem('numeroCliente');
    this.clienteActual = null;
    this.solicitudActiva = null;
    this.formularioLogin.reset();
    if (this.errorLogin) this.errorLogin.style.display = 'none';
    this.mostrarLogin();
  }

  async ejecutarLogin(e) {
    e.preventDefault();
    const numeroCliente = this.inputNumeroCliente.value.trim();
    const contrasena = this.inputContrasena.value;

    if (!numeroCliente || !contrasena) {
      this.mostrarErrorLogin('Por favor complete todos los campos.');
      return;
    }

    try {
      const resultado = await api.iniciarSesion(numeroCliente, contrasena);
      if (resultado.exito) {
        this.autenticarCliente(resultado.cliente);
      } else {
        this.mostrarErrorLogin(resultado.mensaje);
      }
    } catch (error) {
      this.mostrarErrorLogin('Error de conexión con el servidor.');
    }
  }

  mostrarErrorLogin(mensaje) {
    this.errorLogin.textContent = mensaje;
    this.errorLogin.style.display = 'block';
  }

  mostrarErrorRegistro(mensaje) {
    this.errorRegistro.textContent = mensaje;
    this.errorRegistro.style.display = 'block';
  }

  marcarCampoInvalido(id, mensaje) {
    const campo = document.getElementById(id);
    if (campo) {
      campo.classList.add('campo-invalido');
      campo.focus();
    }
    this.mostrarErrorRegistro(mensaje);
  }

  configurarCamposNumericos() {
    document.querySelectorAll('.campo-numerico, #login-numero-cliente').forEach(campo => {
      campo.addEventListener('input', () => {
        const limpio = campo.value.replace(/\D/g, '');
        if (campo.value !== limpio) campo.value = limpio;
        campo.classList.remove('campo-invalido');
      });
    });
    document.querySelectorAll('#registro-nombre, #registro-correo, #registro-contrasena, #registro-contrasena2').forEach(campo => {
      campo.addEventListener('input', () => campo.classList.remove('campo-invalido'));
    });
  }

  async ejecutarRegistro(e) {
    e.preventDefault();
    if (this.errorRegistro) this.errorRegistro.style.display = 'none';

    const datos = {
      nombre: document.getElementById('registro-nombre').value.trim(),
      numeroCliente: document.getElementById('registro-numero-cliente').value.trim(),
      dni: document.getElementById('registro-dni').value.trim(),
      correo: document.getElementById('registro-correo').value.trim(),
      telefono: document.getElementById('registro-telefono').value.trim(),
      contrasena: document.getElementById('registro-contrasena').value
    };
    const contrasena2 = document.getElementById('registro-contrasena2').value;

    if (!datos.nombre || !datos.numeroCliente || !datos.dni || !datos.contrasena) {
      this.mostrarErrorRegistro('Por favor completa los campos obligatorios.');
      return;
    }
    if (!/^\d{6,12}$/.test(datos.numeroCliente)) {
      return this.marcarCampoInvalido('registro-numero-cliente', 'El número de cliente debe tener entre 6 y 12 dígitos.');
    }
    if (!/^\d{8}$/.test(datos.dni)) {
      return this.marcarCampoInvalido('registro-dni', 'El DNI debe tener exactamente 8 dígitos.');
    }
    if (datos.telefono && !/^9\d{8}$/.test(datos.telefono)) {
      return this.marcarCampoInvalido('registro-telefono', 'El teléfono debe tener 9 dígitos y empezar con 9.');
    }
    if (datos.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo)) {
      return this.marcarCampoInvalido('registro-correo', 'Ingresa un correo electrónico válido.');
    }
    if (datos.contrasena.length < 6) {
      return this.marcarCampoInvalido('registro-contrasena', 'La contraseña debe tener al menos 6 caracteres.');
    }
    if (datos.contrasena !== contrasena2) {
      return this.marcarCampoInvalido('registro-contrasena2', 'Las contraseñas no coinciden.');
    }

    try {
      const resultado = await api.registrar(datos);
      if (resultado.exito) {

        this.formularioRegistro.reset();
        this.autenticarCliente(resultado.cliente);
      } else {
        this.mostrarErrorRegistro(resultado.mensaje);
      }
    } catch (error) {
      this.mostrarErrorRegistro('Error de conexión con el servidor.');
    }
  }

  async sincronizarEstadoSolicitud() {
    try {
      const resultado = await api.obtenerEstadoCancelacion();
      if (resultado.exito && resultado.solicitud) {
        this.solicitudActiva = resultado.solicitud;
        this.actualizarVistasSeguimientoYConstancia();

        document.getElementById('card-seguimiento').style.pointerEvents = 'auto';
        document.getElementById('card-seguimiento').style.opacity = '1';
      } else {
        this.solicitudActiva = null;

        document.getElementById('card-seguimiento').style.pointerEvents = 'none';
        document.getElementById('card-seguimiento').style.opacity = '0.5';
      }
      this.actualizarTarjetasMenuPrincipal();
    } catch (error) {
      console.error('Error al sincronizar solicitud:', error);
    }
  }

    actualizarDashboard(cliente, notificacionesNoLeidas) {
    const serviciosActivos = cliente.servicios.filter(s => s.estado === 'Activo').length;

    const elServicios = document.getElementById('resumen-servicios-cant');
    if (elServicios) {
      elServicios.textContent = serviciosActivos === 1 ? '1 Activo' : `${serviciosActivos} Activos`;
    }

    const elNotif = document.getElementById('barra-notif-texto');
    if (elNotif) {
      if (notificacionesNoLeidas === 0) {
        elNotif.textContent = 'No tienes notificaciones nuevas.';
      } else if (notificacionesNoLeidas === 1) {
        elNotif.textContent = 'Tienes 1 notificación nueva.';
      } else {
        elNotif.textContent = `Tienes ${notificacionesNoLeidas} notificaciones nuevas.`;
      }
    }

    this.renderizarNotificaciones(cliente.notificaciones, notificacionesNoLeidas);
  }

    renderizarNotificaciones(notificaciones, noLeidas) {
    const lista = document.getElementById('panel-notif-lista');
    const contador = document.getElementById('panel-notif-contador');
    if (!lista) return;

    if (contador) {
      contador.textContent = noLeidas === 1 ? '1 nueva' : `${noLeidas} nuevas`;
    }

    if (!notificaciones || notificaciones.length === 0) {
      lista.innerHTML = '<div class="panel-notif-vacio">No tienes notificaciones.</div>';
      return;
    }

    const ordenadas = [...notificaciones].sort((a, b) => Number(a.leida) - Number(b.leida));
    lista.innerHTML = ordenadas.map(n => `
      <div class="notif-item ${n.leida ? 'leida' : 'no-leida'}">
        <div class="notif-punto"></div>
        <div>${this.escaparTexto(n.mensaje)}</div>
      </div>
    `).join('');
  }

  escaparTexto(texto) {
    const div = document.createElement('div');
    div.textContent = texto ?? '';
    return div.innerHTML;
  }

  actualizarTarjetasMenuPrincipal() {
    const cardCancelacion = document.getElementById('card-cancelacion');
    const detalleCancelacion = document.getElementById('card-cancelacion-detalle');

    if (this.solicitudActiva) {
      if (this.solicitudActiva.estadoActual === 'Cancelación completada') {
        detalleCancelacion.textContent = 'Servicio dado de baja. Consulta tu constancia.';
        cardCancelacion.setAttribute('data-vista', 'constancia-cancelacion');
      } else {
        detalleCancelacion.textContent = `Tu trámite está en curso (${this.solicitudActiva.estadoActual}). Ver seguimiento.`;
        cardCancelacion.setAttribute('data-vista', 'seguimiento-solicitud');
      }
    } else {
      detalleCancelacion.textContent = 'Solicita la baja definitiva de tu servicio.';
      cardCancelacion.setAttribute('data-vista', 'solicitud-cancelacion');
    }

    const tramiteEstado = document.getElementById('resumen-tramite-estado');
    const tramiteTarjeta = tramiteEstado ? tramiteEstado.closest('.metrica') : null;
    if (tramiteEstado && tramiteTarjeta) {
      if (this.solicitudActiva) {
        tramiteEstado.textContent = this.solicitudActiva.estadoActual;
        tramiteTarjeta.classList.remove('metrica-neutro');
        tramiteTarjeta.classList.add('metrica-naranja');
      } else {
        tramiteEstado.textContent = 'Ninguno';
        tramiteTarjeta.classList.remove('metrica-naranja');
        tramiteTarjeta.classList.add('metrica-neutro');
      }
    }
  }

  async ejecutarEnvioCancelacion(e) {
    e.preventDefault();
    const motivo = this.selectorMotivo.value;
    const comentarios = this.textareaComentarios.value.trim();

    if (!motivo) {
      window.notificar('Por favor, selecciona el motivo de tu cancelación.', 'advertencia');
      return;
    }

    try {
      const resultado = await api.enviarSolicitudCancelacion(motivo, comentarios);
      if (resultado.exito) {
        this.solicitudActiva = resultado.solicitud;

        this.actualizarVistasSeguimientoYConstancia();
        this.actualizarTarjetasMenuPrincipal();

        this.navegarA('confirmacion-automatica');

        document.getElementById('card-seguimiento').style.pointerEvents = 'auto';
        document.getElementById('card-seguimiento').style.opacity = '1';

        this.formularioCancelacion.reset();
      } else {
        window.notificar(resultado.mensaje, 'error');
      }
    } catch (error) {
      window.notificar('Error de conexión al enviar la solicitud.', 'error');
    }
  }

  actualizarVistasSeguimientoYConstancia() {
    if (!this.solicitudActiva) return;

    const ticket = this.solicitudActiva.codigoSolicitud;
    const estado = this.solicitudActiva.estadoActual;
    const fecha = this.solicitudActiva.fechaCreacion;

    document.getElementById('conf-ticket').textContent = ticket;
    document.getElementById('conf-estado').textContent = estado;
    document.getElementById('conf-estado').className = `etiqueta-estado ${this.obtenerClaseEstado(estado)}`;
    document.getElementById('conf-fecha').textContent = fecha;

    document.getElementById('seg-ticket').textContent = ticket;
    document.getElementById('seg-estado-badge').textContent = estado;
    document.getElementById('seg-estado-badge').className = `etiqueta-estado ${this.obtenerClaseEstado(estado)}`;

    const contenedorTimeline = document.getElementById('linea-progreso-seguimiento');
    contenedorTimeline.innerHTML = '';

    this.solicitudActiva.historialEstados.forEach(paso => {
      const nodo = document.createElement('div');
      let claseNodo = 'nodo-progreso';

      if (paso.completado) {
        claseNodo += ' completado';
      }
      if (paso.estado === estado) {
        claseNodo += ' activo';
      }

      nodo.className = claseNodo;
      nodo.innerHTML = `
        <div class="nodo-icono">
          <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
        </div>
        <div class="nodo-detalle">
          <div class="nodo-info">
            <h4>${paso.estado}</h4>
            <p>${paso.descripcion}</p>
          </div>
          <div class="nodo-tiempo">
            <div>${paso.fecha || 'Pendiente'}</div>
            <div style="font-weight: 600; font-size: 11px;">${paso.hora || ''}</div>
          </div>
        </div>
      `;
      contenedorTimeline.appendChild(nodo);
    });

    const alertaVencimiento = document.getElementById('seg-alerta-vencimiento');
    if (estado === 'En proceso') {
      alertaVencimiento.style.display = 'flex';
    } else {
      alertaVencimiento.style.display = 'none';
    }

    document.getElementById('const-ticket').textContent = ticket;
    document.getElementById('const-fecha').textContent = fecha;
    document.getElementById('const-estado').textContent = estado;
    document.getElementById('const-estado').className = `etiqueta-estado ${this.obtenerClaseEstado(estado)}`;

    const botonDescargarPdf = document.getElementById('btn-descargar-pdf');
    if (botonDescargarPdf) {
      botonDescargarPdf.href = `/api/cancelacion/descargar-pdf?numeroCliente=${this.clienteActual.numeroCliente}`;
    }

    this.actualizarTarjetasMenuPrincipal();
  }

  obtenerClaseEstado(estado) {
    switch (estado) {
      case 'Solicitud recibida': return 'recibido';
      case 'En validación':
      case 'En proceso': return 'en-proceso';
      case 'Cancelación completada': return 'completado';
      default: return '';
    }
  }

  async cargarPreguntasFrecuentes() {
    try {
      const resultado = await api.obtenerPreguntasFrecuentes();
      if (resultado.exito) {
        this.preguntasFrecuentes = resultado.preguntas;
        this.renderizarPreguntasFrecuentes(this.preguntasFrecuentes);
      }
    } catch (error) {
      console.error('Error al cargar preguntas:', error);
    }
  }

  renderizarPreguntasFrecuentes(preguntas) {
    this.contenedorListaFaq.innerHTML = '';

    if (preguntas.length === 0) {
      this.contenedorListaFaq.innerHTML = '<div style="text-align: center; color: var(--gris-texto-secundario); padding: 20px;">No se encontraron preguntas.</div>';
      return;
    }

    preguntas.forEach(faq => {
      const item = document.createElement('div');
      item.className = 'item-faq';
      item.innerHTML = `
        <div class="item-faq-pregunta">
          <span>${faq.pregunta}</span>
          <svg viewBox="0 0 24 24"><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/></svg>
        </div>
        <div class="item-faq-respuesta">
          <p>${faq.respuesta}</p>
        </div>
      `;

      item.querySelector('.item-faq-pregunta').addEventListener('click', () => {
        const abierto = item.classList.contains('abierto');

        document.querySelectorAll('.item-faq').forEach(i => i.classList.remove('abierto'));

        if (!abierto) {
          item.classList.add('abierto');
        }
      });

      this.contenedorListaFaq.appendChild(item);
    });
  }

  filtrarPreguntasFrecuentes() {
    const busqueda = this.inputBuscadorFaq.value.toLowerCase().trim();
    if (!this.preguntasFrecuentes) return;

    const filtradas = this.preguntasFrecuentes.filter(faq =>
      faq.pregunta.toLowerCase().includes(busqueda) ||
      faq.respuesta.toLowerCase().includes(busqueda)
    );

    this.renderizarPreguntasFrecuentes(filtradas);
  }

    alternarMenuMovil() {
    if (!this.barraLateral) return;
    const abierta = this.barraLateral.classList.toggle('abierta');
    const overlay = document.getElementById('overlay-movil');
    if (overlay) overlay.classList.toggle('visible', abierta);
  }

  cerrarMenuMovil() {
    if (this.barraLateral) this.barraLateral.classList.remove('abierta');
    const overlay = document.getElementById('overlay-movil');
    if (overlay) overlay.classList.remove('visible');
  }

  navegarA(pantallaId) {

    document.querySelectorAll('.vista-pantalla').forEach(p => p.classList.remove('activa'));

    document.querySelectorAll('.menu-item-enlace').forEach(link => link.classList.remove('activo'));

    const pantalla = document.getElementById(pantallaId);
    if (pantalla) {
      pantalla.classList.add('activa');
    }

    const enlaceActivo = document.querySelector(`.menu-item-enlace[data-vista="${pantallaId}"]`);
    if (enlaceActivo) {
      enlaceActivo.classList.add('activo');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (pantallaId === 'solicitud-cancelacion') {
      this.mostrarPasoFormulario(1);
    }

    if (['menu-principal', 'seguimiento-solicitud', 'constancia-cancelacion'].includes(pantallaId) && this.clienteActual) {
      this.sincronizarEstadoSolicitud();
      this.refrescarPerfil();
    }
  }

    async refrescarPerfil() {
    try {
      const resultado = await api.obtenerPerfil();
      if (resultado.exito && resultado.cliente) {
        this.clienteActual = resultado.cliente;
        const noLeidas = resultado.cliente.notificaciones.filter(n => !n.leida).length;
        this.notificacionesCampana.classList.toggle('con-notificaciones', noLeidas > 0);
        this.actualizarDashboard(resultado.cliente, noLeidas);
      }
    } catch (error) {
      console.error('Error al refrescar perfil:', error);
    }
  }

    mostrarPasoFormulario(paso) {
    const seccion1 = document.getElementById('seccion-paso-1');
    const seccion2 = document.getElementById('seccion-paso-2');
    const pasosIndicadores = document.querySelectorAll('.indicador-pasos .paso');

    if (!pasosIndicadores || pasosIndicadores.length < 2) return;

    if (paso === 1) {
      if (seccion1) seccion1.style.display = 'block';
      if (seccion2) seccion2.style.display = 'none';

      pasosIndicadores[0].className = 'paso activo';
      pasosIndicadores[1].className = 'paso';
    } else if (paso === 2) {
      if (seccion1) seccion1.style.display = 'none';
      if (seccion2) seccion2.style.display = 'block';

      pasosIndicadores[0].className = 'paso completado';
      pasosIndicadores[1].className = 'paso activo';

      const resumenMotivo = document.getElementById('resumen-motivo');
      const resumenComentarios = document.getElementById('resumen-comentarios');
      const resumenFecha = document.getElementById('resumen-fecha');

      if (resumenMotivo) resumenMotivo.textContent = this.selectorMotivo.value;
      if (resumenComentarios) resumenComentarios.textContent = this.textareaComentarios.value.trim() || 'Sin comentarios adicionales.';
      if (resumenFecha) resumenFecha.textContent = this.inputFechaSolicitud.value;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.appPortal = new AplicacionPortal();
});
