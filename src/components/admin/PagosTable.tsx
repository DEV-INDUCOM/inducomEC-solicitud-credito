import Link from "next/link";
import { IconInbox } from "@tabler/icons-react";
import { IconTile } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatFecha, formatMonto } from "@/lib/admin/format";
import { metodoPagoLabel, origenPagoLabel } from "@/lib/admin/labels";
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
        description="Los pagos aparecerán aquí una vez que se registren manualmente."
      />
    );
  }

  return (
    <>
      <div className="hidden overflow-x-auto rounded-lg border border-[color:var(--border)] md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--bg-surface-alt)] text-xs uppercase tracking-[0.04em] text-[var(--text-secondary)]">
            <tr>
              {showCliente && <th className="px-4 py-3 font-medium">Empresa</th>}
              <th className="px-4 py-3 text-right font-medium">Monto</th>
              <th className="px-4 py-3 font-medium">Fecha de pago</th>
              <th className="px-4 py-3 font-medium">Método</th>
              <th className="px-4 py-3 font-medium">Referencia</th>
              <th className="px-4 py-3 font-medium">Cargado el</th>
            </tr>
          </thead>
          <tbody>
            {pagos.map((pago) => (
              <tr key={pago.id} className="border-t border-[color:var(--border)] hover:bg-[var(--bg-page-soft)]">
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
                <td className="px-4 py-3 text-right font-mono tabular-nums text-[var(--text-primary)]">
                  {formatMonto(pago.monto)}
                </td>
                <td className="px-4 py-3 text-[var(--text-secondary)]">{formatFecha(pago.fecha)}</td>
                <td className="px-4 py-3">
                  <StatusBadge tone={pago.origen === "manual" ? "info" : "neutral"}>
                    {pago.metodoPago ? metodoPagoLabel[pago.metodoPago] : origenPagoLabel[pago.origen]}
                  </StatusBadge>
                </td>
                <td className="px-4 py-3 font-mono text-[var(--text-primary)]">{pago.referencia ?? "—"}</td>
                <td className="px-4 py-3 text-[var(--text-secondary)]">{formatFecha(pago.createdAt)}</td>
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
                {formatMonto(pago.monto)}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-[var(--text-muted)]">
              <span>{pago.metodoPago ? metodoPagoLabel[pago.metodoPago] : origenPagoLabel[pago.origen]}</span>
              {pago.referencia && <span className="font-mono">Ref. {pago.referencia}</span>}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
