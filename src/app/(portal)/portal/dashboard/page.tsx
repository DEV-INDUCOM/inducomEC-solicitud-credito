import type { Metadata } from "next";
import { Card, IconTile } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { BalanceCard } from "@/components/portal/BalanceCard";
import { BenefitCard } from "@/components/portal/BenefitCard";
import { CompanySummary } from "@/components/portal/CompanySummary";
import { PaymentHistory } from "@/components/portal/PaymentHistory";
import { StatCard } from "@/components/portal/StatCard";
import { formatFecha } from "@/lib/portal/format";
import { portalNavItems } from "@/lib/portal/nav";
import { getPagos, getPortalContext, getSaldo } from "@/lib/portal/queries";

export const metadata: Metadata = {
  title: "Dashboard",
};

const modulosFuturos = portalNavItems.filter((item) => item.href === null);

export default async function DashboardPage() {
  const context = await getPortalContext();
  // El layout del portal ya filtra sin-sesión / sin-perfil / error antes de
  // renderizar esta página; esta rama es solo defensa de tipos.
  if (!context.ok) return null;

  const { perfil, empresa } = context.data;
  const [saldoResult, pagosResult] = await Promise.all([getSaldo(empresa.id), getPagos(empresa.id)]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl">Bienvenido, {empresa.nombre}</h1>
        <p className="mt-2 text-[var(--text-secondary)]">
          Consulta tu saldo, el historial de pagos y el incentivo activo de tu empresa.
        </p>
      </div>

      {saldoResult.ok && pagosResult.ok ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <BalanceCard
            saldo={saldoResult.saldo}
            ultimaActualizacion={pagosResult.pagos[0]?.creadoEn ?? null}
          />
          <StatCard
            label="Pagos registrados"
            value={pagosResult.pagos.length}
            hint={
              pagosResult.pagos[0]
                ? `Último registrado el ${formatFecha(pagosResult.pagos[0].fecha)}`
                : "Sin pagos aún"
            }
          />
          <BenefitCard incentivo={empresa.incentivoActivo} />
        </div>
      ) : (
        <ErrorState title="No pudimos cargar tu saldo ni tus pagos" />
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[2fr_1fr]">
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Últimos movimientos</h2>
          {pagosResult.ok ? (
            <PaymentHistory pagos={pagosResult.pagos.slice(0, 5)} />
          ) : (
            <ErrorState title="No pudimos cargar tus pagos" />
          )}
        </section>
        <CompanySummary empresa={empresa} perfil={perfil} />
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">Próximamente</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {modulosFuturos.map(({ label, icon: Icon }) => (
            <Card key={label} className="flex flex-col gap-3">
              <IconTile>
                <Icon size={22} stroke={1.75} />
              </IconTile>
              <p className="text-base font-semibold text-[var(--text-primary)]">{label}</p>
              <span className="inline-flex w-fit rounded-full border border-dashed border-[color:var(--state-neutral-border)] bg-[var(--state-neutral-bg)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.04em] text-[var(--state-neutral-text)]">
                Próximamente
              </span>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
