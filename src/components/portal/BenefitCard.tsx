import { IconGift } from "@tabler/icons-react";
import { Card, IconTile } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { incentivoCatalogo } from "@/lib/portal/incentivos";
import type { IncentivoTipo } from "@/lib/portal/types";

export function BenefitCard({ incentivo }: { incentivo: IncentivoTipo | null }) {
  if (!incentivo) {
    return (
      <EmptyState
        icon={
          <IconTile>
            <IconGift size={20} stroke={1.75} />
          </IconTile>
        }
        title="Sin incentivo asignado"
        description="INDUCOM asigna el beneficio activo de tu empresa. Consulta con tu asesor comercial."
      />
    );
  }

  const info = incentivoCatalogo[incentivo];
  const Icon = info.icon;

  return (
    <Card shadow className="flex flex-col gap-3">
      <p className="font-mono text-xs font-semibold tracking-[0.06em] text-[var(--text-secondary)] uppercase">
        Incentivo activo
      </p>
      <div className="flex items-start gap-4">
        <IconTile variant="accent">
          <Icon size={22} stroke={1.75} />
        </IconTile>
        <div>
          <p className="text-lg font-semibold text-[var(--text-primary)]">{info.titulo}</p>
          <p className="mt-1 text-sm text-[var(--text-secondary)] leading-normal">{info.descripcion}</p>
        </div>
      </div>
    </Card>
  );
}
