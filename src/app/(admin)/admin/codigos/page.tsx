import type { Metadata } from "next";
import { IconBolt, IconFilterOff, IconShieldCheck, IconSparkles, IconTicket } from "@tabler/icons-react";
import { Card, IconTile } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { Pagination } from "@/components/admin/Pagination";
import { CodigosTable } from "@/components/admin/CodigosTable";
import { GenerarCodigoModal } from "@/components/admin/GenerarCodigoModal";
import { estadoCodigoLabel } from "@/lib/admin/labels";
import { getClientesOptions, getCodigos, getCodigosStats, PAGE_SIZE, type CodigosFiltros } from "@/lib/admin/queries";
import { routes } from "@/lib/config/site";

export const metadata: Metadata = { title: "Códigos de invitación" };

export default async function AdminCodigosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);

  const filtros: CodigosFiltros = {
    clienteId: sp.cliente,
    estado: (sp.estado as "activo" | "usado" | "vencido") || undefined,
    vence: sp.vence ? new Date(`${sp.vence}T23:59:59`).toISOString() : undefined,
  };

  const [clientes, resultado, stats] = await Promise.all([
    getClientesOptions(),
    getCodigos(filtros, page, PAGE_SIZE),
    getCodigosStats(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <h1 className="text-3xl">Códigos de invitación</h1>
        <GenerarCodigoModal clientes={clientes} />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Card className="flex items-center gap-4">
          <IconTile>
            <IconTicket size={20} stroke={1.75} />
          </IconTile>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.04em] text-[var(--text-secondary)]">
              Total generados
            </p>
            <p className="font-mono text-2xl font-medium tabular-nums text-[var(--text-primary)]">
              {stats.totalGenerados}
            </p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <IconTile variant="accent">
            <IconBolt size={20} stroke={1.75} />
          </IconTile>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.04em] text-[var(--text-secondary)]">
              Códigos activos
            </p>
            <p className="font-mono text-2xl font-medium tabular-nums text-[var(--text-primary)]">
              {stats.activosHoy}
            </p>
          </div>
        </Card>
      </div>

      <Card>
        <form className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-end" method="get">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-[var(--text-primary)]">Empresa</span>
            <select
              name="cliente"
              defaultValue={sp.cliente ?? ""}
              className="h-11 rounded border border-[color:var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)]"
            >
              <option value="">Todas las empresas</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-[var(--text-primary)]">Estado</span>
            <select
              name="estado"
              defaultValue={sp.estado ?? ""}
              className="h-11 rounded border border-[color:var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)]"
            >
              <option value="">Todos</option>
              <option value="activo">{estadoCodigoLabel.activo}</option>
              <option value="usado">{estadoCodigoLabel.usado}</option>
              <option value="vencido">{estadoCodigoLabel.vencido}</option>
            </select>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-[var(--text-primary)]">Vence antes de</span>
            <input
              type="date"
              name="vence"
              defaultValue={sp.vence ?? ""}
              className="h-11 rounded border border-[color:var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)]"
            />
          </label>

          <div className="flex justify-end gap-3">
            <a href={routes.adminCodigos}>
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
          <CodigosTable items={resultado.items} />
          <Pagination basePath={routes.adminCodigos} searchParams={sp} page={page} total={resultado.total} pageSize={PAGE_SIZE} />
        </div>
      ) : (
        <ErrorState title="No pudimos cargar los códigos de invitación" />
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="flex gap-3">
          <IconTile>
            <IconShieldCheck size={18} stroke={1.75} />
          </IconTile>
          <div>
            <p className="text-sm font-semibold text-[var(--text-primary)]">Seguridad</p>
            <p className="mt-1 text-sm leading-normal text-[var(--text-secondary)]">
              Cada código es único, de un solo uso y tiene una fecha de vencimiento definida.
            </p>
          </div>
        </Card>
        <Card className="flex gap-3">
          <IconTile variant="accent">
            <IconSparkles size={18} stroke={1.75} />
          </IconTile>
          <div>
            <p className="text-sm font-semibold text-[var(--text-primary)]">Asignación automática</p>
            <p className="mt-1 text-sm leading-normal text-[var(--text-secondary)]">
              Al usar un código, el sistema vincula automáticamente el historial de la empresa al nuevo perfil.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
