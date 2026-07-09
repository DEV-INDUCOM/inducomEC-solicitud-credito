import { cn } from "@/lib/utils/cn";

export function SelectCard({
  selected,
  title,
  description,
  onClick,
  className,
}: {
  selected: boolean;
  title: string;
  description?: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "flex flex-col gap-1.5 rounded-lg border p-4 text-left transition-colors",
        selected
          ? "border-2 border-[color:var(--accent)] bg-[var(--accent-soft)]"
          : "border-[color:var(--border-strong)] bg-[var(--bg-surface)] hover:border-[color:var(--action-primary)]",
        className
      )}
    >
      <span className="flex items-center justify-between gap-2">
        <span className="text-base font-semibold text-[var(--text-primary)]">{title}</span>
        {selected && (
          <span className="text-lg text-[var(--accent)]" aria-hidden="true">
            ●
          </span>
        )}
      </span>
      {description && <span className="text-sm text-[var(--text-secondary)]">{description}</span>}
    </button>
  );
}
