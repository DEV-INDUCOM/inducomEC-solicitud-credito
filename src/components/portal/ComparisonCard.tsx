import { IconCheck } from "@tabler/icons-react";
import { Card, IconTile } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils/cn";
import { incentivoCatalogo, incentivoOrden } from "@/lib/portal/incentivos";
import type { IncentivoTipo } from "@/lib/portal/types";

function ComparisonCard({ tipo, activo }: { tipo: IncentivoTipo; activo: boolean }) {
  const info = incentivoCatalogo[tipo];
  const Icon = info.icon;

  return (
    <Card
      shadow={activo}
      className={cn(
        "flex flex-col gap-3",
        activo && "border-[color:var(--action-primary)] ring-1 ring-[color:var(--action-primary)]"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <IconTile variant={activo ? "accent" : "neutral"}>
          <Icon size={20} stroke={1.75} />
        </IconTile>
        {activo && (
          <StatusBadge tone="success" icon={<IconCheck size={14} stroke={2} aria-hidden />}>
            Activo
          </StatusBadge>
        )}
      </div>
      <p className="text-base font-semibold text-[var(--text-primary)]">{info.titulo}</p>
      <p className="text-sm text-[var(--text-secondary)] leading-normal">{info.descripcion}</p>
    </Card>
  );
}

export function IncentiveComparison({ activo }: { activo: IncentivoTipo | null }) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
      {incentivoOrden.map((tipo) => (
        <ComparisonCard key={tipo} tipo={tipo} activo={tipo === activo} />
      ))}
    </div>
  );
}
