import { IconQrcode } from "@tabler/icons-react";
import { IconTile } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatFecha } from "@/lib/admin/format";
import { estadoCodigoLabel, estadoCodigoTone } from "@/lib/admin/labels";
import { cn } from "@/lib/utils/cn";
import type { AdminCodigo } from "@/lib/admin/types";

export function CodigosTable({ items }: { items: AdminCodigo[] }) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={
          <IconTile>
            <IconQrcode size={20} stroke={1.75} />
          </IconTile>
        }
        title="No hay códigos que coincidan"
        description="Genera un nuevo código o ajusta los filtros de búsqueda."
      />
    );
  }

  return (
    <>
      <div className="hidden overflow-x-auto rounded-lg border border-[color:var(--border)] md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--bg-surface-alt)] text-xs uppercase tracking-[0.04em] text-[var(--text-secondary)]">
            <tr>
              <th className="px-4 py-3 font-medium">Código</th>
              <th className="px-4 py-3 font-medium">Empresa</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Vence el</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-[color:var(--border)] hover:bg-[var(--bg-page-soft)]">
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "rounded bg-[var(--bg-surface-alt)] px-2 py-1 font-mono text-xs font-semibold",
                      item.estado === "vencido" ? "text-[var(--text-muted)] line-through" : "text-[var(--text-primary)]"
                    )}
                  >
                    {item.codigo}
                  </span>
                </td>
                <td className="px-4 py-3 text-[var(--text-secondary)]">{item.clienteNombre}</td>
                <td className="px-4 py-3">
                  <StatusBadge tone={estadoCodigoTone[item.estado]}>{estadoCodigoLabel[item.estado]}</StatusBadge>
                </td>
                <td className="px-4 py-3 text-[var(--text-secondary)]">{formatFecha(item.fechaVencimiento)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="flex flex-col gap-3 md:hidden">
        {items.map((item) => (
          <li key={item.id} className="rounded-lg border border-[color:var(--border)] bg-[var(--bg-surface)] p-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm font-semibold text-[var(--text-primary)]">{item.codigo}</span>
              <StatusBadge tone={estadoCodigoTone[item.estado]}>{estadoCodigoLabel[item.estado]}</StatusBadge>
            </div>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">{item.clienteNombre}</p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">Vence el {formatFecha(item.fechaVencimiento)}</p>
          </li>
        ))}
      </ul>
    </>
  );
}
