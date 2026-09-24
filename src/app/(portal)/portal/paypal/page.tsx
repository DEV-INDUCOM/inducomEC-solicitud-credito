import type { Metadata } from "next";
import { Alert } from "@/components/ui/Alert";
import { ErrorState } from "@/components/ui/ErrorState";
import { CashbackCard } from "@/components/portal/CashbackCard";
import { CashbackSteps } from "@/components/portal/CashbackSteps";
import { GarantiaResumenCard } from "@/components/portal/GarantiaResumenCard";
import { PaymentHistory } from "@/components/portal/PaymentHistory";
import { getCashback, getGarantiaResumen, getPagos, getPortalContext } from "@/lib/portal/queries";

export const metadata: Metadata = {
  title: "PayPal",
};

export default async function PaypalPage() {
  const context = await getPortalContext();
  // El layout del portal ya filtra sin-sesión / sin-perfil / error antes de
  // renderizar esta página; esta rama es solo defensa de tipos.
  if (!context.ok) return null;

  const { cliente } = context.data;
  const [cashbackResult, pagosResult, garantiaResult] = await Promise.all([
    getCashback(cliente.id),
    getPagos(cliente.id),
    getGarantiaResumen(cliente.id),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl">Módulo PayPal</h1>
        <p className="mt-2 text-[var(--text-secondary)]">
          Saldo, beneficios e historial de pagos de {cliente.nombre}.
        </p>
      </div>

      <Alert variant="info" title="El saldo no es en tiempo real">
        Los pagos con PayPal se registran automáticamente al confirmarse.
      </Alert>

      {/* Dos beneficios independientes, uno por tarjeta: el cashback es un
       *  saldo que se canjea, la garantía es un ciclo de compras acumuladas. */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {cashbackResult.ok && pagosResult.ok ? (
          <CashbackCard
            cashback={cashbackResult.cashback}
            ultimaActualizacion={pagosResult.pagos[0]?.creadoEn ?? null}
          />
        ) : (
          <ErrorState title="No pudimos cargar tu cashback" />
        )}

        {garantiaResult.ok ? (
          <GarantiaResumenCard ciclo={garantiaResult.resumen.ciclo} />
        ) : (
          <ErrorState title="No pudimos cargar tu garantía" />
        )}
      </div>

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Historial de pagos</h2>
          {pagosResult.ok && pagosResult.pagos.length > 0 && (
            <span className="text-sm text-[var(--text-secondary)]">
              {pagosResult.pagos.length}{" "}
              {pagosResult.pagos.length === 1 ? "transacción registrada" : "transacciones registradas"}
            </span>
          )}
        </div>
        {pagosResult.ok ? (
          <PaymentHistory pagos={pagosResult.pagos} empresaNombre={cliente.nombre} />
        ) : (
          <ErrorState title="No pudimos cargar tu historial de pagos" />
        )}
      </section>

      <CashbackSteps />
    </div>
  );
}
