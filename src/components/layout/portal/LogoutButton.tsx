"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { routes } from "@/lib/config/site";

export function LogoutButton() {
  const router = useRouter();

  async function logout() {
    await createSupabaseBrowserClient().auth.signOut();
    router.replace(routes.login);
    router.refresh();
  }

  return (
    <Button variant="outline" size="sm" onClick={() => void logout()}>
      Cerrar sesión
    </Button>
  );
}
