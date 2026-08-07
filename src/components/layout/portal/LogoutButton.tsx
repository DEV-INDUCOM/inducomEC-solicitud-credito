"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { routes } from "@/lib/config/site";

export function LogoutButton({
  redirectTo = routes.login,
  cookieName,
}: {
  redirectTo?: string;
  /** Pasar ADMIN_AUTH_COOKIE_NAME cuando se usa dentro del panel admin, para
   *  cerrar la sesión de la cookie correcta (ver cookie-config.ts). */
  cookieName?: string;
}) {
  const router = useRouter();

  async function logout() {
    await createSupabaseBrowserClient({ cookieName }).auth.signOut();
    router.replace(redirectTo);
    router.refresh();
  }

  return (
    <Button variant="outline" size="sm" onClick={() => void logout()}>
      Cerrar sesión
    </Button>
  );
}
