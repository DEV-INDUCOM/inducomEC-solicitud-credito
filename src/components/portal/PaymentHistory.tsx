import { IconExternalLink, IconInbox } from "@tabler/icons-react";
import { IconTile } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatFecha, formatMonto } from "@/lib/portal/format";
import type { PortalPago } from "@/lib/portal/types";

export function PaymentHistory({
  pagos,
  empresaNombre,
}: {
  pagos: PortalPago[];
  empresaNombre: string;
}) {
  if (pagos.length === 0) {
    return (
      <EmptyState
        icon={
          <IconTile>
            <IconInbox size={20} stroke={1.75} />
          </IconTile>
        }
        title="Aún no hay pagos registrados"
        description="El saldo se actualiza cuando INDUCOM carga la información de tus pagos."
      />
    );
  }

  return (
    <>
      {/* Desktop / tablet: tabla con scroll horizontal solo si es inevitable */}
      <div className="hidden overflow-x-auto rounded-lg border border-[color:var(--border)] md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--bg-surface-alt)] text-xs uppercase tracking-[0.04em] text-[var(--text-secondary)]">
            <tr>
              <th className="px-4 py-3 font-medium">Fecha</th>
              <th className="px-4 py-3 font-medium">Empresa</th>
              <th className="px-4 py-3 font-medium">Negocio</th>
              <th className="px-4 py-3 font-medium">Número de cotización</th>
              <th className="px-4 py-3 font-medium">Cotización</th>
              <th className="px-4 py-3 text-right font-medium">Monto pagado</th>
            </tr>
          </thead>
          <tbody>
            {pagos.map((pago) => (
              <tr key={pago.id} className="border-t border-[color:var(--border)]">
                <td className="px-4 py-3 text-[var(--text-secondary)]">{formatFecha(pago.fecha)}</td>
                <td className="px-4 py-3 text-[var(--text-primary)]">{empresaNombre}</td>
                <td className="px-4 py-3 text-[var(--text-secondary)]">{pago.dealNombre ?? "—"}</td>
                <td className="px-4 py-3 text-[var(--text-primary)]">{pago.cotizacionNumero ?? "—"}</td>
                <td className="px-4 py-3">
                  {pago.cotizacionUrl ? (
                    <a
                      href={pago.cotizacionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[var(--action-primary)] hover:text-[var(--link-hover)]"
                    >
                      Ver cotización
                      <IconExternalLink size={14} stroke={1.75} />
                    </a>
                  ) : (
                    <span className="text-[var(--text-muted)]">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right font-mono tabular-nums text-[var(--text-primary)]">
                  {formatMonto(pago.montoPagado)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Móvil: filas convertidas en tarjetas compactas, no tabla con scroll */}
      <ul className="flex flex-col gap-3 md:hidden">
        {pagos.map((pago) => (
          <li
            key={pago.id}
            className="flex flex-col gap-2 rounded-lg border border-[color:var(--border)] bg-[var(--bg-surface)] p-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--text-secondary)]">{formatFecha(pago.fecha)}</span>
              <span className="font-mono font-medium tabular-nums text-[var(--text-primary)]">
                {formatMonto(pago.montoPagado)}
              </span>
            </div>
            <span className="text-sm text-[var(--text-primary)]">{empresaNombre}</span>
            {pago.dealNombre && (
              <span className="text-xs text-[var(--text-secondary)]">{pago.dealNombre}</span>
            )}
            {pago.cotizacionNumero && (
              <span className="text-xs text-[var(--text-muted)]">
                Cotización {pago.cotizacionNumero}
              </span>
            )}
            {pago.cotizacionUrl && (
              <a
                href={pago.cotizacionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-[var(--action-primary)]"
              >
                Ver cotización
                <IconExternalLink size={14} stroke={1.75} />
              </a>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}
