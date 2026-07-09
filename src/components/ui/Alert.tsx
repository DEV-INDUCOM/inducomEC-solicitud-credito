import type { ReactNode } from "react";
import { IconInfoCircle } from "@tabler/icons-react";
import { cn } from "@/lib/utils/cn";

export interface AlertProps {
  title?: string;
  children: ReactNode;
  variant?: "info" | "onDark";
  className?: string;
}

const alertVariantClasses: Record<NonNullable<AlertProps["variant"]>, string> = {
  info: "border-l-[3px] border-l-brand-navy-600 bg-[var(--state-info-bg)] px-5 py-4 text-[var(--state-info-text)] [&_strong]:mb-1 [&_strong]:block [&_strong]:font-semibold",
  onDark: "p-0 text-slate-300",
};

const alertIconVariantClasses: Record<NonNullable<AlertProps["variant"]>, string> = {
  info: "",
  onDark: "text-slate-400",
};

export function Alert({ title, children, variant = "info", className }: AlertProps) {
  return (
    <div className={cn("flex gap-3 rounded text-sm leading-normal", alertVariantClasses[variant], className)} role="note">
      <IconInfoCircle size={18} className={cn("mt-0.5 shrink-0", alertIconVariantClasses[variant])} />
      <p>
        {title && <strong>{title}</strong>}
        {children}
      </p>
    </div>
  );
}
