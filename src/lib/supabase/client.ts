"use client";

import { createBrowserClient } from "@supabase/ssr";
import { publicEnv } from "@/lib/config/env";

/**
 * Cliente Supabase para componentes cliente ("use client").
 * Usa únicamente la anon key: respeta RLS, nunca bypassea seguridad.
 *
 * `cookieName` (opcional): usar ADMIN_AUTH_COOKIE_NAME (cookie-config.ts)
 * en el panel admin, para que su sesión no comparta cookie con el portal
 * del cliente en el mismo navegador. Sin esto, el portal sigue con el
 * nombre de cookie default de Supabase (no romper sesiones existentes).
 */
export function createSupabaseBrowserClient(options?: { cookieName?: string }) {
  return createBrowserClient(
    publicEnv.supabaseUrl,
    publicEnv.supabaseAnonKey,
    options?.cookieName ? { cookieOptions: { name: options.cookieName } } : undefined
  );
}
