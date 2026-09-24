import type { ReactNode } from "react";
import Link from "next/link";
import { IconArrowRight } from "@tabler/icons-react";
import { Card, IconTile } from "@/components/ui/Card";
import { StatusBadge, type StatusTone } from "@/components/ui/StatusBadge";

/** Tarjeta de resumen de un beneficio para el dashboard: solo el estado
 *  general y un enlace al módulo. El detalle (progreso, umbrales, historial)
 *  vive en su propia pantalla; acá se duplicaría. */
export function ResumenBeneficioCard({
  titulo,
  icono,
  valor,
  estado,
  detalle,
  ctaHref,
  ctaLabel,
}: {
  titulo: string;
  icono: ReactNode;
  valor: ReactNode;
  estado?: { tone: StatusTone; label: string };
  detalle?: string;
  ctaHref: string;
  ctaLabel: string;
}) {
  return (
    <Card shadow className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <IconTile variant="neutral" shape="circle">
            {icono}
          </IconTile>
          <p className="font-mono text-xs font-semibold tracking-[0.06em] text-[var(--text-secondary)] uppercase">
            {titulo}
          </p>
        </div>
        {estado && <StatusBadge tone={estado.tone}>{estado.label}</StatusBadge>}
      </div>

      <div className="flex flex-col gap-1">
        {valor}
        {detalle && <p className="text-sm text-[var(--text-secondary)]">{detalle}</p>}
      </div>

      <Link
        href={ctaHref}
        className="mt-auto inline-flex w-fit items-center gap-1.5 text-sm font-medium text-[var(--action-primary)] hover:text-[var(--link-hover)] focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]"
      >
        {ctaLabel}
        <IconArrowRight size={16} stroke={1.75} aria-hidden />
      </Link>
    </Card>
  );
}
