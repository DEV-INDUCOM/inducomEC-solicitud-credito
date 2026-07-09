import { cn } from "@/lib/utils/cn";

export type ToggleChipVariant = "solid" | "soft";

export function ToggleChip({
  active,
  label,
  onClick,
  variant = "solid",
  className,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  variant?: ToggleChipVariant;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "border font-semibold whitespace-nowrap transition-colors",
        variant === "solid"
          ? cn(
              "rounded-full px-4 py-2 text-sm",
              active
                ? "border-[color:var(--action-primary)] bg-[var(--action-primary)] text-white"
                : "border-[color:var(--border-strong)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:border-[color:var(--action-primary)]"
            )
          : cn(
              "rounded px-3 py-2 text-xs",
              active
                ? "border-[color:var(--action-primary)] bg-[var(--accent-soft)] text-[var(--action-primary)]"
                : "border-[color:var(--border-strong)] bg-[var(--bg-surface)] text-[var(--text-muted)]"
            ),
        className
      )}
    >
      {label}
    </button>
  );
}
