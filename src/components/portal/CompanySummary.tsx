import { IconBuilding, IconMail, IconWorld } from "@tabler/icons-react";
import { Card, IconTile } from "@/components/ui/Card";
import type { PortalCliente, PortalPerfil } from "@/lib/portal/types";

/** Única tarjeta del dashboard con el título ADENTRO (decisión del v2): es
 *  una ficha autocontenida, no una sección de datos con su propio módulo. */
export function CompanySummary({ cliente, perfil }: { cliente: PortalCliente; perfil: PortalPerfil }) {
  const rows = [
    { icon: IconBuilding, label: "Cliente", value: cliente.nombre },
    { icon: IconWorld, label: "País", value: cliente.pais ?? "No disponible" },
    { icon: IconMail, label: "Correo", value: perfil.email },
  ];

  return (
    <Card className="flex flex-col gap-5">
      <h2 className="text-lg font-semibold text-[var(--text-primary)]">Información de la cuenta</h2>
      <ul className="flex flex-col gap-4">
        {rows.map(({ icon: Icon, label, value }) => (
          <li key={label} className="flex items-center gap-4">
            <IconTile variant="neutral">
              <Icon size={20} stroke={1.75} />
            </IconTile>
            <div className="min-w-0">
              <p className="text-sm text-[var(--text-secondary)]">{label}</p>
              <p className="truncate text-base font-medium text-[var(--text-primary)]">{value}</p>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
