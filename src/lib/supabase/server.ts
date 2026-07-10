import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { publicEnv } from "@/lib/config/env";

/**
 * Cliente Supabase para Server Components, Route Handlers y Server Actions.
 * Usa la anon key + cookies de sesión: respeta RLS igual que el cliente de
 * navegador. Este es el cliente que deben usar login, registro y cualquier
 * lectura/escritura autenticada en el servidor.
 *
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Se llama desde un Server Component: el middleware ya refresca
          // la sesión, así que un fallo aquí al escribir cookies es inofensivo.
        }
      },
    },
  });
}
