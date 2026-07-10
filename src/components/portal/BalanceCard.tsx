import { Card } from "@/components/ui/Card";
import { formatFecha, formatMonto } from "@/lib/portal/format";

export function BalanceCard({
  saldo,
  ultimaActualizacion,
}: {
  saldo: number;
  ultimaActualizacion: string | null;
}) {
  return (
    <Card shadow className="flex flex-col gap-2">
      <p className="font-mono text-xs font-semibold tracking-[0.06em] text-[var(--text-secondary)] uppercase">
        Saldo acumulado
      </p>
      <p className="font-mono text-4xl font-medium tabular-nums text-[var(--text-primary)]">
        {formatMonto(saldo)}
      </p>
      {/* El saldo se carga manual/CSV, nunca en tiempo real: decirlo siempre
       *  (ver consideraciones-tecnicas y design-portal.md, tablas PayPal). */}
      <p className="text-sm text-[var(--text-secondary)]">
        {ultimaActualizacion
          ? `Saldo actualizado al ${formatFecha(ultimaActualizacion)}`
          : "Aún no se ha cargado ningún pago."}
      </p>
    </Card>
  );
}
