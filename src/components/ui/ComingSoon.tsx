import type { ReactNode } from "react";

export function ComingSoon({
  icon,
  title,
  description,
}: {
  icon?: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-4 py-16 text-center">
      {icon}
      <span className="inline-flex rounded-full border border-[color:var(--state-neutral-border)] bg-[var(--state-neutral-bg)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.04em] text-[var(--state-neutral-text)]">
        Próximamente
      </span>
      <h2 className="text-2xl font-semibold">{title}</h2>
      <p className="text-[var(--text-secondary)] leading-normal">{description}</p>
    </div>
  );
}
