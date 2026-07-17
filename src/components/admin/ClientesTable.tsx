import Link from "next/link";
import { IconBuildingSkyscraper, IconEye } from "@tabler/icons-react";
import { IconTile } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatFecha, formatMonto } from "@/lib/admin/format";
import { incentivoLabel, tipoClienteLabel } from "@/lib/admin/labels";
import { routes } from "@/lib/config/site";
import type { AdminClienteListItem } from "@/lib/admin/types";

export function ClientesTable({ items }: { items: AdminClienteListItem[] }) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={
          <IconTile>
            <IconBuildingSkyscraper size={20} stroke={1.75} />
          </IconTile>
        }
        title="No hay empresas que coincidan"
        description="Ajusta los filtros de búsqueda e intenta de nuevo."
      />
    );
  }

  return (
    <>
      <div className="hidden overflow-x-auto rounded-lg border border-[color:var(--border)] md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--bg-surface-alt)] text-xs uppercase tracking-[0.04em] text-[var(--text-secondary)]">
            <tr>
              <th className="px-4 py-3 font-medium">Empresa</th>
              <th className="px-4 py-3 font-medium">País</th>
              <th className="px-4 py-3 font-medium">Usuarios</th>
              <th className="px-4 py-3 font-medium">Incentivo activo</th>
              <th className="px-4 py-3 text-right font-medium">Total pagos</th>
              <th className="px-4 py-3 text-right font-medium">Cashback acum.</th>
              <th className="px-4 py-3 font-medium">Último pago</th>
              <th className="px-4 py-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-[color:var(--border)] hover:bg-[var(--bg-page-soft)]">
                <td className="px-4 py-3">
                  <p className="font-medium text-[var(--text-primary)]">{item.nombre}</p>
                  <p className="font-mono text-xs text-[var(--text-muted)]">
                    {tipoClienteLabel[item.tipoCliente]} · {item.identificacion}
                  </p>
                </td>
                <td className="px-4 py-3 text-[var(--text-secondary)]">{item.pais ?? "—"}</td>
                <td className="px-4 py-3 text-[var(--text-secondary)]">{item.usuarios}</td>
                <td className="px-4 py-3">
                  {item.incentivoActivo ? (
                    <StatusBadge tone="success">{incentivoLabel[item.incentivoActivo]}</StatusBadge>
                  ) : (
                    <StatusBadge tone="neutral">Sin incentivo</StatusBadge>
                  )}
                </td>
                <td className="px-4 py-3 text-right font-mono tabular-nums text-[var(--text-primary)]">
                  {formatMonto(item.totalPagos)}
                </td>
                <td className="px-4 py-3 text-right font-mono tabular-nums text-[var(--state-success-text)]">
                  {item.cashbackAcumulado !== null ? formatMonto(item.cashbackAcumulado) : "—"}
                </td>
                <td className="px-4 py-3 text-[var(--text-secondary)]">
                  {item.ultimoPago ? formatFecha(item.ultimoPago) : "—"}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`${routes.adminEmpresas}/${item.id}`}
                    aria-label={`Ver detalle de ${item.nombre}`}
                    className="inline-flex h-9 w-9 items-center justify-center rounded text-[var(--text-secondary)] hover:bg-[var(--bg-surface-alt)] hover:text-[var(--action-primary)]"
                  >
                    <IconEye size={18} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="flex flex-col gap-3 md:hidden">
        {items.map((item) => (
          <li key={item.id} className="rounded-lg border border-[color:var(--border)] bg-[var(--bg-surface)] p-4">
            <div className="flex items-start justify-between gap-2">
              <Link href={`${routes.adminEmpresas}/${item.id}`} className="font-medium text-[var(--action-primary)]">
                {item.nombre}
              </Link>
              {item.incentivoActivo ? (
                <StatusBadge tone="success">{incentivoLabel[item.incentivoActivo]}</StatusBadge>
              ) : (
                <StatusBadge tone="neutral">Sin incentivo</StatusBadge>
              )}
            </div>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              {tipoClienteLabel[item.tipoCliente]} · {item.identificacion} · {item.pais ?? "—"}
            </p>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-[var(--text-secondary)]">{item.usuarios} usuarios</span>
              <span className="font-mono font-medium tabular-nums text-[var(--text-primary)]">
                {formatMonto(item.totalPagos)}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
