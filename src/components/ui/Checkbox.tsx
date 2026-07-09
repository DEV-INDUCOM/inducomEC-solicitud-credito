import { useId, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: ReactNode;
  error?: string;
}

export function Checkbox({ label, error, id, className, ...props }: CheckboxProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div>
      <div className="flex items-start gap-3">
        <input
          id={inputId}
          type="checkbox"
          className={cn("mt-0.5 h-[18px] w-[18px] shrink-0 accent-[var(--accent)]", className)}
          {...props}
        />
        <label htmlFor={inputId} className="text-sm leading-snug text-[var(--text-secondary)]">
          {label}
        </label>
      </div>
      {error && (
        <p className="mt-1 text-sm text-[var(--state-danger-text)]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
