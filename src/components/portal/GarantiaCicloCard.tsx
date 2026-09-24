import { IconCheck, IconShieldCheck } from "@tabler/icons-react";
import { Card, IconTile } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils/cn";
import { UMBRAL_10K, UMBRAL_5K, faltanteProximoUmbral, progresoCiclo } from "@/lib/portal/beneficios";
import { formatMonto } from "@/lib/portal/format";
import type { PortalCicloGarantia } from "@/lib/portal/types";

/** Marca de umbral sobre la pista. Los dos hitos caen siempre en 50% y 100%
 *  porque la escala de la barra es fija: 0 → USD 10.000.
 *  El de 100% se ancla a la derecha (no centrado en el punto) para que no se
 *  salga de la tarjeta. */
function HitoPunto({ desbloqueado, alFinal }: { desbloqueado: boolean; alFinal?: boolean }) {
  return (
    <span
      className={cn(
        "absolute top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full border-2 bg-[var(--bg-surface)]",
        alFinal ? "right-0" : "left-1/2 -translate-x-1/2",
        desbloqueado
          ? "border-[color:var(--state-success-border)] text-[var(--state-success-text)]"
          : "border-[color:var(--border-strong)] text-[var(--text-muted)]"
      )}
      aria-hidden
    >
      {desbloqueado && <IconCheck size={12} stroke={3} />}
    </span>
  );
}

export function GarantiaCicloCard({ ciclo }: { ciclo: PortalCicloGarantia }) {
  const progreso = progresoCiclo(ciclo.acumulado);
  const proximo = faltanteProximoUmbral(
    ciclo.acumulado,
    ciclo.umbral5kDesbloqueado,
    ciclo.umbral10kDesbloqueado
  );

  return (
    <Card shadow className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <IconTile variant="neutral" shape="circle">
            <IconShieldCheck size={22} stroke={1.75} />
          </IconTile>
          <div>
            <p className="text-sm text-[var(--text-secondary)]">Compras acumuladas (PayPal)</p>
            <p className="font-mono text-4xl font-medium tabular-nums text-[var(--text-primary)]">
              {formatMonto(ciclo.acumulado)}
            </p>
            {/* El acumulado del ciclo NO es el histórico de compras: al llegar
             *  a USD 10.000 vuelve a cero. Decirlo evita que el cliente crea
             *  que perdió su historial. */}
            <p className="text-xs text-[var(--text-muted)]">
              Ciclo {ciclo.numero} · se reinicia al alcanzar {formatMonto(UMBRAL_10K)}
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-[var(--bg-surface-alt)] px-4 py-3">
          <p className="font-mono text-sm font-semibold tabular-nums text-[var(--text-primary)]">
            {progreso}% del ciclo completado
          </p>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            {proximo
              ? `Te faltan ${formatMonto(proximo.faltante)} para el ${
                  ciclo.umbral5kDesbloqueado ? "segundo" : "primer"
                } beneficio.`
              : "Beneficios del ciclo completados."}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {/* Pista con los dos puntos de umbral encima. */}
        <div className="relative py-2">
          <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--bg-medium)]">
            <div
              role="progressbar"
              aria-valuenow={progreso}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Progreso del ciclo de garantía"
              className="h-full rounded-full bg-[var(--action-primary)] transition-[width] duration-500"
              style={{ width: `${progreso}%` }}
            />
          </div>
          <HitoPunto desbloqueado={ciclo.umbral5kDesbloqueado} />
          <HitoPunto desbloqueado={ciclo.umbral10kDesbloqueado} alFinal />
        </div>

        {/* Etiquetas en dos columnas iguales: la primera termina justo en el
         *  hito de 50%, la segunda en el de 100%. */}
        <div className="grid grid-cols-2 text-xs">
          <div className="flex items-start justify-between gap-2">
            <span className="font-mono tabular-nums text-[var(--text-secondary)]">{formatMonto(0)}</span>
            <span className="translate-x-1/2 text-center">
              <span className="block font-mono font-semibold tabular-nums text-[var(--text-primary)]">
                {formatMonto(UMBRAL_5K)}
              </span>
              <span className="block text-[var(--text-secondary)]">+6 meses</span>
            </span>
          </div>
          <div className="flex items-start justify-end">
            <span className="text-right">
              <span className="block font-mono font-semibold tabular-nums text-[var(--text-primary)]">
                {formatMonto(UMBRAL_10K)}
              </span>
              <span className="block text-[var(--text-secondary)]">+12 meses</span>
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <StatusBadge tone={ciclo.umbral5kDesbloqueado ? "success" : "neutral"}>
          {formatMonto(UMBRAL_5K)} · {ciclo.umbral5kDesbloqueado ? "Desbloqueado" : "Pendiente"}
        </StatusBadge>
        <StatusBadge tone={ciclo.umbral10kDesbloqueado ? "success" : "neutral"}>
          {formatMonto(UMBRAL_10K)} · {ciclo.umbral10kDesbloqueado ? "Desbloqueado" : "Pendiente"}
        </StatusBadge>
      </div>
    </Card>
  );
}
