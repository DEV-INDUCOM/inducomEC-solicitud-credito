import { IconInbox } from "@tabler/icons-react";
import { IconTile } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatFecha, formatMonto } from "@/lib/portal/format";
import type { PortalPago } from "@/lib/portal/types";

const origenLabel: Record<PortalPago["origen"], string> = {
  manual: "Carga manual",
  csv: "Carga CSV",
};

export function PaymentHistory({ pagos }: { pagos: PortalPago[] }) {
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
              <th className="px-4 py-3 font-medium">Referencia</th>
              <th className="px-4 py-3 font-medium">Origen</th>
              <th className="px-4 py-3 text-right font-medium">Monto</th>
            </tr>
          </thead>
          <tbody>
            {pagos.map((pago) => (
              <tr key={pago.id} className="border-t border-[color:var(--border)]">
                <td className="px-4 py-3 text-[var(--text-secondary)]">{formatFecha(pago.fecha)}</td>
                <td className="px-4 py-3 font-mono text-[var(--text-primary)]">{pago.referencia ?? "—"}</td>
                <td className="px-4 py-3">
                  <StatusBadge tone={pago.origen === "manual" ? "info" : "neutral"}>
                    {origenLabel[pago.origen]}
                  </StatusBadge>
                </td>
                <td className="px-4 py-3 text-right font-mono tabular-nums text-[var(--text-primary)]">
                  {formatMonto(pago.monto)}
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
              <StatusBadge tone={pago.origen === "manual" ? "info" : "neutral"}>
                {origenLabel[pago.origen]}
              </StatusBadge>
            </div>
            <span className="font-mono text-lg font-medium tabular-nums text-[var(--text-primary)]">
              {formatMonto(pago.monto)}
            </span>
            {pago.referencia && (
              <span className="font-mono text-xs text-[var(--text-muted)]">Ref. {pago.referencia}</span>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}
