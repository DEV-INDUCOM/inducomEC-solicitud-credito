import "server-only";
import { createClient } from "@supabase/supabase-js";
import { publicEnv } from "@/lib/config/env";
import { serverEnv } from "@/lib/config/env.server";

/**
 * Cliente Supabase con `service_role`: BYPASSEA Row Level Security por
 * completo. Regla absoluta del proyecto (ver consideraciones-tecnicas):
 * esta llave vive solo en el servidor, nunca llega al navegador, nunca se
 * sube al repositorio.
 *
 * Úsalo exclusivamente en el paso servidor de operaciones que por diseño
 * deben cruzar RLS (ej. validar y consumir un código de invitación de un
 * solo uso de forma atómica). No lo importes desde código que atienda
 * lecturas normales de usuario: para eso usa `server.ts` o `client.ts`.
 *
 * Stub: no hay proyecto Supabase conectado todavía.
 */
export function createSupabaseAdminClient() {
  return createClient(publicEnv.supabaseUrl, serverEnv.supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
