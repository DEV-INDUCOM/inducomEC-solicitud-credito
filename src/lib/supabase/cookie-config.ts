/**
 * `/admin` y `/portal` corren en el mismo dominio y comparten proyecto de
 * Supabase; sin esto, ambos usan el mismo nombre de cookie de sesión por
 * defecto y solo puede existir UNA sesión activa por navegador — iniciar
 * sesión en uno cierra "mágicamente" al otro (reportado en producción:
 * un admin con /admin y el /portal de un cliente abiertos a la vez).
 *
 * Pasar `{ cookieOptions: { name: ADMIN_AUTH_COOKIE_NAME } }` a
 * createSupabaseBrowserClient/ServerClient le da a /admin su propia cookie
 * de sesión, independiente de la del portal (que sigue usando el nombre
 * default de Supabase, para no invalidar sesiones de clientes ya activas).
 */
export const ADMIN_AUTH_COOKIE_NAME = "sb-admin-auth-token";
