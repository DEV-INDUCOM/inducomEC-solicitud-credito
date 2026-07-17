"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { routes } from "@/lib/config/site";
import type { EstadoSolicitud, MetodoPago, OrigenPago } from "./types";

export type ActionResult = { ok: true } | { ok: false; message: string };

const GENERIC_ERROR = "No pudimos completar la acción. Intenta de nuevo en unos minutos.";

export async function obtenerUrlDocumento(storagePath: string): Promise<{ ok: true; url: string } | { ok: false }> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.storage.from("documentos-credito").createSignedUrl(storagePath, 60 * 5);
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
  if (!clienteId) return { ok: false, message: "Selecciona una empresa." };

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
