import { IconGift, IconPigMoney } from "@tabler/icons-react";
import { Card, IconTile } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { CASHBACK_MINIMO_CANJE, progresoCashback } from "@/lib/portal/beneficios";
import { formatFecha, formatMonto } from "@/lib/portal/format";
import type { PortalCashback } from "@/lib/portal/types";

/** Tarjeta de cashback del módulo PayPal. Solo informa saldo y estado de
 *  canje: por decisión funcional NO enlaza a la pantalla de garantía, son
 *  dos beneficios independientes. */
export function CashbackCard({
  cashback,
  ultimaActualizacion,
}: {
  cashback: PortalCashback;
  ultimaActualizacion: string | null;
}) {
  const progreso = progresoCashback(cashback.disponible);

  return (
    <Card shadow className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <IconTile variant="neutral" shape="circle">
          <IconPigMoney size={22} stroke={1.75} />
        </IconTile>
        <div>
          <p className="font-mono text-xs font-semibold tracking-[0.06em] text-[var(--text-secondary)] uppercase">
            Cashback acumulado
          </p>
          <p className="font-mono text-4xl font-medium tabular-nums text-[var(--text-primary)]">
            {formatMonto(cashback.disponible)}
          </p>
        </div>
      </div>

      {/* El saldo depende de que el pago esté confirmado y cargado: decirlo
       *  siempre, nunca insinuar tiempo real (design-portal.md sección 6). */}
      <p className="text-sm text-[var(--text-secondary)]">
        {ultimaActualizacion
          ? `Saldo actualizado al ${formatFecha(ultimaActualizacion)}`
          : "Aún no se ha registrado ningún pago."}
      </p>

      <div className="flex flex-col gap-3 rounded-lg bg-[var(--bg-surface-alt)] p-4">
        {cashback.puedeCanjear ? (
          <p className="flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
            <IconGift size={18} stroke={1.75} aria-hidden />
            Ya puedes redimir tu cashback
          </p>
        ) : (
          <div className="flex items-baseline justify-between gap-3">
            <p className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
              <IconGift size={18} stroke={1.75} aria-hidden />
              Te faltan{" "}
              <span className="font-mono font-semibold tabular-nums">
                {formatMonto(cashback.faltanteParaCanje)}
              </span>
            </p>
            <span className="font-mono text-sm tabular-nums text-[var(--text-secondary)]">{progreso}%</span>
          </div>
        )}

        <ProgressBar value={progreso} label="Progreso hacia el mínimo de canje" />

        <p className="text-xs text-[var(--text-secondary)]">
          {cashback.puedeCanjear
            ? "Aplícalo en tu próxima orden de compra."
            : "para poder redimir tu cashback."}
        </p>

        <div className="flex items-center justify-between gap-3 border-t border-[color:var(--border)] pt-3">
          <span className="text-xs text-[var(--text-secondary)]">
            Monto mínimo de canje: {formatMonto(CASHBACK_MINIMO_CANJE)}
          </span>
          {/* El canje todavía no está habilitado en el portal: se muestra el
           *  estado real en vez de un botón que no haría nada. */}
          <StatusBadge tone={cashback.puedeCanjear ? "success" : "neutral"}>
            {cashback.puedeCanjear ? "Disponible" : "Bloqueado"}
          </StatusBadge>
        </div>
      </div>
    </Card>
  );
}
