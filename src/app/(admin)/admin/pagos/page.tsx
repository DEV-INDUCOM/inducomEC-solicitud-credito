import type { Metadata } from "next";
import { IconFilterOff, IconReceipt2, IconStar, IconWallet } from "@tabler/icons-react";
import { Card, IconTile } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { Pagination } from "@/components/admin/Pagination";
import { PagosTable } from "@/components/admin/PagosTable";
import { RegistrarPagoModal } from "@/components/admin/RegistrarPagoModal";
import { formatMonto } from "@/lib/admin/format";
import { origenPagoLabel } from "@/lib/admin/labels";
import { getClientesOptions, getPagos, getPagosStats, PAGE_SIZE, type PagosFiltros } from "@/lib/admin/queries";
import { routes } from "@/lib/config/site";
import type { OrigenPago } from "@/lib/admin/types";

export const metadata: Metadata = { title: "Pagos" };

export default async function AdminPagosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);

  const filtros: PagosFiltros = {
    clienteId: sp.cliente,
    desde: sp.desde ? new Date(sp.desde).toISOString() : undefined,
    hasta: sp.hasta ? new Date(`${sp.hasta}T23:59:59`).toISOString() : undefined,
    origen: (sp.origen as OrigenPago) || undefined,
    referencia: sp.referencia,
  };

  const [clientes, resultado, stats] = await Promise.all([
    getClientesOptions(),
    getPagos(filtros, page, PAGE_SIZE),
    getPagosStats(filtros.desde, filtros.hasta),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm text-[var(--text-secondary)]">Registro de actividad financiera</p>
          <h1 className="text-3xl">Historial de pagos</h1>
        </div>
        <RegistrarPagoModal clientes={clientes} />
      </div>

      {stats.ok && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <Card className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--text-secondary)]">
                Total pagado (filtro actual)
              </p>
              <IconTile>
                <IconWallet size={18} stroke={1.75} />
              </IconTile>
            </div>
            <p className="font-mono text-2xl font-medium tabular-nums text-[var(--text-primary)]">
              {formatMonto(stats.data.totalPeriodo)}
            </p>
          </Card>
          <Card className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--text-secondary)]">
                Cantidad de transacciones
              </p>
              <IconTile>
                <IconReceipt2 size={18} stroke={1.75} />
              </IconTile>
            </div>
            <p className="font-mono text-2xl font-medium tabular-nums text-[var(--text-primary)]">
              {stats.data.cantidadTransacciones}
            </p>
          </Card>
          <Card className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--text-secondary)]">
                Cashback generado
              </p>
              <IconTile variant="accent">
                <IconStar size={18} stroke={1.75} />
              </IconTile>
            </div>
            <p className="font-mono text-2xl font-medium tabular-nums text-[var(--text-primary)]">
              {formatMonto(stats.data.cashbackGenerado)}
            </p>
          </Card>
        </div>
      )}

      <Card>
        <form className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:items-end" method="get">
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
            <span className="text-sm font-medium text-[var(--text-primary)]">Desde</span>
            <input
              type="date"
              name="desde"
              defaultValue={sp.desde ?? ""}
              className="h-11 rounded border border-[color:var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)]"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-[var(--text-primary)]">Hasta</span>
            <input
              type="date"
              name="hasta"
              defaultValue={sp.hasta ?? ""}
              className="h-11 rounded border border-[color:var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)]"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-[var(--text-primary)]">Origen</span>
            <select
              name="origen"
              defaultValue={sp.origen ?? ""}
              className="h-11 rounded border border-[color:var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)]"
            >
              <option value="">Todos</option>
              <option value="manual">{origenPagoLabel.manual}</option>
              <option value="csv">{origenPagoLabel.csv}</option>
            </select>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-[var(--text-primary)]">Referencia</span>
            <input
              type="search"
              name="referencia"
              defaultValue={sp.referencia ?? ""}
              placeholder="Ref. #00000"
              className="h-11 rounded border border-[color:var(--border-strong)] bg-[var(--bg-surface)] px-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
            />
          </label>

          <div className="col-span-full flex justify-end gap-3">
            <a href={routes.adminPagos}>
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
          <PagosTable pagos={resultado.pagos} />
          <div className="flex items-center justify-between rounded-lg bg-brand-navy-900 px-5 py-4 text-[var(--text-on-dark)]">
            <p className="text-sm font-semibold uppercase tracking-[0.04em]">Total filtrado</p>
            <p className="font-mono text-lg font-semibold tabular-nums">
              {formatMonto(resultado.pagos.reduce((acc, p) => acc + p.monto, 0))}
            </p>
          </div>
          <Pagination basePath={routes.adminPagos} searchParams={sp} page={page} total={resultado.total} pageSize={PAGE_SIZE} />
        </div>
      ) : (
        <ErrorState title="No pudimos cargar el historial de pagos" />
      )}
    </div>
  );
}
