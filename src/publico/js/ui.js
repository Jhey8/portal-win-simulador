(function () {
  const ICONOS = {
    exito: '<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>',
    error: '<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',
    advertencia: '<svg viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>',
    info: '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>'
  };

  function contenedorToasts() {
    let c = document.getElementById('ui-toasts');
    if (!c) {
      c = document.createElement('div');
      c.id = 'ui-toasts';
      c.className = 'ui-toasts';
      document.body.appendChild(c);
    }
    return c;
  }

    window.notificar = function (mensaje, tipo) {
    tipo = tipo || 'info';
    const toast = document.createElement('div');
    toast.className = 'ui-toast ui-toast-' + tipo;
    toast.innerHTML = '<span class="ui-toast-icono">' + (ICONOS[tipo] || ICONOS.info) + '</span><span class="ui-toast-msg"></span>';
    toast.querySelector('.ui-toast-msg').textContent = mensaje;
    contenedorToasts().appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('visible'));

    let cerrado = false;
    const cerrar = () => {
      if (cerrado) return;
      cerrado = true;
      toast.classList.remove('visible');
      setTimeout(() => toast.remove(), 300);
    };
    toast.addEventListener('click', cerrar);
    setTimeout(cerrar, 4000);
  };

    window.confirmarAccion = function (mensaje, opciones) {
    opciones = opciones || {};
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.className = 'ui-modal-overlay';
      overlay.innerHTML =
        '<div class="ui-modal">' +
          (opciones.titulo ? '<div class="ui-modal-titulo"></div>' : '') +
          '<div class="ui-modal-msg"></div>' +
          '<div class="ui-modal-acciones">' +
            '<button class="ui-modal-btn ui-modal-cancelar"></button>' +
            '<button class="ui-modal-btn ui-modal-confirmar' + (opciones.peligro ? ' peligro' : '') + '"></button>' +
          '</div>' +
        '</div>';

      if (opciones.titulo) overlay.querySelector('.ui-modal-titulo').textContent = opciones.titulo;
      overlay.querySelector('.ui-modal-msg').textContent = mensaje;
      overlay.querySelector('.ui-modal-cancelar').textContent = opciones.cancelar || 'Cancelar';
      overlay.querySelector('.ui-modal-confirmar').textContent = opciones.confirmar || 'Confirmar';

      document.body.appendChild(overlay);
      requestAnimationFrame(() => overlay.classList.add('visible'));

      const cerrar = (valor) => {
        overlay.classList.remove('visible');
        setTimeout(() => overlay.remove(), 200);
        resolve(valor);
      };
      overlay.querySelector('.ui-modal-cancelar').addEventListener('click', () => cerrar(false));
      overlay.querySelector('.ui-modal-confirmar').addEventListener('click', () => cerrar(true));
      overlay.addEventListener('click', (e) => { if (e.target === overlay) cerrar(false); });
    });
  };
})();
