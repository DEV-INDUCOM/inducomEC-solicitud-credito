import "server-only";
import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { IncentivoTipo, PortalContext, PortalPago } from "./types";

export type PortalContextResult =
  | { ok: true; data: PortalContext }
  | { ok: false; reason: "sin-sesion" | "sin-perfil" | "error" };

/**
 * Perfil + empresa del usuario autenticado. El middleware (proxy.ts) ya
 * filtra "sin sesión" / "sin perfil" antes de llegar aquí, pero el layout del
 * portal vuelve a resolverlo (defensa en profundidad: sesión que expira en
 * el medio, perfil eliminado) para poder mostrar un estado propio en vez de
 * asumir que siempre hay datos. `cache()` deduplica la consulta cuando el
 * layout y la página piden el contexto en el mismo request.
 */
export const getPortalContext = cache(async (): Promise<PortalContextResult> => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, reason: "sin-sesion" };

  const { data: perfil, error: perfilError } = await supabase
    .from("perfiles")
    .select("id, email, empresa_id")
    .eq("id", user.id)
    .maybeSingle();
  if (perfilError) return { ok: false, reason: "error" };
  if (!perfil) return { ok: false, reason: "sin-perfil" };

  const { data: empresaRaw, error: empresaError } = await supabase
    .from("empresas")
    .select("id, nombre, paises(nombre)")
    .eq("id", perfil.empresa_id)
    .maybeSingle();
  if (empresaError) return { ok: false, reason: "error" };
  if (!empresaRaw) return { ok: false, reason: "sin-perfil" };

  // El cliente Supabase no está tipado con un schema generado; el embed
  // `paises(nombre)` se tipa a mano acá en vez de confiar en la inferencia.
  const empresa = empresaRaw as unknown as {
    id: string;
    nombre: string;
    paises: { nombre: string } | { nombre: string }[] | null;
  };

  const pais = Array.isArray(empresa.paises) ? empresa.paises[0]?.nombre : empresa.paises?.nombre;

  // Sin fila en incentivos_empresa = sin incentivo asignado (no es un error).
  const { data: incentivo, error: incentivoError } = await supabase
    .from("incentivos_empresa")
    .select("tipo")
    .eq("empresa_id", empresa.id)
    .maybeSingle();
  if (incentivoError) return { ok: false, reason: "error" };

  return {
    ok: true,
    data: {
      perfil: { id: perfil.id, email: perfil.email, empresaId: perfil.empresa_id },
      empresa: {
        id: empresa.id,
        nombre: empresa.nombre,
        pais: pais ?? null,
        incentivoActivo: (incentivo?.tipo as IncentivoTipo | null) ?? null,
      },
    },
  };
});

export async function getSaldo(empresaId: string): Promise<{ ok: true; saldo: number } | { ok: false }> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("saldo_por_empresa")
    .select("saldo")
    .eq("empresa_id", empresaId)
    .maybeSingle();
  if (error) return { ok: false };
  return { ok: true, saldo: Number(data?.saldo ?? 0) };
}

export async function getPagos(
  empresaId: string,
  limit?: number
): Promise<{ ok: true; pagos: PortalPago[] } | { ok: false }> {
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("pagos")
    .select("id, monto, fecha, origen, referencia, created_at")
    .eq("empresa_id", empresaId)
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
