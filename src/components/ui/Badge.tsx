import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export interface BadgeProps {
  children: ReactNode;
  onDark?: boolean;
  className?: string;
}

const badgeBase =
  "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.04em]";

export function Badge({ children, onDark = false, className }: BadgeProps) {
  return (
    <span
      className={cn(
        badgeBase,
        onDark ? "bg-brand-orange-500/16 text-brand-orange-300" : "bg-[var(--accent-soft)] text-brand-orange-700",
        className
      )}
    >
      {children}
    </span>
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-brand-orange-400",
        className
      )}
    >
      <span className="inline-block h-0.5 w-5 bg-current" />
      {children}
    </span>
  );
}
