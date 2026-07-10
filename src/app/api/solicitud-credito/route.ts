import "server-only";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { serverEnv } from "@/lib/config/env.server";
import { publicEnv } from "@/lib/config/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * Recibe la solicitud de crédito pública, la revalida en servidor (nunca
 * confiar solo en la validación del navegador) y la guarda directo en
 * Supabase: adjuntos a un bucket privado de Storage, metadata en
 * `documentos_credito`, datos en `solicitudes_credito`, y notificación por Resend.
 *
 * Medidas de seguridad de este endpoint:
 * - Usa `service_role` (createSupabaseAdminClient) solo aquí, en servidor:
 *   es la única forma de escribir en estas tablas/bucket, que no tienen
 *   ninguna política RLS pública.
 * - Honeypot: si el campo trampa viene relleno, se responde éxito falso sin
 *   procesar nada — evita que un bot simple sepa que fue detectado.
 * - Revalidación server-side de los campos y adjuntos que de verdad
 *   importan (identidad, aceptación de condiciones, firma, tipo/tamaño de
 *   archivo) — la del navegador es solo ayuda de UX.
 * - Adjuntos van a un bucket privado, sin URL pública permanente.
 * - Mensajes de error genéricos hacia el cliente: nunca se expone el motivo
 *   interno de un fallo (evita filtrar detalles útiles a un atacante).
 */

const MAX_FILE_SIZE_MB = 10;
const ALLOWED_FILE_TYPES = new Set(["application/pdf", "image/jpeg", "image/png"]);
const REQUISITO_KEYS = ["ruc", "cedulaColor", "nombramientos", "certBancarios", "certComerciales"];
const ADJUNTOS_BUCKET = "documentos-credito";
const MAX_DATA_LENGTH = 250_000;

const emailOk = (v: unknown) => typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const idOk = (v: unknown) => typeof v === "string" && /^\d{10}$|^\d{13}$/.test(v.trim());
const nonEmpty = (v: unknown) => typeof v === "string" && v.trim().length > 0;
const safeFileName = (name: string) => name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100) || "archivo";

function genericError(status: number, message: string) {
  return NextResponse.json({ ok: false, message }, { status });
}

