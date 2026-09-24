import { IconArrowRight, IconShieldCheck } from "@tabler/icons-react";
import { Card, IconTile } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/LinkButton";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { faltanteProximoUmbral, progresoCiclo } from "@/lib/portal/beneficios";
import { formatMonto } from "@/lib/portal/format";
import { routes } from "@/lib/config/site";
import type { PortalCicloGarantia } from "@/lib/portal/types";

/** Tarjeta de garantía extendida en el módulo PayPal: resumen del ciclo y
 *  puerta de entrada a la pantalla completa. */
export function GarantiaResumenCard({ ciclo }: { ciclo: PortalCicloGarantia }) {
  const progreso = progresoCiclo(ciclo.acumulado);
  const proximo = faltanteProximoUmbral(
    ciclo.acumulado,
    ciclo.umbral5kDesbloqueado,
    ciclo.umbral10kDesbloqueado
  );

  return (
    <Card shadow className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <IconTile variant="highlight" shape="circle">
          <IconShieldCheck size={22} stroke={1.75} />
        </IconTile>
        <div>
          <p className="font-mono text-xs font-semibold tracking-[0.06em] text-[var(--text-secondary)] uppercase">
            Garantía extendida
          </p>
          <p className="text-sm text-[var(--text-secondary)]">Compras acumuladas (PayPal)</p>
          <p className="font-display text-3xl font-semibold tabular-nums text-[var(--text-primary)]">
            {formatMonto(ciclo.acumulado)}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-xs text-[var(--text-secondary)]">Ciclo {ciclo.numero}</span>
          <span className="text-sm tabular-nums text-[var(--text-secondary)]">{progreso}%</span>
        </div>
        <ProgressBar value={progreso} label="Progreso del ciclo de garantía" />
      </div>

      <p className="text-sm text-[var(--text-secondary)]">
        {proximo ? (
          <>
            Te faltan{" "}
            <span className="font-semibold tabular-nums text-[var(--text-primary)]">
              {formatMonto(proximo.faltante)}
            </span>{" "}
            para sumar {proximo.meses} meses de garantía.
          </>
        ) : (
          "Completaste los beneficios de este ciclo."
        )}
      </p>

      <LinkButton href={routes.garantia} variant="outline" block>
        Ver mi garantía
        <IconArrowRight size={18} stroke={1.75} aria-hidden />
      </LinkButton>
    </Card>
  );
}
