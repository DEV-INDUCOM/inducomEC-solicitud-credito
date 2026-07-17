import { IconBuilding, IconMail, IconWorld } from "@tabler/icons-react";
import { Card, IconTile } from "@/components/ui/Card";
import type { PortalCliente, PortalPerfil } from "@/lib/portal/types";

export function CompanySummary({ cliente, perfil }: { cliente: PortalCliente; perfil: PortalPerfil }) {
  const rows = [
    { icon: IconBuilding, label: "Cliente", value: cliente.nombre },
    { icon: IconWorld, label: "País", value: cliente.pais ?? "No disponible" },
    { icon: IconMail, label: "Correo", value: perfil.email },
  ];

  return (
    <Card shadow className="flex flex-col gap-4">
      <p className="font-mono text-xs font-semibold tracking-[0.06em] text-[var(--text-secondary)] uppercase">
        Información de la cuenta
      </p>
      <ul className="flex flex-col gap-3">
        {rows.map(({ icon: Icon, label, value }) => (
          <li key={label} className="flex items-center gap-3">
            <IconTile variant="neutral">
              <Icon size={18} stroke={1.75} />
            </IconTile>
            <div className="min-w-0">
              <p className="text-xs text-[var(--text-muted)]">{label}</p>
              <p className="truncate text-sm font-medium text-[var(--text-primary)]">{value}</p>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
