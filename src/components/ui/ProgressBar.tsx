import { cn } from "@/lib/utils/cn";

/** Barra de progreso simple. El relleno usa `--highlight` (azul #1F5BD8 en
 *  el portal, navy #00005B fuera de él) y no verde: el verde queda reservado
 *  para los badges de estado "desbloqueado", igual que en el resto del sistema. */
export function ProgressBar({
  value,
  label,
  className,
}: {
  /** 0–100. Se recorta al rango por si llega un cálculo fuera de escala. */
  value: number;
  /** Texto para lector de pantalla; el porcentaje visible va aparte. */
  label?: string;
  className?: string;
}) {
  const pct = Math.min(Math.max(value, 0), 100);

  return (
    <div
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cn("h-2 w-full overflow-hidden rounded-full bg-[var(--bg-medium)]", className)}
    >
      <div
        className="h-full rounded-full bg-[var(--highlight)] transition-[width] duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
