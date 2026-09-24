import Link from "next/link";
import { IconArrowRight, IconInbox } from "@tabler/icons-react";
import { IconTile } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatFecha, formatMonto } from "@/lib/portal/format";
import { routes } from "@/lib/config/site";
import type { PortalPago } from "@/lib/portal/types";

/** Últimos movimientos del dashboard: versión resumida del historial, con
 *  tres columnas y un enlace al módulo PayPal, que tiene la tabla completa. */
const MAXIMO_FILAS = 3;

export function UltimosMovimientos({ pagos }: { pagos: PortalPago[] }) {
  const ultimos = pagos.slice(0, MAXIMO_FILAS);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">Últimos movimientos</h2>
        {ultimos.length > 0 && (
          <Link
            href={routes.paypal}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--action-primary)] hover:text-[var(--link-hover)] focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]"
          >
            Ver historial
            <IconArrowRight size={16} stroke={1.75} aria-hidden />
          </Link>
        )}
      </div>

      {ultimos.length === 0 ? (
        <EmptyState
          icon={
            <IconTile>
              <IconInbox size={20} stroke={1.75} />
            </IconTile>
          }
          title="Aún no hay pagos registrados"
          description="Tus pagos con PayPal aparecerán aquí al confirmarse."
        />
      ) : (
        <>
          {/* Desktop: tabla de tres columnas. Móvil: una fila por tarjeta,
           *  mismo patrón que el resto del portal. */}
          <div className="hidden overflow-hidden rounded-lg border border-[color:var(--border)] md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--bg-surface-alt)] text-xs uppercase tracking-[0.04em] text-[var(--text-secondary)]">
                <tr>
                  <th className="px-4 py-3 font-medium">Fecha</th>
                  <th className="px-4 py-3 font-medium">Cotización</th>
                  <th className="px-4 py-3 text-right font-medium">Monto pagado</th>
                </tr>
              </thead>
              <tbody>
                {ultimos.map((pago) => (
                  <tr key={pago.id} className="border-t border-[color:var(--border)]">
                    <td className="px-4 py-3 whitespace-nowrap text-[var(--text-secondary)]">
                      {formatFecha(pago.fecha)}
                    </td>
                    <td className="px-4 py-3 font-mono text-[var(--text-primary)]">
                      {pago.cotizacionNumero ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-[var(--text-primary)]">
                      {formatMonto(pago.montoPagado)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="flex flex-col gap-3 md:hidden">
            {ultimos.map((pago) => (
              <li
                key={pago.id}
                className="flex flex-col gap-1 rounded-lg border border-[color:var(--border)] bg-[var(--bg-surface)] p-4"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm text-[var(--text-secondary)]">{formatFecha(pago.fecha)}</span>
                  <span className="font-mono text-sm font-semibold tabular-nums text-[var(--text-primary)]">
                    {formatMonto(pago.montoPagado)}
                  </span>
                </div>
                {pago.cotizacionNumero && (
                  <span className="font-mono text-xs text-[var(--text-primary)]">
                    {pago.cotizacionNumero}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
