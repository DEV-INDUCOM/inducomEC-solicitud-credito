import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { IconBuildingSkyscraper, IconMail, IconWorld } from "@tabler/icons-react";
import { BackLink } from "@/components/ui/BackLink";
import { Card, IconTile } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PagosTable } from "@/components/admin/PagosTable";
import { formatMonto } from "@/lib/admin/format";
import { incentivoLabel, tipoClienteLabel } from "@/lib/admin/labels";
import { getClienteDetalle } from "@/lib/admin/queries";
import { routes } from "@/lib/config/site";

export const metadata: Metadata = { title: "Detalle de empresa" };

export default async function AdminEmpresaDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getClienteDetalle(id);
  if (!result.ok) notFound();

  const cliente = result.data;

  return (
    <div className="flex flex-col gap-6">
      <BackLink href={routes.adminEmpresas}>Volver a empresas</BackLink>

      <Card shadow className="bg-brand-navy-900 text-[var(--text-on-dark)]">
        <div className="flex items-start gap-4">
          <IconTile variant="onDark">
            <IconBuildingSkyscraper size={22} stroke={1.75} />
          </IconTile>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl">{cliente.nombre}</h1>
              {cliente.incentivoActivo ? (
                <StatusBadge tone="success">{incentivoLabel[cliente.incentivoActivo]}</StatusBadge>
              ) : (
                <StatusBadge tone="neutral">Sin incentivo</StatusBadge>
              )}
            </div>
            <p className="mt-2 font-mono text-sm text-slate-300">
              {tipoClienteLabel[cliente.tipoCliente]} · {cliente.identificacion}
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">Historial de pagos</h2>
            <p className="font-mono text-sm text-[var(--text-secondary)]">Saldo: {formatMonto(cliente.saldo)}</p>
          </div>
          <PagosTable pagos={cliente.pagos} showCliente={false} />
        </section>

        <div className="flex flex-col gap-6">
          <Card shadow className="flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--text-secondary)]">
              Información de la cuenta
            </p>
            <ul className="flex flex-col gap-3">
              <li className="flex items-center gap-3">
                <IconTile variant="neutral">
                  <IconWorld size={18} stroke={1.75} />
                </IconTile>
                <div className="min-w-0">
                  <p className="text-xs text-[var(--text-muted)]">País</p>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{cliente.pais ?? "No disponible"}</p>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <IconTile variant="neutral">
                  <IconMail size={18} stroke={1.75} />
                </IconTile>
                <div className="min-w-0">
                  <p className="text-xs text-[var(--text-muted)]">Correo</p>
                  <p className="truncate text-sm font-medium text-[var(--text-primary)]">{cliente.email}</p>
                </div>
              </li>
            </ul>
          </Card>

          <Card className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--text-secondary)]">
              Usuarios del portal ({cliente.usuarios.length})
            </p>
            {cliente.usuarios.length === 0 ? (
              <p className="text-sm text-[var(--text-secondary)]">Aún no se ha registrado ningún usuario.</p>
            ) : (
              <ul className="flex flex-col divide-y divide-[color:var(--border)]">
                {cliente.usuarios.map((usuario) => (
                  <li key={usuario.id} className="py-2 text-sm text-[var(--text-primary)]">
                    {usuario.email}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
