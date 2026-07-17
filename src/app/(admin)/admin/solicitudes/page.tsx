import type { Metadata } from "next";
import { IconFilterOff, IconSearch } from "@tabler/icons-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { Pagination } from "@/components/admin/Pagination";
import { SolicitudesTable } from "@/components/admin/SolicitudesTable";
import { estadoSolicitudLabel } from "@/lib/admin/labels";
import { getPaises, getSolicitudCounts, getSolicitudes, PAGE_SIZE, type SolicitudesFiltros } from "@/lib/admin/queries";
import { routes } from "@/lib/config/site";
import type { EstadoSolicitud } from "@/lib/admin/types";

export const metadata: Metadata = { title: "Solicitudes de crédito" };

const ESTADOS: EstadoSolicitud[] = ["recibido", "en_revision", "aprobado", "rechazado", "pendiente_informacion"];

export default async function AdminSolicitudesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);

  const filtros: SolicitudesFiltros = {
    q: sp.q,
    estado: (sp.estado as EstadoSolicitud) || undefined,
    paisId: sp.pais ? Number(sp.pais) : undefined,
    desde: sp.desde ? new Date(sp.desde).toISOString() : undefined,
    hasta: sp.hasta ? new Date(`${sp.hasta}T23:59:59`).toISOString() : undefined,
  };

  const [paises, counts, resultado] = await Promise.all([
    getPaises(),
    getSolicitudCounts(),
    getSolicitudes(filtros, page, PAGE_SIZE),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl">Solicitudes de crédito</h1>
        <p className="mt-2 text-[var(--text-secondary)]">
          Revisa, aprueba o rechaza solicitudes de crédito entrantes.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {ESTADOS.map((estado) => (
          <Card key={estado} className="flex flex-col gap-1">
            <p className="text-xs font-semibold uppercase tracking-[0.04em] text-[var(--text-secondary)]">
              {estadoSolicitudLabel[estado]}
            </p>
            <p className="font-mono text-2xl font-medium tabular-nums text-[var(--text-primary)]">
              {counts[estado] ?? 0}
            </p>
          </Card>
        ))}
      </div>

      <Card>
        <form className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:items-end" method="get">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-[var(--text-primary)]">Buscador</span>
            <span className="relative flex items-center">
              <IconSearch size={16} className="pointer-events-none absolute left-3 text-[var(--text-muted)]" />
              <input
                type="search"
                name="q"
                defaultValue={sp.q ?? ""}
                placeholder="Nombre, empresa, identificación…"
                className="h-11 w-full rounded border border-[color:var(--border-strong)] bg-[var(--bg-surface)] pl-9 pr-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus-visible:border-[color:var(--accent)]"
              />
            </span>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-[var(--text-primary)]">Estado</span>
            <select
              name="estado"
              defaultValue={sp.estado ?? ""}
              className="h-11 rounded border border-[color:var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)]"
            >
              <option value="">Todos los estados</option>
              {ESTADOS.map((estado) => (
                <option key={estado} value={estado}>
                  {estadoSolicitudLabel[estado]}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-[var(--text-primary)]">País</span>
            <select
              name="pais"
              defaultValue={sp.pais ?? ""}
              className="h-11 rounded border border-[color:var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)]"
            >
              <option value="">Cualquier país</option>
              {paises.map((pais) => (
                <option key={pais.id} value={pais.id}>
                  {pais.nombre}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-[var(--text-primary)]">Desde</span>
            <input
              type="date"
              name="desde"
              defaultValue={sp.desde ?? ""}
              className="h-11 rounded border border-[color:var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)]"
            />
          </label>

          <div className="flex gap-3">
            <label className="flex flex-1 flex-col gap-2">
              <span className="text-sm font-medium text-[var(--text-primary)]">Hasta</span>
              <input
                type="date"
                name="hasta"
                defaultValue={sp.hasta ?? ""}
                className="h-11 rounded border border-[color:var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)]"
              />
            </label>
          </div>

          <div className="col-span-full flex justify-end gap-3">
            <a href={routes.adminSolicitudes}>
              <Button type="button" variant="outline" size="sm">
                <IconFilterOff size={16} /> Limpiar filtros
              </Button>
            </a>
            <Button type="submit" size="sm">
              Aplicar filtros
            </Button>
          </div>
        </form>
      </Card>

      {resultado.ok ? (
        <div className="flex flex-col gap-4">
          <SolicitudesTable items={resultado.items} />
          <Pagination
            basePath={routes.adminSolicitudes}
            searchParams={sp}
            page={page}
            total={resultado.total}
            pageSize={PAGE_SIZE}
          />
        </div>
      ) : (
        <ErrorState title="No pudimos cargar las solicitudes" />
      )}
    </div>
  );
}
