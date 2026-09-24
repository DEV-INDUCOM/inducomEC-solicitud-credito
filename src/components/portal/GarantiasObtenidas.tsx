import { IconExternalLink, IconFileDescription } from "@tabler/icons-react";
import { Card, IconTile } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge, type StatusTone } from "@/components/ui/StatusBadge";
import { formatFecha, formatMonto } from "@/lib/portal/format";
import type { PortalGarantia } from "@/lib/portal/types";

/** Estado visible de una garantía. `revocada_por_limite` se muestra como
 *  "Extensión reemplazada" y en tono neutro, no de error: el cliente no hizo
 *  nada mal y sus 12 meses de fábrica siguen intactos. */
function estadoVisible(garantia: PortalGarantia): { tone: StatusTone; label: string } {
  if (garantia.estado === "revocada_por_limite") {
    return { tone: "neutral", label: "Extensión reemplazada" };
  }
  if (!garantia.vigente) return { tone: "neutral", label: "Vencida" };
  return { tone: "success", label: "Vigente" };
}

/** Lista de garantías. La página la usa dos veces (activas / pasadas), así
 *  que el estado vacío llega por props. */
export function GarantiasObtenidas({
  garantias,
  vacioTitulo,
  vacioDescripcion,
}: {
  garantias: PortalGarantia[];
  vacioTitulo: string;
  vacioDescripcion: string;
}) {
  if (garantias.length === 0) {
    return (
      <EmptyState
        icon={
          <IconTile>
            <IconFileDescription size={20} stroke={1.75} />
          </IconTile>
        }
        title={vacioTitulo}
        description={vacioDescripcion}
      />
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {garantias.map((garantia) => {
        const estado = estadoVisible(garantia);
        const extensionActiva = garantia.estado === "activa";

        return (
          <li key={garantia.id}>
            <Card className="flex flex-col gap-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-display text-base font-semibold tabular-nums text-[var(--text-primary)]">
                    {garantia.cotizacionNumero ?? "Cotización sin número"}
                  </p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {garantia.dealNombre ?? "—"} · Pago del {formatFecha(garantia.fechaInicio)} por{" "}
                    <span className="tabular-nums">{formatMonto(garantia.montoPago)}</span>
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge tone="info">Umbral {formatMonto(garantia.umbral)}</StatusBadge>
                  <StatusBadge tone={estado.tone}>{estado.label}</StatusBadge>
                </div>
              </div>

              {/* Los tres números separados, no un total suelto: la garantía de
               *  fábrica es del producto y nunca se pierde; la extensión sí. */}
              <div className="grid grid-cols-3 gap-3 rounded-lg bg-[var(--bg-surface-alt)] p-4 text-center">
                <div>
                  <p className="font-display text-xl font-semibold tabular-nums text-[var(--text-primary)]">
                    {garantia.mesesFabrica}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">meses de fábrica</p>
                </div>
                <div>
                  <p
                    className={
                      extensionActiva
                        ? "font-display text-xl font-semibold tabular-nums text-[var(--state-success-text)]"
                        : "font-display text-xl font-semibold tabular-nums text-[var(--text-muted)] line-through"
                    }
                  >
                    +{garantia.mesesExtension}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">meses de extensión</p>
                </div>
                <div>
                  <p className="font-display text-xl font-semibold tabular-nums text-[var(--text-primary)]">
                    {extensionActiva ? garantia.mesesTotales : garantia.mesesFabrica}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">meses en total</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                <p className="text-[var(--text-secondary)]">
                  {extensionActiva ? (
                    <>
                      Garantía vigente hasta{" "}
                      <span className="font-medium text-[var(--text-primary)]">
                        {formatFecha(garantia.fechaFinTotal)}
                      </span>
                    </>
                  ) : (
                    <>
                      Garantía de fábrica vigente hasta{" "}
                      <span className="font-medium text-[var(--text-primary)]">
                        {formatFecha(garantia.fechaFinFabrica)}
                      </span>
                    </>
                  )}
                </p>
                {garantia.cotizacionUrl && (
                  <a
                    href={garantia.cotizacionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-[var(--link)] hover:text-[var(--link-hover)]"
                  >
                    Ver cotización
                    <IconExternalLink size={14} stroke={1.75} aria-hidden />
                  </a>
                )}
              </div>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}
