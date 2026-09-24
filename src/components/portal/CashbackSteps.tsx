import { IconChartBar, IconCreditCard, IconWallet } from "@tabler/icons-react";
import { Card, IconTile } from "@/components/ui/Card";
import { CASHBACK_MINIMO_CANJE } from "@/lib/portal/beneficios";
import { formatMonto } from "@/lib/portal/format";

/** Explicación del cashback en tres pasos. Texto fijo: describe el programa,
 *  no datos del cliente. */
const pasos = [
  {
    icon: IconCreditCard,
    titulo: "Realiza pagos mediante PayPal",
    descripcion:
      "Liquida tus cotizaciones y facturas de manera ágil y segura utilizando PayPal.",
    pie: "Confirmación inmediata del pago",
  },
  {
    icon: IconChartBar,
    titulo: "Acumula 1% de cashback",
    descripcion:
      "El sistema acredita automáticamente el 1% de cada pago confirmado a tu saldo INDUCOM.",
    pie: "Sin límite de acumulación anual",
  },
  {
    icon: IconWallet,
    titulo: "Redime tu saldo disponible",
    descripcion: `Al alcanzar un mínimo de ${formatMonto(
      CASHBACK_MINIMO_CANJE
    )}, aplica tu saldo en tus próximas órdenes de compra.`,
    pie: "Descuento aplicado en tu cotización",
  },
];

export function CashbackSteps() {
  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">Cómo funciona tu cashback</h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Beneficio acumulado por cada compra liquidada mediante PayPal.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {pasos.map(({ icon: Icon, titulo, descripcion, pie }, indice) => (
          <Card key={titulo} className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--action-primary)] font-mono text-sm font-semibold text-[var(--action-primary-text)]">
                {indice + 1}
              </span>
              <IconTile variant="neutral">
                <Icon size={20} stroke={1.75} />
              </IconTile>
            </div>
            <p className="text-base font-semibold text-[var(--text-primary)]">{titulo}</p>
            <p className="text-sm text-[var(--text-secondary)] leading-normal">{descripcion}</p>
            <p className="mt-auto border-t border-[color:var(--border)] pt-3 text-xs text-[var(--text-muted)]">
              {pie}
            </p>
          </Card>
        ))}
      </div>
    </section>
  );
}
