const cabecerasComunes = () => {
  const numeroCliente = localStorage.getItem('numeroCliente');
  return {
    'Content-Type': 'application/json',
    ...(numeroCliente ? { 'x-numero-cliente': numeroCliente } : {})
  };
};

export const api = {
    async iniciarSesion(numeroCliente, contrasena) {
    const respuesta = await fetch('/api/autenticacion/iniciar-sesion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ numeroCliente, contrasena })
    });
    return await respuesta.json();
  },

    async registrar(datos) {
    const respuesta = await fetch('/api/autenticacion/registrar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    });
    return await respuesta.json();
  },

    async obtenerPerfil() {
    const respuesta = await fetch('/api/cliente/perfil', {
      method: 'GET',
      headers: cabecerasComunes()
    });
    return await respuesta.json();
  },

    async obtenerEstadoCancelacion() {
    const respuesta = await fetch('/api/cancelacion/estado', {
      method: 'GET',
      headers: cabecerasComunes()
    });
    return await respuesta.json();
  },

    async enviarSolicitudCancelacion(motivo, comentarios) {
    const respuesta = await fetch('/api/cancelacion/solicitar', {
      method: 'POST',
      headers: cabecerasComunes(),
      body: JSON.stringify({ motivo, comentarios })
    });
    return await respuesta.json();
  },

    async obtenerPreguntasFrecuentes() {
    const respuesta = await fetch('/api/preguntas-frecuentes', {
      method: 'GET',
      headers: cabecerasComunes()
    });
    return await respuesta.json();
  }
};
