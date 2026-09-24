import type { ReactNode } from "react";
import Link from "next/link";
import { IconArrowRight } from "@tabler/icons-react";
import { Card, IconTile, type IconTileVariant } from "@/components/ui/Card";
import { StatusBadge, type StatusTone } from "@/components/ui/StatusBadge";

/** Tarjeta de resumen de un beneficio para el dashboard: solo el estado
 *  general y un enlace al módulo. El detalle (progreso, umbrales, historial)
 *  vive en su propia pantalla; acá se duplicaría. */
export function ResumenBeneficioCard({
  titulo,
  icono,
  iconoVariante = "highlight",
  valor,
  estado,
  detalle,
  extra,
  ctaHref,
  ctaLabel,
}: {
  titulo: string;
  icono: ReactNode;
  /** v2: azul para métricas (cashback), naranja `accent` para logros (garantía). */
  iconoVariante?: IconTileVariant;
  valor: ReactNode;
  estado?: { tone: StatusTone; label: string };
  detalle?: string;
  /** Bloque opcional bajo el valor (ej. el último beneficio obtenido). */
  extra?: ReactNode;
  ctaHref: string;
  ctaLabel: string;
}) {
  return (
    // v2: el ícono va a la izquierda como columna propia y el contenido
    // (eyebrow, valor, detalle, enlace) se alinea a su derecha.
    <Card className="flex gap-5">
      <IconTile variant={iconoVariante} shape="circle">
        {icono}
      </IconTile>

      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-start justify-between gap-3">
            <p className="pt-1 font-mono text-xs font-semibold tracking-[0.06em] text-[var(--text-secondary)] uppercase">
              {titulo}
            </p>
            {estado && <StatusBadge tone={estado.tone}>{estado.label}</StatusBadge>}
          </div>
          {valor}
          {detalle && <p className="text-sm text-[var(--text-secondary)]">{detalle}</p>}
        </div>

        {extra}

        <Link
          href={ctaHref}
          className="mt-auto inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-[var(--link)] hover:text-[var(--link-hover)] focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]"
        >
          {ctaLabel}
          <IconArrowRight size={16} stroke={1.75} aria-hidden />
        </Link>
      </div>
    </Card>
  );
}
