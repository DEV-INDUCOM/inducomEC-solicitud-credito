import type { Metadata } from "next";
import { Alert } from "@/components/ui/Alert";
import { ErrorState } from "@/components/ui/ErrorState";
import { BalanceCard } from "@/components/portal/BalanceCard";
import { BenefitCard } from "@/components/portal/BenefitCard";
import { IncentiveComparison } from "@/components/portal/ComparisonCard";
import { PaymentHistory } from "@/components/portal/PaymentHistory";
import { getPagos, getPortalContext, getSaldo } from "@/lib/portal/queries";

export const metadata: Metadata = {
  title: "PayPal",
};

export default async function PaypalPage() {
  const context = await getPortalContext();
  // El layout del portal ya filtra sin-sesión / sin-perfil / error antes de
  // renderizar esta página; esta rama es solo defensa de tipos.
  if (!context.ok) return null;

  const { empresa } = context.data;
  const [saldoResult, pagosResult] = await Promise.all([getSaldo(empresa.id), getPagos(empresa.id)]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl">Módulo PayPal</h1>
        <p className="mt-2 text-[var(--text-secondary)]">
          Saldo derivado de pagos, historial e incentivo activo de {empresa.nombre}.
        </p>
      </div>

      <Alert variant="info" title="El saldo no es en tiempo real">
        Se actualiza cuando INDUCOM carga los pagos de forma manual o por CSV.
      </Alert>

      {saldoResult.ok && pagosResult.ok ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <BalanceCard saldo={saldoResult.saldo} ultimaActualizacion={pagosResult.pagos[0]?.creadoEn ?? null} />
          <BenefitCard incentivo={empresa.incentivoActivo} />
        </div>
      ) : (
        <ErrorState title="No pudimos cargar tu saldo ni tu incentivo" />
      )}

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">Historial de pagos</h2>
        {pagosResult.ok ? (
          <PaymentHistory pagos={pagosResult.pagos} />
        ) : (
          <ErrorState title="No pudimos cargar tu historial de pagos" />
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">Comparador de incentivos</h2>
        <p className="text-sm text-[var(--text-secondary)] leading-normal">
          Estos son los beneficios disponibles para clientes INDUCOM. El resaltado en acero muestra el que
          está activo actualmente para tu empresa.
        </p>
        <IncentiveComparison activo={empresa.incentivoActivo} />
      </section>
    </div>
  );
}
