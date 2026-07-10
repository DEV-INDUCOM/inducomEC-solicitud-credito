import type { ReactNode } from "react";

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-[color:var(--border-strong)] bg-[var(--bg-page-soft)] px-6 py-12 text-center">
      {icon}
      <p className="text-base font-semibold text-[var(--text-primary)]">{title}</p>
      {description && (
        <p className="max-w-sm text-sm text-[var(--text-secondary)] leading-normal">{description}</p>
      )}
      {action}
    </div>
  );
}
