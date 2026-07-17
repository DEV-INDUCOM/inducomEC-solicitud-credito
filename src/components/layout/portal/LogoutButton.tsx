"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { routes } from "@/lib/config/site";

export function LogoutButton({ redirectTo = routes.login }: { redirectTo?: string }) {
  const router = useRouter();

  async function logout() {
    await createSupabaseBrowserClient().auth.signOut();
    router.replace(redirectTo);
    router.refresh();
  }

  return (
    <Button variant="outline" size="sm" onClick={() => void logout()}>
      Cerrar sesión
    </Button>
  );
}
