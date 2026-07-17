import type { Metadata } from "next";
import { IconFilterOff, IconInfoCircle } from "@tabler/icons-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { Pagination } from "@/components/admin/Pagination";
import { ClientesTable } from "@/components/admin/ClientesTable";
import { formatMonto } from "@/lib/admin/format";
import { incentivoLabel, tipoClienteLabel } from "@/lib/admin/labels";
import { getClientes, getPaises, getTotalAcumuladoGlobal, PAGE_SIZE, type ClientesFiltros } from "@/lib/admin/queries";
import { routes } from "@/lib/config/site";
import type { IncentivoTipo } from "@/lib/admin/types";

export const metadata: Metadata = { title: "Empresas" };

const INCENTIVOS: IncentivoTipo[] = ["cashback_1", "garantia_extendida", "despacho_rapido"];

export default async function AdminEmpresasPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);

  const filtros: ClientesFiltros = {
    q: sp.q,
    paisId: sp.pais ? Number(sp.pais) : undefined,
    incentivo: (sp.incentivo as IncentivoTipo | "sin_incentivo") || undefined,
    tipoCliente: (sp.tipo as "natural" | "juridica") || undefined,
  };

  const [paises, resultado, totalGlobal] = await Promise.all([
    getPaises(),
    getClientes(filtros, page, PAGE_SIZE),
    getTotalAcumuladoGlobal(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl">Empresas</h1>
        <p className="mt-2 text-[var(--text-secondary)]">Mantenimiento del directorio de clientes.</p>
      </div>

      <Card>
        <form className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-end" method="get">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-[var(--text-primary)]">Buscar empresa</span>
            <input
              type="search"
              name="q"
              defaultValue={sp.q ?? ""}
              placeholder="Nombre comercial o identificación…"
              className="h-11 rounded border border-[color:var(--border-strong)] bg-[var(--bg-surface)] px-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus-visible:border-[color:var(--accent)]"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-[var(--text-primary)]">País</span>
            <select
              name="pais"
              defaultValue={sp.pais ?? ""}
              className="h-11 rounded border border-[color:var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)]"
            >
              <option value="">Todos los países</option>
              {paises.map((pais) => (
                <option key={pais.id} value={pais.id}>
                  {pais.nombre}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-[var(--text-primary)]">Incentivo</span>
            <select
              name="incentivo"
              defaultValue={sp.incentivo ?? ""}
              className="h-11 rounded border border-[color:var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)]"
            >
              <option value="">Cualquier incentivo</option>
              <option value="sin_incentivo">Sin incentivo</option>
              {INCENTIVOS.map((incentivo) => (
                <option key={incentivo} value={incentivo}>
                  {incentivoLabel[incentivo]}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-[var(--text-primary)]">Tipo de cliente</span>
            <select
              name="tipo"
              defaultValue={sp.tipo ?? ""}
              className="h-11 rounded border border-[color:var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)]"
            >
              <option value="">Todos los tipos</option>
              <option value="natural">{tipoClienteLabel.natural}</option>
              <option value="juridica">{tipoClienteLabel.juridica}</option>
            </select>
          </label>

          <div className="col-span-full flex justify-end gap-3">
            <a href={routes.adminEmpresas}>
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
          <ClientesTable items={resultado.items} />
          <Pagination
            basePath={routes.adminEmpresas}
            searchParams={sp}
            page={page}
            total={resultado.total}
            pageSize={PAGE_SIZE}
          />
        </div>
      ) : (
        <ErrorState title="No pudimos cargar el directorio de empresas" />
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
        <Card className="flex gap-3 border-l-[3px] border-l-brand-navy-600 bg-[var(--state-info-bg)]">
          <IconInfoCircle size={20} className="mt-0.5 shrink-0 text-[var(--state-info-text)]" />
          <div>
            <p className="text-sm font-semibold text-[var(--state-info-text)]">Gestión de directorio</p>
            <p className="mt-1 text-sm leading-normal text-[var(--state-info-text)]">
              Las empresas se habilitan automáticamente en este directorio cuando su solicitud de crédito es
              aprobada. No es posible crear registros de forma manual.
            </p>
          </div>
        </Card>
        <Card shadow className="bg-brand-orange-50 border-[color:var(--accent-border)]">
          <p className="text-xs font-semibold uppercase tracking-[0.04em] text-brand-orange-700">
            Total acumulado global
          </p>
          <p className="mt-2 font-mono text-3xl font-medium tabular-nums text-brand-orange-700">
            {formatMonto(totalGlobal)}
          </p>
        </Card>
      </div>
    </div>
  );
}
