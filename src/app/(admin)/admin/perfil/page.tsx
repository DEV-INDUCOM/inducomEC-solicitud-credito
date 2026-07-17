import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { IconMail, IconShieldCheck, IconUserCircle } from "@tabler/icons-react";
import { Card, IconTile } from "@/components/ui/Card";
import { LogoutButton } from "@/components/layout/portal/LogoutButton";
import { getAdminContext } from "@/lib/admin/queries";
import { routes } from "@/lib/config/site";

export const metadata: Metadata = { title: "Perfil" };

export default async function AdminPerfilPage() {
  const context = await getAdminContext();
  if (!context.ok) redirect(routes.adminLogin);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl">Perfil</h1>
        <p className="mt-2 text-[var(--text-secondary)]">Datos de tu cuenta de personal interno.</p>
      </div>

      <Card shadow className="flex max-w-lg flex-col gap-4">
        <div className="flex items-center gap-4">
          <IconTile shape="circle">
            <IconUserCircle size={24} stroke={1.75} />
          </IconTile>
          <div>
            <p className="text-lg font-semibold text-[var(--text-primary)]">{context.data.nombre}</p>
            <p className="text-sm text-[var(--text-secondary)]">Administrador</p>
          </div>
        </div>

        <ul className="flex flex-col divide-y divide-[color:var(--border)]">
          <li className="flex items-center gap-3 py-3">
            <IconMail size={18} stroke={1.75} className="text-[var(--text-muted)]" />
            <div>
              <p className="text-xs text-[var(--text-muted)]">Correo electrónico</p>
              <p className="text-sm font-medium text-[var(--text-primary)]">{context.data.email}</p>
            </div>
          </li>
          <li className="flex items-center gap-3 py-3">
            <IconShieldCheck size={18} stroke={1.75} className="text-[var(--text-muted)]" />
            <div>
              <p className="text-xs text-[var(--text-muted)]">Acceso</p>
              <p className="text-sm font-medium text-[var(--text-primary)]">Panel administrativo INDUCOM</p>
            </div>
          </li>
        </ul>

        <LogoutButton redirectTo={routes.adminLogin} />
      </Card>
    </div>
  );
}
