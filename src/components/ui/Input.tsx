import { useId, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
  trailing?: ReactNode;
  labelAction?: ReactNode;
}

export function Input({
  label,
  hint,
  error,
  trailing,
  labelAction,
  id,
  className,
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={inputId} className="text-sm font-medium text-[var(--text-primary)]">
          {label}
        </label>
        {labelAction}
      </div>
      <div className="relative flex items-center">
        <input
          id={inputId}
          className={cn(
            "w-full h-11 border rounded bg-[var(--bg-surface)] px-4 text-base text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus-visible:border-[color:var(--accent)]",
            error
              ? "border-[color:var(--state-danger-border)] focus-visible:shadow-[var(--focus-ring-danger)]"
              : "border-[color:var(--border-strong)]",
            trailing && "pr-10",
            className
          )}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={cn(hintId, errorId) || undefined}
          {...props}
        />
        {trailing && (
          <div className="absolute right-3 inline-flex items-center justify-center rounded-sm p-1 text-[var(--text-muted)] hover:text-[var(--text-secondary)]">
            {trailing}
          </div>
        )}
      </div>
      {hint && !error && (
        <span id={hintId} className="text-sm text-[var(--text-secondary)]">
          {hint}
        </span>
      )}
      {error && (
        <span id={errorId} className="text-sm text-[var(--state-danger-text)]" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
