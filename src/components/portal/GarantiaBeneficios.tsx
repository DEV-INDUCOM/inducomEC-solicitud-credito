import { IconCircleCheck, IconLock, IconShieldCheck } from "@tabler/icons-react";
import { Card, IconTile } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { MESES_GARANTIA_FABRICA, UMBRAL_10K, UMBRAL_5K } from "@/lib/portal/beneficios";
import { formatMonto } from "@/lib/portal/format";
import type { PortalCicloGarantia, PortalGarantia } from "@/lib/portal/types";

/** Los dos beneficios del ciclo actual, con el estado de cada umbral.
 *  Cuando ya se desbloqueó, se nombra la cotización beneficiada: el beneficio
 *  pertenece a UNA cotización, no se reparte entre las compras del ciclo. */
export function GarantiaBeneficios({
  ciclo,
  garantiasDelCiclo,
}: {
  ciclo: PortalCicloGarantia;
  garantiasDelCiclo: PortalGarantia[];
}) {
  const beneficios = [
    { umbral: UMBRAL_5K, meses: 6, desbloqueado: ciclo.umbral5kDesbloqueado },
    { umbral: UMBRAL_10K, meses: 12, desbloqueado: ciclo.umbral10kDesbloqueado },
  ];

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-[var(--text-primary)]">Tus beneficios en este ciclo</h2>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {beneficios.map(({ umbral, meses, desbloqueado }) => {
          const garantia = garantiasDelCiclo.find((g) => g.umbral === umbral);
          // Faltante real de ESTE umbral (no el del próximo hito).
          const faltante = Math.max(umbral - ciclo.acumulado, 0);

          return (
            <Card key={umbral} className="flex flex-col gap-5">
              <div className="flex items-start gap-4">
                {/* Naranja solo cuando es un logro; pendiente, neutro. */}
                <IconTile variant={desbloqueado ? "accent" : "neutral"}>
                  <IconShieldCheck size={22} stroke={1.75} />
                </IconTile>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="text-xl text-[var(--text-primary)]">+{meses} meses de garantía</h3>
                    <StatusBadge
                      tone={desbloqueado ? "success" : "neutral"}
                      icon={desbloqueado ? undefined : <IconLock size={12} stroke={2} aria-hidden />}
                    >
                      {desbloqueado ? "Desbloqueado" : "Pendiente"}
                    </StatusBadge>
                  </div>
                  <p className="text-sm leading-normal text-[var(--text-secondary)]">
                    Se suman a los {MESES_GARANTIA_FABRICA} meses de fábrica de la cotización cuyo pago lleve tu acumulado del ciclo a{" "}
                    {formatMonto(umbral)}.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-[color:var(--border)] pt-4 text-sm">
                <span className="text-[var(--text-secondary)]">Condición de liberación</span>
                <span className="font-semibold tabular-nums text-[var(--text-primary)]">
                  Llegar a {formatMonto(umbral)}
                </span>
              </div>

              {/* Barra de estado, NO un botón: no hay ninguna acción que el
               *  cliente pueda hacer aquí (guía, sección 11). */}
              {desbloqueado ? (
                <div className="flex items-center justify-center gap-2 rounded-[var(--radius)] border border-[color:var(--state-success-border)] bg-[var(--state-success-bg)] px-4 py-2.5 text-sm font-medium text-[var(--state-success-text)]">
                  <IconCircleCheck size={18} stroke={1.75} aria-hidden />
                  {garantia?.cotizacionNumero
                    ? `Asignado a la cotización ${garantia.cotizacionNumero}`
                    : "Beneficio desbloqueado"}
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 rounded-[var(--radius)] border border-[color:var(--state-neutral-border)] bg-[var(--state-neutral-bg)] px-4 py-2.5 text-sm font-medium text-[var(--state-neutral-text)]">
                  <IconLock size={18} stroke={1.75} aria-hidden />
                  {/* Un solo nodo de texto: el gap del flex no debe separar el monto. */}
                  <span className="tabular-nums">Bloqueado · faltan {formatMonto(faltante)}</span>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </section>
  );
}
