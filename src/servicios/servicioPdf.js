import PDFDocument from 'pdfkit';

const NARANJA = '#FF5A00';
const GRIS_OSCURO = '#2C2C2C';
const GRIS_TEXTO = '#333333';
const VERDE = '#2E7D32';

export const generarPdfConstancia = (cliente, solicitud, res) => {
  const doc = new PDFDocument({
    size: 'LETTER',
    margins: { top: 50, bottom: 50, left: 50, right: 50 }
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=Constancia_Cancelacion_${solicitud.codigoSolicitud}.pdf`
  );
  doc.pipe(res);

  const izquierda = doc.page.margins.left;
  const derecha = doc.page.width - doc.page.margins.right;
  const anchoUtil = derecha - izquierda;

  doc.rect(0, 0, doc.page.width, 15).fill(NARANJA);

  doc.fillColor(NARANJA).fontSize(28).font('Helvetica-Bold').text('win', izquierda, 45, { continued: true });
  doc.fillColor(GRIS_OSCURO).fontSize(10).font('Helvetica').text('  EL INTERNET DE LOS WINNERS');

  doc.strokeColor(NARANJA).lineWidth(2).moveTo(izquierda, 85).lineTo(derecha, 85).stroke();

  let posY = 105;
  doc.fillColor(GRIS_OSCURO).fontSize(20).font('Helvetica-Bold')
     .text('CONSTANCIA DE CANCELACIÓN DE SERVICIO', izquierda, posY, { width: anchoUtil, align: 'center' });

  posY = doc.y + 8;
  doc.fontSize(11).font('Helvetica').fillColor('#555555')
     .text(`Código de Solicitud: ${solicitud.codigoSolicitud}`, izquierda, posY, { width: anchoUtil, align: 'center' });
  doc.text(`Fecha de Cancelación: ${solicitud.fechaCreacion}`, { width: anchoUtil, align: 'center' });

  posY = doc.y + 25;

  const altoDatos = 110;
  doc.fillColor('#FFF0E6').rect(izquierda, posY, anchoUtil, altoDatos).fill();

  doc.fillColor(GRIS_OSCURO).fontSize(12).font('Helvetica-Bold')
     .text('DATOS DEL TITULAR Y DEL SERVICIO', izquierda + 15, posY + 15);
  doc.strokeColor(NARANJA).lineWidth(1)
     .moveTo(izquierda + 15, posY + 32).lineTo(derecha - 15, posY + 32).stroke();

  const etiquetaX = izquierda + 15;
  const valorX = izquierda + 130;
  let filaY = posY + 45;
  const escribirDato = (etiqueta, valor) => {
    doc.fontSize(10).font('Helvetica').fillColor(GRIS_TEXTO).text(etiqueta, etiquetaX, filaY);
    doc.font('Helvetica-Bold').text(String(valor), valorX, filaY);
    filaY += 15;
  };
  escribirDato('Nombre del Cliente:', cliente.nombre);
  escribirDato('Número de Cliente:', cliente.numeroCliente);
  escribirDato('DNI / Documento:', cliente.dni);
  escribirDato('Correo Electrónico:', cliente.correo);

  posY = posY + altoDatos + 25;

  doc.fillColor(GRIS_OSCURO).fontSize(12).font('Helvetica-Bold')
     .text('DETALLES DE LA SOLICITUD', izquierda, posY);
  posY += 17;
  doc.strokeColor('#CCCCCC').lineWidth(1).moveTo(izquierda, posY).lineTo(derecha, posY).stroke();
  posY += 12;

  const escribirDetalle = (etiqueta, valor) => {
    doc.fontSize(10).font('Helvetica').fillColor(GRIS_TEXTO).text(etiqueta, izquierda, posY);
    const opciones = { width: derecha - valorX, align: 'left' };
    doc.font('Helvetica-Bold').text(String(valor), valorX, posY, opciones);

    const altoValor = doc.heightOfString(String(valor), opciones);
    posY += Math.max(15, altoValor) + 6;
  };
  escribirDetalle('Motivo de Cancelación:', solicitud.motivo);
  escribirDetalle('Fecha de Registro:', `${solicitud.fechaCreacion} a las ${solicitud.horaCreacion}`);
  escribirDetalle('Comentarios:', solicitud.comentarios || 'Sin comentarios adicionales.');

  posY += 15;

  const textoCertificacion =
    'Certificación de Baja: WIN Internet certifica que la solicitud de baja ha sido procesada de ' +
    'manera exitosa y que a partir de la fecha indicada no se generarán nuevas facturaciones por el ' +
    'servicio descrito anteriormente, de acuerdo con el marco regulatorio vigente.';

  const opcionesCert = { width: anchoUtil - 30, align: 'justify' };
  const altoTexto = doc.fontSize(10).font('Helvetica-Oblique').heightOfString(textoCertificacion, opcionesCert);
  const altoCaja = altoTexto + 30;

  doc.fillColor('#F9F9F9').rect(izquierda, posY, anchoUtil, altoCaja).fill();
  doc.strokeColor(VERDE).lineWidth(1).rect(izquierda, posY, anchoUtil, altoCaja).stroke();
  doc.fillColor(VERDE).font('Helvetica-Oblique').fontSize(10)
     .text(textoCertificacion, izquierda + 15, posY + 15, opcionesCert);

  posY += altoCaja + 40;

  doc.strokeColor('#999999').lineWidth(1)
     .moveTo(izquierda + 150, posY).lineTo(derecha - 150, posY).stroke();
  posY += 10;

  doc.fontSize(10).font('Helvetica-Bold').fillColor(GRIS_OSCURO)
     .text('Sello Digital de WIN Internet', izquierda, posY, { width: anchoUtil, align: 'center' });
  posY = doc.y + 4;
  doc.fontSize(8).font('Helvetica').fillColor('#888888')
     .text('Documento firmado digitalmente por WIN S.A.C.', izquierda, posY, { width: anchoUtil, align: 'center' });
  const idFirma = Math.random().toString(16).substring(2, 10).toUpperCase();
  doc.text(`Identificador de firmas: SHA-256 / ${idFirma}`, { width: anchoUtil, align: 'center' });

  doc.rect(0, doc.page.height - 15, doc.page.width, 15).fill(GRIS_OSCURO);

  doc.end();
};
