"use client";

import { createBrowserClient } from "@supabase/ssr";
import { publicEnv } from "@/lib/config/env";

/**
 * Cliente Supabase para componentes cliente ("use client").
 * Usa únicamente la anon key: respeta RLS, nunca bypassea seguridad.
 *
 * Stub: no hay proyecto Supabase conectado todavía. Las variables de
 * entorno están vacías hasta que se configure `.env.local`.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey);
}
