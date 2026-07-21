"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { routes } from "@/lib/config/site";
import { serverEnv } from "@/lib/config/env.server";
import type { EstadoSolicitud, IncentivoTipo, MetodoPago, OrigenPago, TipoCliente } from "./types";

export type ActionResult = { ok: true } | { ok: false; message: string };

const GENERIC_ERROR = "No pudimos completar la acción. Intenta de nuevo en unos minutos.";
const DIAS_VALIDEZ_MAX = 30;

function diasValidezError(dias: number): string | null {
  if (!Number.isFinite(dias) || dias <= 0) return "Los días de validez deben ser un número mayor a 0.";
  if (dias > DIAS_VALIDEZ_MAX) return `Los días de validez no pueden superar ${DIAS_VALIDEZ_MAX}.`;
  return null;
}

export async function obtenerUrlDocumento(storagePath: string): Promise<{ ok: true; url: string } | { ok: false }> {
  const supabase = await createSupabaseServerClient();
  // download: true agrega Content-Disposition: attachment a la URL firmada,
  // así el navegador siempre descarga el archivo en vez de mostrarlo inline
  // (antes abría el PDF/imagen en la pestaña nueva en lugar de bajarlo).
  const { data, error } = await supabase.storage
    .from("documentos-credito")
    .createSignedUrl(storagePath, 60 * 5, { download: true });
  if (error || !data) return { ok: false };
  return { ok: true, url: data.signedUrl };
}

export async function actualizarEstadoSolicitud(
  solicitudId: string,
  nuevoEstado: EstadoSolicitud,
  nota: string
): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("actualizar_estado_solicitud", {
    p_solicitud_id: solicitudId,
    p_nuevo_estado: nuevoEstado,
    p_nota: nota.trim() || null,
  });

  if (error) return { ok: false, message: GENERIC_ERROR };

  revalidatePath(`${routes.adminSolicitudes}/${solicitudId}`);
  revalidatePath(routes.adminSolicitudes);
  revalidatePath(routes.adminResumen);
  return { ok: true };
}

export interface RegistrarPagoInput {
  clienteId: string;
  monto: number;
  fecha: string;
  metodoPago: MetodoPago;
  referencia: string;
}

