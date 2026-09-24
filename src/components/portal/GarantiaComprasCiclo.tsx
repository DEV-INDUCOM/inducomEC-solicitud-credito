import { IconInbox } from "@tabler/icons-react";
import { IconTile } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatFecha, formatMonto } from "@/lib/portal/format";
import type { PortalCompraCiclo } from "@/lib/portal/types";

/** Compras que acumularon en el ciclo ACTUAL. Después de un reinicio, las de
 *  ciclos anteriores dejan de listarse acá (siguen en el historial de pagos);
 *  por eso la pertenencia al ciclo se guarda en `pagos_ciclo_garantia` y no
 *  se deduce por fecha. */
export function GarantiaComprasCiclo({ compras }: { compras: PortalCompraCiclo[] }) {
  if (compras.length === 0) {
    return (
      <EmptyState
        icon={
          <IconTile>
            <IconInbox size={20} stroke={1.75} />
          </IconTile>
        }
        title="Todavía no hay compras en este ciclo"
        description="Cada pago confirmado con PayPal suma al acumulado de tu garantía."
      />
    );
  }

  const total = compras.reduce((suma, compra) => suma + compra.monto, 0);

  return (
    <>
      {/* Desktop: tabla; móvil: tarjetas por fila (mismo patrón que el
       *  historial de pagos, para no inventar una segunda forma de tabla). */}
      <div className="hidden overflow-x-auto rounded-[var(--card-radius)] border border-[color:var(--card-border)] bg-[var(--bg-surface)] shadow-[var(--card-shadow)] md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--bg-surface-alt)] text-xs uppercase tracking-[0.04em] text-[var(--text-secondary)]">
            <tr>
              <th className="px-4 py-3 font-medium">Fecha</th>
              <th className="px-4 py-3 font-medium">Cotización</th>
              <th className="px-4 py-3 font-medium">Negocio</th>
              <th className="px-4 py-3 text-right font-medium">Monto</th>
            </tr>
          </thead>
          <tbody>
            {compras.map((compra) => (
              <tr key={compra.pagoId} className="border-t border-[color:var(--border)]">
                <td className="px-4 py-3 whitespace-nowrap text-[var(--text-secondary)]">
                  {compra.fecha ? formatFecha(compra.fecha) : "—"}
                </td>
                <td className="px-4 py-3 tabular-nums text-[var(--text-primary)]">
                  {compra.cotizacionNumero ?? "—"}
                </td>
                <td className="px-4 py-3 text-[var(--text-secondary)]">{compra.dealNombre ?? "—"}</td>
                <td className="px-4 py-3 text-right font-medium tabular-nums text-[var(--text-primary)]">
                  {formatMonto(compra.monto)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-[color:var(--border-strong)] bg-[var(--bg-surface-alt)]">
              <td className="px-4 py-3 font-medium text-[var(--text-primary)]" colSpan={3}>
                Total acumulado
              </td>
              <td className="px-4 py-3 text-right font-semibold tabular-nums text-[var(--text-primary)]">
                {formatMonto(total)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <ul className="flex flex-col gap-3 md:hidden">
        {compras.map((compra) => (
          <li
            key={compra.pagoId}
            className="flex flex-col gap-1 rounded-[var(--card-radius)] border border-[color:var(--card-border)] bg-[var(--bg-surface)] p-4 shadow-[var(--card-shadow)]"
          >
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm text-[var(--text-secondary)]">
                {compra.fecha ? formatFecha(compra.fecha) : "—"}
              </span>
              <span className="text-sm font-semibold tabular-nums text-[var(--text-primary)]">
                {formatMonto(compra.monto)}
              </span>
            </div>
            {compra.cotizacionNumero && (
              <span className="text-xs tabular-nums text-[var(--text-secondary)]">{compra.cotizacionNumero}</span>
            )}
            {compra.dealNombre && (
              <span className="text-xs text-[var(--text-secondary)]">{compra.dealNombre}</span>
            )}
          </li>
        ))}
        <li className="flex items-baseline justify-between gap-3 rounded-lg bg-[var(--bg-surface-alt)] px-4 py-3">
          <span className="text-sm font-medium text-[var(--text-primary)]">Total acumulado</span>
          <span className="text-sm font-semibold tabular-nums text-[var(--text-primary)]">
            {formatMonto(total)}
          </span>
        </li>
      </ul>
    </>
  );
}
