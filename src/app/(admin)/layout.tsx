import { redirect } from "next/navigation";
import { IconUserOff } from "@tabler/icons-react";
import { AdminShell } from "@/components/layout/admin/AdminShell";
import { LogoutButton } from "@/components/layout/portal/LogoutButton";
import { IconTile } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { getAdminContext } from "@/lib/admin/queries";
import { routes } from "@/lib/config/site";

export default async function AdminGroupLayout({ children }: { children: React.ReactNode }) {
  const context = await getAdminContext();

  if (!context.ok && context.reason === "sin-sesion") {
    redirect(routes.adminLogin);
  }

  // El middleware (proxy.ts) ya filtra sin-sesión / sin personal_interno
  // activo antes de llegar aquí; esto es defensa en profundidad (sesión que
  // expira en el medio, cuenta desactivada) para no mostrar un error crudo.
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
            title="Tu cuenta no tiene acceso al panel"
            description="Tu sesión es válida, pero no está asociada a una cuenta de personal interno activa."
            action={<LogoutButton redirectTo={routes.adminLogin} />}
          />
        </div>
      </div>
    );
  }

  if (!context.ok) {
    return (
      <div data-surface="portal" className="flex min-h-screen items-center justify-center bg-[var(--bg-page)] px-4">
        <div className="w-full max-w-md">
          <ErrorState action={<LogoutButton redirectTo={routes.adminLogin} />} />
        </div>
      </div>
    );
  }

  return (
    <div data-surface="portal">
      <AdminShell adminNombre={context.data.nombre}>{children}</AdminShell>
    </div>
  );
}