export async function registrarPago(input: RegistrarPagoInput): Promise<ActionResult> {
  if (!input.clienteId || !(input.monto > 0) || !input.fecha) {
    return { ok: false, message: "Completa los campos obligatorios del pago." };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("pagos").insert({
    cliente_id: input.clienteId,
    monto: input.monto,
    fecha: input.fecha,
    origen: "manual" satisfies OrigenPago,
    metodo_pago: input.metodoPago,
    referencia: input.referencia.trim() || null,
    registrado_por: user?.id ?? null,
  });

  if (error) return { ok: false, message: GENERIC_ERROR };

  revalidatePath(routes.adminPagos);
  revalidatePath(routes.adminResumen);
  revalidatePath(routes.adminEmpresas);
  return { ok: true };
}

export interface GenerarCodigoResult {
  ok: true;
  codigo: string;
  fechaVencimiento: string;
}

export async function generarCodigo(
  clienteId: string,
  diasValidez: number
): Promise<GenerarCodigoResult | { ok: false; message: string }> {
  if (!clienteId) return { ok: false, message: "Selecciona un cliente." };
  const diasError = diasValidezError(diasValidez);
  if (diasError) return { ok: false, message: diasError };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .rpc("generar_codigo_invitacion", { p_cliente_id: clienteId, p_dias_validez: diasValidez })
    .single();

  if (error || !data) return { ok: false, message: GENERIC_ERROR };

  revalidatePath(routes.adminCodigos);
  return {
    ok: true,
    codigo: (data as { codigo_generado: string }).codigo_generado,
    fechaVencimiento: (data as { fecha_vencimiento: string }).fecha_vencimiento,
  };
}

export interface CrearClienteManualInput {
  tipoCliente: TipoCliente;
  paisId: number;
  nombreVisible: string;
  email: string;
  identificacion: string;
  nombres?: string;
  apellidos?: string;
  representanteLegal?: string;
  diasValidez: number;
}

export async function crearClienteManual(
  input: CrearClienteManualInput
): Promise<GenerarCodigoResult | { ok: false; message: string }> {
  if (!input.nombreVisible.trim() || !input.email.trim() || !input.identificacion.trim() || !input.paisId) {
    return { ok: false, message: "Completa los datos obligatorios del cliente." };
  }
  if (input.tipoCliente === "natural" && (!input.nombres?.trim() || !input.apellidos?.trim())) {
    return { ok: false, message: "Ingresa nombres y apellidos." };
  }
  if (input.tipoCliente === "juridica" && !input.representanteLegal?.trim()) {
    return { ok: false, message: "Ingresa el representante legal." };
  }
  const diasError = diasValidezError(input.diasValidez);
  if (diasError) return { ok: false, message: diasError };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .rpc("crear_cliente_manual", {
      p_tipo_cliente: input.tipoCliente,
      p_pais_id: input.paisId,
      p_nombre_visible: input.nombreVisible,
      p_email: input.email,
      p_identificacion: input.identificacion,
      p_nombres: input.nombres ?? null,
      p_apellidos: input.apellidos ?? null,
      p_representante_legal: input.representanteLegal ?? null,
      p_dias_validez: input.diasValidez,
    })
    .single();

  if (error || !data) return { ok: false, message: GENERIC_ERROR };

  revalidatePath(routes.adminCodigos);
  revalidatePath(routes.adminEmpresas);
  revalidatePath(routes.adminResumen);
  return {
    ok: true,
    codigo: (data as { resultado_codigo: string }).resultado_codigo,
    fechaVencimiento: (data as { resultado_fecha_vencimiento: string }).resultado_fecha_vencimiento,
  };
}

/**
 * Asigna, cambia o quita el incentivo de un cliente. `incentivos_cliente`
 * tiene `cliente_id` como primary key (un incentivo activo por cliente), así
 * que "cambiar" es upsert y "quitar" es borrar la fila — no hay estado
 * intermedio ambiguo. Las policies de RLS ("personal interno asigna/actualiza
 * incentivos", ver 20260717000000_panel_admin.sql) ya cubren esto directo,
 * sin necesitar un RPC dedicado.
 */
export async function asignarIncentivo(clienteId: string, tipo: IncentivoTipo | null): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient();

  const { error } = tipo
    ? await supabase.from("incentivos_cliente").upsert({ cliente_id: clienteId, tipo }, { onConflict: "cliente_id" })
    : await supabase.from("incentivos_cliente").delete().eq("cliente_id", clienteId);

  if (error) return { ok: false, message: GENERIC_ERROR };

  revalidatePath(`${routes.adminEmpresas}/${clienteId}`);
  revalidatePath(routes.adminEmpresas);
  revalidatePath(routes.adminResumen);
  return { ok: true };
}

/**
 * Envía por correo un código ya generado, reusando el webhook de n8n que
 * arma y manda el correo de "nueva solicitud" (ver src/app/api/solicitud-credito/route.ts).
 * Del lado de n8n hace falta un Switch que lea `tipo: "codigo_invitacion"` y
 * bifurque a la plantilla del código — nada de eso se toca desde acá.
 *
 * Recibe el código (no el id): es el único dato que ya tienen tanto el modal
 * de generación como la tabla de códigos, sin necesitar tocar los RPC de
 * generación para que devuelvan el id.
 */
export async function enviarCorreoCodigo(codigo: string): Promise<ActionResult> {
  if (!serverEnv.n8nWebhookUrl) {
    return { ok: false, message: "El envío de correo no está configurado." };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("codigos_invitacion")
    .select("codigo, fecha_vencimiento, clientes(nombre_visible, email)")
    .eq("codigo", codigo)
    .maybeSingle();

  if (error || !data) return { ok: false, message: GENERIC_ERROR };

  const clienteRel = data.clientes as unknown as { nombre_visible: string; email: string } | { nombre_visible: string; email: string }[] | null;
  const cliente = Array.isArray(clienteRel) ? clienteRel[0] : clienteRel;
  if (!cliente?.email) return { ok: false, message: GENERIC_ERROR };

  try {
    const response = await fetch(serverEnv.n8nWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tipo: "codigo_invitacion",
        clienteNombre: cliente.nombre_visible,
        clienteEmail: cliente.email,
        codigo: data.codigo,
        fechaVencimiento: data.fecha_vencimiento,
      }),
    });
    if (!response.ok) return { ok: false, message: GENERIC_ERROR };
  } catch (error) {
    console.error("Fallo al notificar a n8n el envío de código:", error);
    return { ok: false, message: GENERIC_ERROR };
  }

  return { ok: true };
}
