import type { ReactNode } from "react";
import { IconCheck, IconInfoCircle, IconRefresh, IconRosetteDiscountCheck } from "@tabler/icons-react";
import { Card, IconTile, type IconTileVariant } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils/cn";
import { UMBRAL_10K, UMBRAL_5K, faltanteProximoUmbral, progresoCiclo } from "@/lib/portal/beneficios";
import { formatMonto } from "@/lib/portal/format";
import type { PortalCicloGarantia } from "@/lib/portal/types";

/** Anillo de progreso del ciclo (v2). Es el indicador accesible de la
 *  tarjeta (role="progressbar"); la barra con hitos de la derecha lo repite
 *  en forma lineal y por eso va aria-hidden. */
function AnilloProgreso({ progreso }: { progreso: number }) {
  const radio = 52;
  const circunferencia = 2 * Math.PI * radio;

  return (
    <div
      role="progressbar"
      aria-valuenow={progreso}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Progreso del ciclo de garantía"
      className="relative h-36 w-36"
    >
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden>
        <circle cx={60} cy={60} r={radio} fill="none" stroke="var(--bg-medium)" strokeWidth={12} />
        <circle
          cx={60}
          cy={60}
          r={radio}
          fill="none"
          stroke="var(--highlight)"
          strokeWidth={12}
          // Con poco avance el extremo redondo se ve como una mancha: recto.
          strokeLinecap={progreso < 8 ? "butt" : "round"}
          strokeDasharray={circunferencia}
          // Con 0% no se dibuja nada (un linecap redondo dejaría un punto).
          strokeDashoffset={progreso === 0 ? circunferencia : circunferencia * (1 - progreso / 100)}
          className="transition-[stroke-dashoffset] duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-display text-3xl font-semibold tabular-nums text-[var(--text-primary)]">
          {progreso}%
        </span>
        <span className="text-xs leading-tight text-[var(--text-secondary)]">
          del ciclo
          <br />
          completado
        </span>
      </div>
    </div>
  );
}

/** Marca de umbral sobre la pista. Los dos hitos caen siempre en 50% y 100%
 *  porque la escala de la barra es fija: 0 → USD 10.000. */
function HitoPunto({ desbloqueado, posicion }: { desbloqueado: boolean; posicion: string }) {
  return (
    <span
      className={cn(
        "absolute top-1/2 flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2",
        desbloqueado
          ? "border-[color:var(--state-success-border)] bg-[var(--state-success-bg)] text-[var(--state-success-text)]"
          : "border-[color:var(--border-strong)] bg-[var(--bg-surface)]"
      )}
      style={{ left: posicion }}
      aria-hidden
    >
      {desbloqueado && <IconCheck size={12} stroke={3} />}
    </span>
  );
}

/** Etiqueta bajo cada hito: monto, meses y estado. */
function HitoEtiqueta({
  monto,
  meses,
  desbloqueado,
  alinear,
}: {
  monto: number;
  meses: number;
  desbloqueado: boolean;
  alinear: "left" | "center" | "right";
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-0.5 text-xs",
        alinear === "left" && "items-start text-left",
        alinear === "center" && "items-center text-center",
        alinear === "right" && "items-end text-right"
      )}
    >
      <span className="font-semibold tabular-nums text-[var(--text-primary)]">{formatMonto(monto)}</span>
      {meses > 0 && (
        <>
          <span className="font-medium text-[var(--text-primary)]">+{meses} meses</span>
          <span className="text-[var(--text-secondary)]">de garantía</span>
          <StatusBadge tone={desbloqueado ? "success" : "neutral"} className="mt-1">
            {desbloqueado ? "Desbloqueado" : "Pendiente"}
          </StatusBadge>
        </>
      )}
    </div>
  );
}

/** Nota explicativa de una regla del programa (fondo alterno, sin borde). */
function Regla({
  icono,
  variante,
  titulo,
  children,
}: {
  icono: ReactNode;
  variante: IconTileVariant;
  titulo: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 rounded-[var(--radius-lg)] bg-[var(--bg-surface-alt)] p-4">
      <IconTile variant={variante}>
        {icono}
      </IconTile>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[var(--text-primary)]">{titulo}</p>
        <p className="mt-1 text-sm leading-normal text-[var(--text-secondary)]">{children}</p>
      </div>
    </div>
  );
}

