/**
 * Variables de entorno públicas (NEXT_PUBLIC_*).
 *
 * Estas variables llegan al navegador: nunca poner aquí una key privada
 * (service_role, API keys de servidor). Esas van en `env.server.ts`.
 */
export const publicEnv = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
};
