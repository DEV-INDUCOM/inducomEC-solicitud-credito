import Link from "next/link";
import { IconExternalLink, IconInbox } from "@tabler/icons-react";
import { IconTile } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatFecha, formatMonto } from "@/lib/admin/format";
import { routes } from "@/lib/config/site";
import type { AdminPago } from "@/lib/admin/types";

export function PagosTable({ pagos, showCliente = true }: { pagos: AdminPago[]; showCliente?: boolean }) {
  if (pagos.length === 0) {
    return (
      <EmptyState
        icon={
          <IconTile>
            <IconInbox size={20} stroke={1.75} />
          </IconTile>
        }
        title="Aún no hay pagos registrados"
        description="Los pagos aparecerán aquí cuando se registren manualmente o lleguen por PayPal."
      />
    );
  }

  return (
    <>
      <div className="hidden overflow-x-auto rounded-lg border border-[color:var(--border)] md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--bg-surface-alt)] text-xs uppercase tracking-[0.04em] text-[var(--text-secondary)]">
            <tr>
              <th className="px-4 py-3 font-medium">Fecha</th>
              {showCliente && <th className="px-4 py-3 font-medium">Empresa</th>}
              <th className="px-4 py-3 font-medium">Negocio</th>
              <th className="px-4 py-3 font-medium">Número de cotización</th>
              <th className="px-4 py-3 font-medium">Cotización</th>
              <th className="px-4 py-3 text-right font-medium">Monto pagado</th>
            </tr>
          </thead>
          <tbody>
            {pagos.map((pago) => (
              <tr key={pago.id} className="border-t border-[color:var(--border)] hover:bg-[var(--bg-page-soft)]">
                <td className="px-4 py-3 text-[var(--text-secondary)]">{formatFecha(pago.fecha)}</td>
                {showCliente && (
                  <td className="px-4 py-3">
                    <Link
                      href={`${routes.adminEmpresas}/${pago.clienteId}`}
                      className="font-medium text-[var(--action-primary)] hover:text-[var(--link-hover)]"
                    >
                      {pago.clienteNombre}
                    </Link>
                  </td>
                )}
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

      <ul className="flex flex-col gap-3 md:hidden">
        {pagos.map((pago) => (
          <li key={pago.id} className="rounded-lg border border-[color:var(--border)] bg-[var(--bg-surface)] p-4">
            <div className="flex items-center justify-between">
              {showCliente ? (
                <Link href={`${routes.adminEmpresas}/${pago.clienteId}`} className="font-medium text-[var(--action-primary)]">
                  {pago.clienteNombre}
                </Link>
              ) : (
                <span className="text-sm text-[var(--text-secondary)]">{formatFecha(pago.fecha)}</span>
              )}
              <span className="font-mono font-medium tabular-nums text-[var(--text-primary)]">
                {formatMonto(pago.montoPagado)}
              </span>
            </div>
            {showCliente && (
              <p className="mt-1 text-xs text-[var(--text-secondary)]">{formatFecha(pago.fecha)}</p>
            )}
            {pago.dealNombre && (
              <p className="mt-1 text-sm text-[var(--text-secondary)]">{pago.dealNombre}</p>
            )}
            {pago.cotizacionNumero && (
              <p className="mt-1 text-xs text-[var(--text-muted)]">Cotización {pago.cotizacionNumero}</p>
            )}
            {pago.cotizacionUrl && (
              <a
                href={pago.cotizacionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-sm text-[var(--action-primary)]"
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
