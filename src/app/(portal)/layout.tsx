import { redirect } from "next/navigation";
import { IconUserOff } from "@tabler/icons-react";
import { PortalShell } from "@/components/layout/portal/PortalShell";
import { LogoutButton } from "@/components/layout/portal/LogoutButton";
import { IconTile } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { getPortalContext } from "@/lib/portal/queries";
import { routes } from "@/lib/config/site";

export default async function PortalGroupLayout({ children }: { children: React.ReactNode }) {
  const context = await getPortalContext();

  if (!context.ok && context.reason === "sin-sesion") {
    redirect(routes.login);
  }

  // Estos dos casos no deberían pasar (proxy.ts ya filtra antes de llegar
  // aquí), pero se contemplan como defensa en profundidad en vez de dejar
  // que el portal reviente con un error crudo.
  if (!context.ok && context.reason === "sin-perfil") {
    return (
      <div data-surface="portal" className="flex min-h-screen items-center justify-center bg-[var(--bg-page)] px-4">
        <div className="w-full max-w-md">
          <EmptyState
            icon={
              <IconTile variant="accent">
                <IconUserOff size={20} stroke={1.75} />
              </IconTile>
            }
            title="Tu cuenta no tiene acceso al portal"
            description="Tu sesión es válida, pero no está asociada a ninguna empresa. Contacta a INDUCOM para resolverlo."
            action={<LogoutButton />}
          />
        </div>
      </div>
    );
  }

  if (!context.ok) {
    return (
      <div data-surface="portal" className="flex min-h-screen items-center justify-center bg-[var(--bg-page)] px-4">
        <div className="w-full max-w-md">
          <ErrorState action={<LogoutButton />} />
        </div>
      </div>
    );
  }

  return (
    <div data-surface="portal">
      <PortalShell empresaNombre={context.data.empresa.nombre}>{children}</PortalShell>
    </div>
  );
}
