import "server-only";
import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { IncentivoTipo, PortalContext, PortalPago } from "./types";

export type PortalContextResult =
  | { ok: true; data: PortalContext }
  | { ok: false; reason: "sin-sesion" | "sin-perfil" | "cliente-inactivo" | "error" };

/**
 * Perfil + cliente (persona natural o jurídica) del usuario autenticado. El
 * middleware (proxy.ts) ya filtra "sin sesión" / "sin perfil" antes de llegar
 * aquí, pero el layout del portal vuelve a resolverlo (defensa en profundidad:
 * sesión que expira en el medio, perfil eliminado) para poder mostrar un
 * estado propio en vez de asumir que siempre hay datos. `cache()` deduplica
 * la consulta cuando el layout y la página piden el contexto en el mismo
 * request.
 */
export const getPortalContext = cache(async (): Promise<PortalContextResult> => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, reason: "sin-sesion" };

  const { data: perfil, error: perfilError } = await supabase
    .from("perfiles")
    .select("id, email, cliente_id")
    .eq("id", user.id)
    .maybeSingle();
  if (perfilError) return { ok: false, reason: "error" };
  if (!perfil) return { ok: false, reason: "sin-perfil" };

  // `nombre_visible` vive en `clientes` (no hace falta unir con el subtipo
  // personas_naturales/empresas): es el mismo nombre para ambos tipos hoy.
  const { data: clienteRaw, error: clienteError } = await supabase
    .from("clientes")
    .select("id, nombre_visible, activo, paises(nombre)")
    .eq("id", perfil.cliente_id)
    .maybeSingle();
  if (clienteError) return { ok: false, reason: "error" };
  if (!clienteRaw) return { ok: false, reason: "sin-perfil" };

  // El cliente Supabase no está tipado con un schema generado; el embed
  // `paises(nombre)` se tipa a mano acá en vez de confiar en la inferencia.
  const cliente = clienteRaw as unknown as {
    id: string;
    nombre_visible: string;
    activo: boolean;
    paises: { nombre: string } | { nombre: string }[] | null;
  };

  // Cliente desactivado por INDUCOM: la sesión sigue siendo válida, pero no
  // debe poder usar el portal. Se corta acá, no ocultando botones en la UI.
  if (!cliente.activo) return { ok: false, reason: "cliente-inactivo" };

  const pais = Array.isArray(cliente.paises) ? cliente.paises[0]?.nombre : cliente.paises?.nombre;

  // Sin fila en incentivos_cliente = sin incentivo asignado (no es un error).
  const { data: incentivo, error: incentivoError } = await supabase
    .from("incentivos_cliente")
    .select("tipo")
    .eq("cliente_id", cliente.id)
    .maybeSingle();
  if (incentivoError) return { ok: false, reason: "error" };

  return {
    ok: true,
    data: {
      perfil: { id: perfil.id, email: perfil.email, clienteId: perfil.cliente_id },
      cliente: {
        id: cliente.id,
        nombre: cliente.nombre_visible,
        pais: pais ?? null,
        incentivoActivo: (incentivo?.tipo as IncentivoTipo | null) ?? null,
      },
    },
  };
});

export async function getSaldo(clienteId: string): Promise<{ ok: true; saldo: number } | { ok: false }> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("saldo_por_cliente")
    .select("saldo")
    .eq("cliente_id", clienteId)
    .maybeSingle();
  if (error) return { ok: false };
  return { ok: true, saldo: Number(data?.saldo ?? 0) };
}

export async function getPagos(
  clienteId: string,
  limit?: number
): Promise<{ ok: true; pagos: PortalPago[] } | { ok: false }> {
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("pagos")
    .select("id, monto, fecha, origen, referencia, created_at")
    .eq("cliente_id", clienteId)
    .order("fecha", { ascending: false });
  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error || !data) return { ok: false };

  return {
    ok: true,
    pagos: data.map((pago) => ({
      id: pago.id,
      monto: Number(pago.monto),
      fecha: pago.fecha,
      origen: pago.origen as "manual" | "csv",
      referencia: pago.referencia,
      creadoEn: pago.created_at,
    })),
  };
}