export async function POST(request: Request) {
  if (!publicEnv.supabaseUrl || !serverEnv.supabaseServiceRoleKey) {
    // Configuración incompleta del lado del servidor: no es un error del usuario.
    console.error("NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no configurados.");
    return genericError(500, "No se pudo procesar la solicitud. Intenta más tarde.");
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return genericError(400, "Solicitud inválida.");
  }

  // Honeypot: un humano nunca llena ni ve este campo.
  if (nonEmpty(form.get("website"))) {
    return NextResponse.json({ ok: true, folio: `SOL-${String(Date.now()).slice(-6)}` });
  }

  const rawData = form.get("data");
  if (typeof rawData !== "string" || rawData.length > MAX_DATA_LENGTH) {
    return genericError(400, "Solicitud inválida.");
  }

  let data: Record<string, unknown>;
  try {
    data = JSON.parse(rawData);
  } catch {
    return genericError(400, "Solicitud inválida.");
  }

  const datos = (data.datos ?? {}) as Record<string, unknown>;
  const actividad = (data.actividad ?? {}) as Record<string, unknown>;
  const condiciones = (data.condiciones ?? {}) as Record<string, unknown>;
  const refsBancarias = Array.isArray(data.refsBancarias) ? data.refsBancarias : [];
  const firmas = Array.isArray(data.firmas) ? data.firmas : [];

  const errors: string[] = [];
  if (data.tipoCliente !== "natural" && data.tipoCliente !== "juridica") errors.push("tipoCliente");
  if (!nonEmpty(datos.apellidos)) errors.push("apellidos");
  if (!nonEmpty(datos.nombres)) errors.push("nombres");
  if (!idOk(datos.cedula)) errors.push("cedula");
  if (!emailOk(datos.correo)) errors.push("correo");
  if (!nonEmpty(actividad.nombreEmpresa)) errors.push("nombreEmpresa");
  if (!nonEmpty(actividad.actividadNegocio)) errors.push("actividadNegocio");
  if (!nonEmpty(actividad.direccion)) errors.push("direccion");
  if (!nonEmpty(actividad.ciudad)) errors.push("ciudad");
  if (!nonEmpty(actividad.telefono) && !nonEmpty(actividad.celular)) errors.push("telefono");
  if (data.tipoCliente === "juridica" && !nonEmpty(datos.razonSocial)) errors.push("razonSocial");
  if (data.financiamiento && (data.financiamiento as Record<string, unknown>).tieneCotizacion === "si" &&
      !nonEmpty((data.financiamiento as Record<string, unknown>).numeroCotizacion)) {
    errors.push("numeroCotizacion");
  }
  if (!refsBancarias.some((r) => nonEmpty(r?.institucion) && nonEmpty(r?.noCta))) {
    errors.push("refsBancarias");
  }
  if (!firmas.some((f) => nonEmpty(f?.nombres) && nonEmpty(f?.cargo))) errors.push("firmas");
  if (condiciones.acepta !== true) errors.push("acepta");
  if (!nonEmpty(condiciones.ciudad)) errors.push("ciudadFirma");
  if (!nonEmpty(condiciones.firmaDataUrl)) errors.push("firma");

  if (errors.length > 0) {
    return genericError(400, "Faltan datos requeridos o son inválidos.");
  }

  // Adjuntos: mismo criterio que se le muestra al usuario en el cliente,
  // pero exigido de verdad — el check del navegador es cortesía, no defensa.
  const files: Array<{ key: string; file: File }> = [];
  for (const key of REQUISITO_KEYS) {
    const file = form.get(key);
    if (!(file instanceof File)) continue;
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return genericError(400, `El archivo de "${key}" supera el máximo de ${MAX_FILE_SIZE_MB} MB.`);
    }
    if (!ALLOWED_FILE_TYPES.has(file.type)) {
      return genericError(400, `El archivo de "${key}" tiene un tipo no permitido.`);
    }
    files.push({ key, file });
  }

  const supabase = createSupabaseAdminClient();

  const { data: pais, error: paisError } = await supabase
    .from("paises")
    .select("id")
    .eq("codigo", "EC")
    .single();

  if (paisError || !pais) {
    console.error("No se encontró el catálogo de países o Ecuador:", paisError);
    return genericError(500, "No pudimos procesar tu solicitud. Intenta más tarde.");
  }

  const nombreSolicitante = `${String(datos.nombres).trim()} ${String(datos.apellidos).trim()}`.trim();
  const telefono = nonEmpty(actividad.telefono) ? String(actividad.telefono).trim() : String(actividad.celular).trim();
  const { data: solicitud, error: insertError } = await supabase
    .from("solicitudes_credito")
    .insert({
      nombre_solicitante: nombreSolicitante,
      email_solicitante: String(datos.correo).trim().toLowerCase(),
      telefono_solicitante: telefono,
      identificacion: String(datos.cedula).trim(),
      pais_id: pais.id,
      datos_adicionales: data,
      consentimiento_aceptado: true,
      consentimiento_fecha: new Date().toISOString(),
      nombre_empresa: String(actividad.nombreEmpresa).trim(),
    })
    .select("id")
    .single();

  if (insertError || !solicitud) {
    console.error("Fallo al guardar solicitud en Supabase:", insertError);
    return genericError(502, "No pudimos procesar tu solicitud. Intenta de nuevo en unos minutos.");
  }

  const folio = `SOL-${solicitud.id.slice(0, 8).toUpperCase()}`;
  const uploadedPaths: string[] = [];

  // La solicitud ya existe para obtener un UUID estable. Si falla una subida
  // o la metadata, se eliminan los archivos y la fila creados en este intento.
  const adjuntos: Record<string, string> = {};
  for (const { key, file } of files) {
    const path = `${solicitud.id}/${crypto.randomUUID()}-${key}-${safeFileName(file.name)}`;
    const { error: uploadError } = await supabase.storage
      .from(ADJUNTOS_BUCKET)
      .upload(path, file, { contentType: file.type, upsert: false });

    if (uploadError) {
      console.error(`Fallo al subir adjunto "${key}" de la solicitud ${folio}:`, uploadError);
      await Promise.all(uploadedPaths.map((uploadedPath) => supabase.storage.from(ADJUNTOS_BUCKET).remove([uploadedPath])));
      await supabase.from("solicitudes_credito").delete().eq("id", solicitud.id);
      return genericError(502, "No pudimos procesar tu solicitud. Intenta de nuevo en unos minutos.");
    }
    uploadedPaths.push(path);
    adjuntos[key] = path;
  }

  const documentos = files.map(({ key, file }) => ({
    solicitud_id: solicitud.id,
    storage_path: adjuntos[key],
    nombre_archivo: safeFileName(file.name),
    tipo_mime: file.type,
    tamano_bytes: file.size,
  }));
  const { error: documentosError } = documentos.length
    ? await supabase.from("documentos_credito").insert(documentos)
    : { error: null };

  if (documentosError) {
    console.error(`Fallo al guardar documentos de la solicitud ${folio}:`, documentosError);
    await Promise.all(uploadedPaths.map((uploadedPath) => supabase.storage.from(ADJUNTOS_BUCKET).remove([uploadedPath])));
    await supabase.from("solicitudes_credito").delete().eq("id", solicitud.id);
    return genericError(502, "No pudimos procesar tu solicitud. Intenta de nuevo en unos minutos.");
  }

  // La notificación es informativa: si falla, la solicitud ya quedó
  // guardada, así que no se le muestra un error al cliente por esto.
  if (serverEnv.resendApiKey && serverEnv.internalNotificationEmail) {
    try {
      const resend = new Resend(serverEnv.resendApiKey);
      await resend.emails.send({
        from: "Portal INDUCOM <notificaciones@inducom.com>",
        to: serverEnv.internalNotificationEmail,
        subject: `Nueva solicitud de crédito — ${folio}`,
        text: `Se recibió una nueva solicitud de crédito.\n\nFolio: ${folio}\nTipo de cliente: ${String(data.tipoCliente)}\nNombre: ${String(datos.nombres ?? "")} ${String(datos.apellidos ?? "")}\nCorreo: ${String(datos.correo ?? "")}\nEmpresa: ${String(actividad.nombreEmpresa ?? "")}`,
      });
    } catch (error) {
      console.error(`Fallo al enviar notificación de la solicitud ${folio}:`, error);
    }
  }

  return NextResponse.json({ ok: true, folio });
}
