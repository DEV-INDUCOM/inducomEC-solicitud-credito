import type { Metadata } from "next";
import { Alert } from "@/components/ui/Alert";
import { ErrorState } from "@/components/ui/ErrorState";
import { BalanceCard } from "@/components/portal/BalanceCard";
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

  const { cliente } = context.data;
  const [saldoResult, pagosResult] = await Promise.all([getSaldo(cliente.id), getPagos(cliente.id)]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl">Módulo PayPal</h1>
        <p className="mt-2 text-[var(--text-secondary)]">
          Saldo e historial de pagos de {cliente.nombre}.
        </p>
      </div>

      <Alert variant="info" title="El saldo no es en tiempo real">
        Los pagos con PayPal se registran automáticamente al confirmarse. Los demás se
        actualizan cuando INDUCOM los carga de forma manual o por CSV.
      </Alert>

      {saldoResult.ok && pagosResult.ok ? (
        // Una sola tarjeta desde que se quitó el incentivo: se acota el ancho
        // para que no quede un bloque gigante estirado a todo el contenedor.
        <div className="max-w-md">
          <BalanceCard saldo={saldoResult.saldo} ultimaActualizacion={pagosResult.pagos[0]?.creadoEn ?? null} />
        </div>
      ) : (
        <ErrorState title="No pudimos cargar tu saldo" />
      )}

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">Historial de pagos</h2>
        {pagosResult.ok ? (
          <PaymentHistory pagos={pagosResult.pagos} empresaNombre={cliente.nombre} />
        ) : (
          <ErrorState title="No pudimos cargar tu historial de pagos" />
        )}
      </section>
    </div>
  );
}
