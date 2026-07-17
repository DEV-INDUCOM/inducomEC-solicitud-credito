import Link from "next/link";
import { IconInbox, IconPaperclip } from "@tabler/icons-react";
import { IconTile } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { EstadoSolicitudBadge } from "./EstadoSolicitudBadge";
import { formatFecha } from "@/lib/admin/format";
import { routes } from "@/lib/config/site";
import type { AdminSolicitudListItem } from "@/lib/admin/types";

export function SolicitudesTable({ items }: { items: AdminSolicitudListItem[] }) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={
          <IconTile>
            <IconInbox size={20} stroke={1.75} />
          </IconTile>
        }
        title="No hay solicitudes que coincidan"
        description="Ajusta los filtros o vuelve a intentarlo más tarde."
      />
    );
  }

  return (
    <>
      <div className="hidden overflow-x-auto rounded-lg border border-[color:var(--border)] md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--bg-surface-alt)] text-xs uppercase tracking-[0.04em] text-[var(--text-secondary)]">
            <tr>
              <th className="px-4 py-3 font-medium">Solicitante</th>
              <th className="px-4 py-3 font-medium">Empresa</th>
              <th className="px-4 py-3 font-medium">Identificación</th>
              <th className="px-4 py-3 font-medium">País</th>
              <th className="px-4 py-3 font-medium">Documentos</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Fecha de ingreso</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-[color:var(--border)] hover:bg-[var(--bg-page-soft)]">
                <td className="px-4 py-3">
                  <Link
                    href={`${routes.adminSolicitudes}/${item.id}`}
                    className="font-medium text-[var(--action-primary)] hover:text-[var(--link-hover)]"
                  >
                    {item.nombreSolicitante}
                  </Link>
                </td>
                <td className="px-4 py-3 text-[var(--text-secondary)]">{item.nombreEmpresa ?? "—"}</td>
                <td className="px-4 py-3 font-mono text-[var(--text-primary)]">{item.identificacion}</td>
                <td className="px-4 py-3 text-[var(--text-secondary)]">{item.pais ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1.5 text-[var(--text-secondary)]">
                    <IconPaperclip size={14} /> {item.cantidadDocumentos}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <EstadoSolicitudBadge estado={item.estado} />
                </td>
                <td className="px-4 py-3 text-[var(--text-secondary)]">{formatFecha(item.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="flex flex-col gap-3 md:hidden">
        {items.map((item) => (
          <li key={item.id} className="rounded-lg border border-[color:var(--border)] bg-[var(--bg-surface)] p-4">
            <div className="flex items-start justify-between gap-2">
              <Link
                href={`${routes.adminSolicitudes}/${item.id}`}
                className="font-medium text-[var(--action-primary)] hover:text-[var(--link-hover)]"
              >
                {item.nombreSolicitante}
              </Link>
              <EstadoSolicitudBadge estado={item.estado} />
            </div>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">{item.nombreEmpresa ?? "Persona natural"}</p>
            <p className="mt-2 font-mono text-xs text-[var(--text-muted)]">{item.identificacion}</p>
            <div className="mt-2 flex items-center justify-between text-xs text-[var(--text-secondary)]">
              <span>{item.pais ?? "—"}</span>
              <span>{formatFecha(item.createdAt)}</span>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
