/**
 * Plantilla del correo interno que avisa a INDUCOM de una solicitud de crédito nueva.
 *
 * Sin `server-only` a propósito: es una función pura que solo arma un string y no
 * toca ninguna credencial, así que puede renderizarse en un script para previsualizarla.
 * Quien sí guarda el secreto (la API key de Resend) es el route handler.
 *
 * Mismo diseño que la plantilla de "Restablece tu contraseña" que vive en el
 * dashboard de Supabase (Authentication → Emails): tablas anidadas y estilos
 * inline, que es lo único que renderiza bien en Outlook/Gmail.
 *
 * Colores tomados de design-tokens.css:
 * - Navy base:        #00005B  (--brand-navy-600)
 * - Navy oscuro:      #000027  (--brand-navy-900)
 * - Naranja base:     #EE6B03  (--brand-orange-500)
 *
 * OJO: los datos vienen del formulario público, así que TODO valor dinámico pasa
 * por `escapeHtml()` antes de entrar al HTML. Sin eso, un nombre con `<` o `"`
 * rompe la maqueta, y uno malicioso podría inyectar marcado en la bandeja de
 * quien lo abra.
 */

export type NuevaSolicitudEmailData = {
  numeroSolicitud: string;
  tipoSolicitud: string;
  tipoCliente: string;
  nombreSolicitante: string;
  /** Solo viene en persona jurídica; en persona natural es null. */
  nombreEmpresa: string | null;
  emailSolicitante: string;
  rucSolicitante: string;
  numeroCotizacion?: string;
  adjuntos: string[];
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

// Etiquetas legibles: la BD guarda claves ("nueva", "solicitudFirmada"), el correo
// tiene que leerse en español para quien lo recibe.
const TIPO_SOLICITUD_LABEL: Record<string, string> = {
  nueva: "Nueva solicitud de crédito",
  apertura: "Apertura de línea de crédito",
};

const TIPO_CLIENTE_LABEL: Record<string, string> = {
  natural: "Persona natural",
  juridica: "Persona jurídica",
};

const ADJUNTO_LABEL: Record<string, string> = {
  solicitudFirmada: "Solicitud firmada",
  cedula: "Cédula",
  ruc: "RUC",
  certBancario: "Certificado bancario",
  refsComerciales: "Referencias comerciales",
  nombramiento: "Nombramiento",
  ordenCompra: "Orden de compra",
};

const label = (dict: Record<string, string>, key: string) => dict[key] ?? key;

/** Una fila de la tabla de datos: etiqueta a la izquierda, valor a la derecha. */
function row(labelText: string, value: string, isLast = false) {
  const border = isLast ? "" : "border-bottom: 1px solid #F2F4F6;";
  return `
    <tr>
      <td style="padding: 12px 0; ${border} color: #64748B; font-size: 14px; line-height: 1.5; white-space: nowrap; vertical-align: top;">
        ${escapeHtml(labelText)}
      </td>
      <td style="padding: 12px 0 12px 16px; ${border} color: #0F172A; font-size: 14px; line-height: 1.5; font-weight: 600; text-align: right; word-break: break-word;">
        ${escapeHtml(value)}
      </td>
    </tr>`;
}

export function renderNuevaSolicitudEmail(data: NuevaSolicitudEmailData) {
  const adjuntosHtml = data.adjuntos.length
    ? data.adjuntos
        .map(
          (key) => `
          <tr>
            <td style="padding: 6px 0; color: #334155; font-size: 14px; line-height: 1.5;">
              &#8226;&nbsp;&nbsp;${escapeHtml(label(ADJUNTO_LABEL, key))}
            </td>
          </tr>`
        )
        .join("")
    : `<tr>
         <td style="padding: 6px 0; color: #64748B; font-size: 14px; line-height: 1.5;">
           Sin documentos adjuntos.
         </td>
       </tr>`;

  // Filas que solo existen según el caso: empresa (jurídica) y cotización (nueva).
  const empresaRow = data.nombreEmpresa ? row("Empresa", data.nombreEmpresa) : "";
  const cotizacionRow = data.numeroCotizacion
    ? row("Cotización", data.numeroCotizacion)
    : "";

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nueva solicitud de crédito | INDUCOM</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: Arial, Helvetica, sans-serif; color: #0F172A;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #F8FAFC;">
    <tr>
      <td align="center" style="padding: 40px 16px;">

        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #FFFFFF; border: 1px solid #F2F4F6; border-radius: 12px; overflow: hidden; box-shadow: 0 12px 32px rgba(0, 0, 91, 0.12);">

          <!-- Encabezado -->
          <tr>
            <td align="center" style="padding: 28px 32px; background-color: #00005B; border-bottom: 4px solid #EE6B03;">
              <div style="margin: 0; color: #FFFFFF; font-size: 28px; line-height: 1.2; font-weight: 700; letter-spacing: 1px;">
                INDUCOM
              </div>
              <div style="margin-top: 6px; color: #DDE2FF; font-size: 13px; line-height: 1.5;">
                Portal de Clientes
              </div>
            </td>
          </tr>

          <!-- Contenido -->
          <tr>
            <td style="padding: 40px 40px 24px;">

              <h1 style="margin: 0 0 20px; color: #000027; font-size: 26px; line-height: 1.3; font-weight: 700; text-align: center;">
                Nueva solicitud de crédito
              </h1>

              <p style="margin: 0 0 28px; color: #475569; font-size: 16px; line-height: 1.6; text-align: center;">
                Se recibió una solicitud a través del portal. Estos son los datos enviados por el cliente.
              </p>

              <!-- Folio destacado -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #F5F7FA; border: 1px solid #F2F4F6; border-radius: 8px;">
                <tr>
                  <td align="center" style="padding: 18px;">
                    <div style="margin: 0 0 4px; color: #64748B; font-size: 12px; line-height: 1.5; letter-spacing: 1px; text-transform: uppercase;">
                      Folio
                    </div>
                    <div style="margin: 0; color: #00005B; font-size: 22px; line-height: 1.3; font-weight: 700; letter-spacing: 1px;">
                      ${escapeHtml(data.numeroSolicitud)}
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Datos del solicitante -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top: 28px;">
                ${row("Tipo de solicitud", label(TIPO_SOLICITUD_LABEL, data.tipoSolicitud))}
                ${row("Tipo de cliente", label(TIPO_CLIENTE_LABEL, data.tipoCliente))}
                ${row("Solicitante", data.nombreSolicitante)}
                ${empresaRow}
                ${row("Correo", data.emailSolicitante)}
                ${row("RUC", data.rucSolicitante)}
                ${cotizacionRow}
              </table>

              <!-- Documentos recibidos -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top: 28px; background-color: #FFF4E8; border: 1px solid #FFC789; border-radius: 8px;">
                <tr>
                  <td style="padding: 16px 18px;">
                    <p style="margin: 0 0 8px; color: #6B2D08; font-size: 14px; line-height: 1.6; font-weight: 700;">
                      Documentos recibidos (${data.adjuntos.length})
                    </p>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      ${adjuntosHtml}
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin: 26px 0 0; color: #64748B; font-size: 13px; line-height: 1.6; text-align: center;">
                Los documentos están en el bucket privado de Supabase. Revisa la solicitud completa
                desde el panel para descargarlos y cambiar su estado.
              </p>

            </td>
          </tr>

          <!-- Pie -->
          <tr>
            <td align="center" style="padding: 24px 32px; background-color: #F5F7FA; border-top: 1px solid #F2F4F6;">
              <p style="margin: 0 0 6px; color: #334155; font-size: 13px; line-height: 1.5; font-weight: 600;">
                Grupo INDUCOM
              </p>
              <p style="margin: 0; color: #64748B; font-size: 12px; line-height: 1.5;">
                Este es un mensaje automático. Por favor, no respondas a este correo.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;

  // Versión de texto plano: algunos clientes la usan como preview, y evita que el
  // correo se marque como spam por venir solo en HTML.
  const text = [
    `Nueva solicitud de crédito — ${data.numeroSolicitud}`,
    "",
    `Tipo de solicitud: ${label(TIPO_SOLICITUD_LABEL, data.tipoSolicitud)}`,
    `Tipo de cliente: ${label(TIPO_CLIENTE_LABEL, data.tipoCliente)}`,
    `Solicitante: ${data.nombreSolicitante}`,
    ...(data.nombreEmpresa ? [`Empresa: ${data.nombreEmpresa}`] : []),
    `Correo: ${data.emailSolicitante}`,
    `RUC: ${data.rucSolicitante}`,
    ...(data.numeroCotizacion ? [`Cotización: ${data.numeroCotizacion}`] : []),
    "",
    `Documentos recibidos (${data.adjuntos.length}):`,
    ...(data.adjuntos.length
      ? data.adjuntos.map((key) => `- ${label(ADJUNTO_LABEL, key)}`)
      : ["- Sin documentos adjuntos."]),
  ].join("\n");

  return { html, text };
}
