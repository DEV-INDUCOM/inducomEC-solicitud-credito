"use client";

import { useState, useTransition } from "react";
import { IconTrophy, IconX } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { IconTile } from "@/components/ui/Card";
import { marcarGarantiaVista } from "@/lib/portal/actions";
import { formatFecha, formatMonto } from "@/lib/portal/format";
import type { PortalGarantia } from "@/lib/portal/types";

/** Aviso de beneficio desbloqueado. Se muestra una sola vez: al cerrarlo se
 *  marca `vista_en` en la base, no en el navegador, para que no reaparezca en
 *  otro dispositivo ni se pierda si el cliente limpia el storage.
 *
 *  Si el nuevo beneficio desplazó a otro (máximo 2 extensiones vigentes), el
 *  mismo modal lo dice: esa pérdida nunca debe ocurrir en silencio. */
export function GarantiaDesbloqueadaModal({
  garantia,
  desplazada,
}: {
  garantia: PortalGarantia;
  desplazada: PortalGarantia | null;
}) {
  const [abierto, setAbierto] = useState(true);
  const [, startTransition] = useTransition();

  function cerrar() {
    setAbierto(false);
    // No se espera la respuesta: el modal ya se cerró y un fallo solo
    // significa que volverá a aparecer la próxima vez.
    startTransition(() => {
      void marcarGarantiaVista(garantia.id);
    });
  }

  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={cerrar} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="garantia-desbloqueada-titulo"
        className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-[var(--bg-surface)] p-6 shadow-lg"
      >
        <div className="flex justify-end">
          <button
            type="button"
            onClick={cerrar}
            aria-label="Cerrar"
            className="inline-flex h-9 w-9 items-center justify-center rounded text-[var(--text-secondary)] hover:bg-[var(--bg-surface-alt)]"
          >
            <IconX size={20} />
          </button>
        </div>

        <div className="flex flex-col items-center gap-3 text-center">
          <IconTile variant="accent" shape="circle">
            <IconTrophy size={24} stroke={1.75} />
          </IconTile>
          <h2 id="garantia-desbloqueada-titulo" className="text-2xl font-semibold">
            ¡Felicitaciones!
          </h2>
          <p className="text-base font-medium text-[var(--text-primary)]">
            Has desbloqueado una garantía extendida
          </p>
          <p className="text-sm text-[var(--text-secondary)] leading-normal">
            Alcanzaste {formatMonto(garantia.umbral)} acumulados en compras con PayPal en este ciclo.
            Este beneficio se aplica a la cotización que completó el umbral.
          </p>
        </div>

        <div className="mt-5 flex flex-col gap-3 rounded-lg bg-[var(--bg-surface-alt)] p-4">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.06em] text-[var(--text-secondary)]">
            Detalle de la compra beneficiada
          </p>
          <dl className="flex flex-col gap-2 text-sm">
            {[
              { label: "Cotización", valor: garantia.cotizacionNumero ?? "—", mono: true },
              { label: "Descripción", valor: garantia.dealNombre ?? "—", mono: false },
              { label: "Fecha de pago", valor: formatFecha(garantia.fechaInicio), mono: false },
              { label: "Monto de la compra", valor: formatMonto(garantia.montoPago), mono: true },
              { label: "Acumulado del ciclo", valor: formatMonto(garantia.acumuladoAlcanzado), mono: true },
            ].map(({ label, valor, mono }) => (
              <div key={label} className="flex items-baseline justify-between gap-4">
                <dt className="shrink-0 text-[var(--text-secondary)]">{label}</dt>
                <dd
                  className={
                    mono
                      ? "text-right font-mono tabular-nums text-[var(--text-primary)]"
                      : "text-right text-[var(--text-primary)]"
                  }
                >
                  {valor}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3 rounded-lg border border-[color:var(--border)] p-4 text-center">
          <div>
            <p className="font-mono text-2xl font-medium tabular-nums text-[var(--text-primary)]">
              {garantia.mesesFabrica}
            </p>
            <p className="text-xs text-[var(--text-secondary)]">meses de fábrica</p>
          </div>
          <div>
            <p className="font-mono text-2xl font-medium tabular-nums text-[var(--state-success-text)]">
              +{garantia.mesesExtension}
            </p>
            <p className="text-xs text-[var(--text-secondary)]">meses de extensión</p>
          </div>
          <div className="rounded bg-[var(--state-info-bg)]">
            <p className="font-mono text-2xl font-medium tabular-nums text-[var(--state-info-text)]">
              {garantia.mesesTotales}
            </p>
            <p className="text-xs text-[var(--state-info-text)]">garantía total</p>
          </div>
        </div>

        <p className="mt-4 rounded bg-[var(--state-info-bg)] px-4 py-3 text-sm text-[var(--state-info-text)] leading-normal">
          <strong className="font-semibold">Importante:</strong> los {garantia.mesesExtension} meses
          adicionales aplican exclusivamente a la cotización{" "}
          <span className="font-mono">{garantia.cotizacionNumero ?? "beneficiada"}</span>. Tus demás
          compras mantienen su garantía estándar de {garantia.mesesFabrica} meses.
        </p>

        {desplazada && (
          <p className="mt-3 rounded bg-[var(--state-warning-bg)] px-4 py-3 text-sm text-[var(--state-warning-text)] leading-normal">
            Solo puedes tener dos garantías extendidas vigentes a la vez. Para dar lugar a esta, la
            extensión de la cotización{" "}
            <span className="font-mono">{desplazada.cotizacionNumero ?? "anterior"}</span> deja de
            estar vigente. Su garantía de fábrica de {desplazada.mesesFabrica} meses se mantiene sin
            cambios, hasta el {formatFecha(desplazada.fechaFinFabrica)}.
          </p>
        )}

        <Button className="mt-5" onClick={cerrar} block>
          Entendido
        </Button>
      </div>
    </div>
  );
}
