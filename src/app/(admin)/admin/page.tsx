import type { Metadata } from "next";
import Link from "next/link";
import { IconClipboardList, IconEye, IconBuildingSkyscraper, IconWallet, IconQrcode } from "@tabler/icons-react";
import { Card, IconTile } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { StatCard } from "@/components/portal/StatCard";
import { SolicitudesTable } from "@/components/admin/SolicitudesTable";
import { formatFecha, formatMonto } from "@/lib/admin/format";
import { metodoPagoLabel, origenPagoLabel } from "@/lib/admin/labels";
import { getCodigosStats, getResumenStats, getUltimasSolicitudes, getUltimosPagos } from "@/lib/admin/queries";
import { routes } from "@/lib/config/site";

export const metadata: Metadata = { title: "Resumen" };

export default async function AdminResumenPage() {
  const [stats, ultimasSolicitudes, ultimosPagos, codigosStats] = await Promise.all([
    getResumenStats(),
    getUltimasSolicitudes(5),
    getUltimosPagos(4),
    getCodigosStats(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl">Resumen</h1>
        <p className="mt-2 text-[var(--text-secondary)]">Dashboard administrativo del portal INDUCOM.</p>
      </div>

      {stats.ok ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Solicitudes"
            value={stats.data.solicitudesEstaSemana}
            hint="Esta semana"
            icon={
              <IconTile variant="accent">
                <IconClipboardList size={18} stroke={1.75} />
              </IconTile>
            }
          />
          <StatCard
            label="En revisión"
            value={stats.data.solicitudesEnRevision}
            hint="Solicitudes pendientes"
            icon={
              <IconTile>
                <IconEye size={18} stroke={1.75} />
              </IconTile>
            }
          />
          <StatCard
            label="Empresas"
            value={stats.data.totalClientes}
            hint={`${stats.data.clientesConUsuarios} con usuarios activos`}
            icon={
              <IconTile>
                <IconBuildingSkyscraper size={18} stroke={1.75} />
              </IconTile>
            }
          />
          <StatCard
            label="Pagos"
            value={formatMonto(stats.data.totalPagosEsteMes)}
            hint={`${stats.data.cantidadPagosEsteMes} pagos este mes`}
            icon={
              <IconTile>
                <IconWallet size={18} stroke={1.75} />
              </IconTile>
            }
          />
        </div>
      ) : (
        <ErrorState title="No pudimos cargar las métricas del resumen" />
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">Últimas solicitudes de crédito</h2>
            <Link href={routes.adminSolicitudes} className="text-sm font-semibold text-[var(--accent)] hover:text-[var(--link-hover)]">
              Ver todas →
            </Link>
          </div>
          {ultimasSolicitudes.ok ? (
            <SolicitudesTable items={ultimasSolicitudes.items} />
          ) : (
            <ErrorState title="No pudimos cargar las solicitudes recientes" />
          )}
        </section>

        <div className="flex flex-col gap-6">
          <section className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">Últimos pagos</h2>
            <Card className="flex flex-col divide-y divide-[color:var(--border)] p-0">
              {ultimosPagos.ok && ultimosPagos.pagos.length > 0 ? (
                ultimosPagos.pagos.map((pago) => (
                  <div key={pago.id} className="flex items-center justify-between gap-3 px-5 py-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[var(--text-primary)]">{pago.clienteNombre}</p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {pago.metodoPago ? metodoPagoLabel[pago.metodoPago] : origenPagoLabel[pago.origen]}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-mono text-sm font-semibold tabular-nums text-[var(--text-primary)]">
                        {formatMonto(pago.monto)}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">{formatFecha(pago.fecha)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="px-5 py-8 text-center text-sm text-[var(--text-secondary)]">Aún no hay pagos registrados.</p>
              )}
            </Card>
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">Códigos de invitación</h2>
            <Card shadow className="flex flex-col gap-4 bg-brand-navy-900 text-[var(--text-on-dark)]">
              <div>
                <p className="font-mono text-4xl font-medium tabular-nums">{codigosStats.activosHoy}</p>
                <p className="text-sm text-slate-300">Códigos activos</p>
              </div>
              <Link href={routes.adminCodigos}>
                <Button variant="primary" block>
                  <IconQrcode size={18} stroke={1.75} />
                  Generar código
                </Button>
              </Link>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
