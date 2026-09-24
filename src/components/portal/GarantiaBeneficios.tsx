import { IconGift, IconLock } from "@tabler/icons-react";
import { Card, IconTile } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { UMBRAL_10K, UMBRAL_5K } from "@/lib/portal/beneficios";
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

          return (
            <Card key={umbral} className="flex items-start gap-4">
              <IconTile variant={desbloqueado ? "accent" : "neutral"}>
                {desbloqueado ? (
                  <IconGift size={20} stroke={1.75} />
                ) : (
                  <IconLock size={20} stroke={1.75} />
                )}
              </IconTile>

              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-display text-base font-semibold tabular-nums text-[var(--text-primary)]">
                    {formatMonto(umbral)}
                  </p>
                  <StatusBadge tone={desbloqueado ? "success" : "neutral"}>
                    {desbloqueado ? "Desbloqueado" : "Pendiente"}
                  </StatusBadge>
                </div>
                <p className="text-sm font-medium text-[var(--text-primary)]">+{meses} meses de garantía</p>
                <p className="text-sm text-[var(--text-secondary)] leading-normal">
                  {garantia ? (
                    <>
                      Asignado a la cotización{" "}
                      <span className="font-mono text-[var(--text-primary)]">
                        {garantia.cotizacionNumero ?? "sin número"}
                      </span>
                      .
                    </>
                  ) : (
                    "Se asigna a la cotización que permite alcanzar este umbral."
                  )}
                </p>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
