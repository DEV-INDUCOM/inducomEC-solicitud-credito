import type { ReactNode } from "react";
import { IconAlertCircle, IconCircleCheck, IconInfoCircle, IconLoader2 } from "@tabler/icons-react";
import { cn } from "@/lib/utils/cn";

export type FormStatusTone = "success" | "error" | "loading" | "info";

const iconClass = "mt-px shrink-0";

const icons: Record<FormStatusTone, ReactNode> = {
  success: <IconCircleCheck size={18} className={iconClass} />,
  error: <IconAlertCircle size={18} className={iconClass} />,
  loading: <IconLoader2 size={18} className={cn(iconClass, "animate-form-spin")} />,
  info: <IconInfoCircle size={18} className={iconClass} />,
};

const toneClasses: Record<FormStatusTone, string> = {
  success: "bg-[var(--state-success-bg)] text-[var(--state-success-text)] border-[color:var(--state-success-border)]",
  error: "bg-[var(--state-danger-bg)] text-[var(--state-danger-text)] border-[color:var(--state-danger-border)]",
  loading: "bg-[var(--state-info-bg)] text-[var(--state-info-text)] border-[color:var(--state-info-border)]",
  info: "bg-[var(--state-info-bg)] text-[var(--state-info-text)] border-[color:var(--state-info-border)]",
};

export function FormStatus({
  tone,
  children,
}: {
  tone: FormStatusTone;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded border px-4 py-3 text-sm leading-snug",
        toneClasses[tone]
      )}
      role={tone === "error" ? "alert" : "status"}
    >
      {icons[tone]}
      <span>{children}</span>
    </div>
  );
}
