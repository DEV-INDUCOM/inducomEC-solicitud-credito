import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type StatusTone = "info" | "warning" | "success" | "danger" | "neutral";

/** Un tono = un color en todo el sistema (ver design-portal.md sección 3):
 *  fondo tenue + texto oscuro de la misma familia, nunca sólido saturado. */
const toneClasses: Record<StatusTone, string> = {
  info: "bg-[var(--state-info-bg)] text-[var(--state-info-text)] border-[color:var(--state-info-border)]",
  warning:
    "bg-[var(--state-warning-bg)] text-[var(--state-warning-text)] border-[color:var(--state-warning-border)]",
  success:
    "bg-[var(--state-success-bg)] text-[var(--state-success-text)] border-[color:var(--state-success-border)]",
  danger: "bg-[var(--state-danger-bg)] text-[var(--state-danger-text)] border-[color:var(--state-danger-border)]",
  neutral:
    "bg-[var(--state-neutral-bg)] text-[var(--state-neutral-text)] border-[color:var(--state-neutral-border)]",
};

export function StatusBadge({
  tone,
  children,
  icon,
  className,
}: {
  tone: StatusTone;
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.04em]",
        toneClasses[tone],
        className
      )}
    >
      {icon}
      {children}
    </span>
  );
}
