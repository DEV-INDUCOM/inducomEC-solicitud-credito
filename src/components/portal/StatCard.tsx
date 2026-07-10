import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";

export function StatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
}) {
  return (
    <Card className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <p className="font-mono text-xs font-semibold tracking-[0.06em] text-[var(--text-secondary)] uppercase">
          {label}
        </p>
        {icon}
      </div>
      <p className="font-mono text-xl font-medium tabular-nums text-[var(--text-primary)]">{value}</p>
      {hint && <p className="text-sm text-[var(--text-secondary)]">{hint}</p>}
    </Card>
  );
}
