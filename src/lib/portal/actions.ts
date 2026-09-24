"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { routes } from "@/lib/config/site";

/** Marca como vista la garantía recién desbloqueada, para que el modal no
 *  vuelva a aparecer en la siguiente visita. La RPC es la que valida que la
 *  garantía sea del cliente autenticado (ver marcar_garantia_vista); acá no
 *  se confía en el id que llega del navegador. */
export async function marcarGarantiaVista(garantiaId: string): Promise<{ ok: boolean }> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("marcar_garantia_vista", { p_garantia_id: garantiaId });
  if (error) return { ok: false };

  revalidatePath(routes.garantia);
  return { ok: true };
}