/** Tarjeta principal del módulo (v2): a la izquierda el estado del ciclo en
 *  anillo; a la derecha la barra con los dos hitos y las reglas del programa. */
export function GarantiaCicloCard({ ciclo }: { ciclo: PortalCicloGarantia }) {
  const progreso = progresoCiclo(ciclo.acumulado);
  const proximo = faltanteProximoUmbral(
    ciclo.acumulado,
    ciclo.umbral5kDesbloqueado,
    ciclo.umbral10kDesbloqueado
  );

  return (
    <Card className="grid grid-cols-1 gap-8 lg:grid-cols-[17rem_1fr] lg:gap-0">
      {/* Columna izquierda: resumen del ciclo. */}
      <div className="flex flex-col items-center gap-4 text-center lg:border-r lg:border-[color:var(--border)] lg:pr-8">
        <p className="font-mono text-xs font-semibold tracking-[0.06em] text-[var(--text-secondary)] uppercase">
          Ciclo {ciclo.numero}
        </p>
        <AnilloProgreso progreso={progreso} />
        <div>
          <p className="font-display text-2xl font-semibold tabular-nums text-[var(--text-primary)]">
            {formatMonto(ciclo.acumulado)}
          </p>
          <p className="text-sm text-[var(--text-secondary)]">de {formatMonto(UMBRAL_10K)} en compras PayPal</p>
        </div>
        <div className="flex w-full items-start gap-2 rounded-[var(--radius-lg)] border border-[color:var(--state-info-border)] bg-[var(--state-info-bg)] p-3 text-left">
          <IconInfoCircle size={18} stroke={1.75} aria-hidden className="mt-0.5 shrink-0 text-[var(--state-info-text)]" />
          <p className="text-sm text-[var(--state-info-text)]">
            {proximo ? (
              <>
                Te faltan <span className="font-semibold tabular-nums">{formatMonto(proximo.faltante)}</span> para
                el {ciclo.umbral5kDesbloqueado ? "segundo" : "primer"} beneficio.
              </>
            ) : (
              "Completaste los beneficios de este ciclo."
            )}
          </p>
        </div>
      </div>

      {/* Columna derecha: barra con hitos y reglas. */}
      <div className="flex flex-col gap-6 lg:pl-8">
        <div>
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Progreso del ciclo actual</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Acumula tus compras con PayPal y desbloquea meses adicionales de garantía.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {/* Pista con el avance, la posición actual y los dos hitos. El
           *  padding lateral evita que los puntos de 0% y 100% se corten. */}
          <div className="relative mx-2.5 py-2" aria-hidden>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--bg-medium)]">
              <div
                className="h-full rounded-full bg-[var(--highlight)] transition-[width] duration-500"
                style={{ width: `${progreso}%` }}
              />
            </div>
            <HitoPunto desbloqueado={ciclo.umbral5kDesbloqueado} posicion="50%" />
            <HitoPunto desbloqueado={ciclo.umbral10kDesbloqueado} posicion="100%" />
            {/* Posición actual: solo entre hitos, para no tapar sus marcas. */}
            {progreso > 0 && progreso < 100 && progreso !== 50 && (
              <span
                className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--highlight)] ring-4 ring-[var(--highlight-soft)]"
                style={{ left: `${progreso}%` }}
              />
            )}
          </div>

          <div className="grid grid-cols-3">
            <HitoEtiqueta monto={0} meses={0} desbloqueado={false} alinear="left" />
            <HitoEtiqueta monto={UMBRAL_5K} meses={6} desbloqueado={ciclo.umbral5kDesbloqueado} alinear="center" />
            <HitoEtiqueta monto={UMBRAL_10K} meses={12} desbloqueado={ciclo.umbral10kDesbloqueado} alinear="right" />
          </div>
        </div>

        {/* Reglas reales del programa (ver beneficios.ts y la migración). */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Regla icono={<IconRefresh size={20} stroke={1.75} />} variante="highlight" titulo="Renovación ilimitada">
            Al completar {formatMonto(UMBRAL_10K)} el ciclo vuelve a cero y empiezas uno nuevo, sin perder las
            garantías que ya obtuviste.
          </Regla>
          <Regla
            icono={<IconRosetteDiscountCheck size={20} stroke={1.75} />}
            variante="accent"
            titulo="Asignación directa"
          >
            Los meses adicionales se asignan a la cotización cuyo pago alcanza cada umbral.
          </Regla>
        </div>
      </div>
    </Card>
  );
}
