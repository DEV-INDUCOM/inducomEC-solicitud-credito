import { useId, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hint?: string;
  error?: string;
}

export function Textarea({ label, hint, error, id, className, ...props }: TextareaProps) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const hintId = hint ? `${textareaId}-hint` : undefined;
  const errorId = error ? `${textareaId}-error` : undefined;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={textareaId} className="text-sm font-medium text-[var(--text-primary)]">
        {label}
      </label>
      <textarea
        id={textareaId}
        className={cn(
          "w-full min-h-26 resize-y rounded border bg-[var(--bg-surface)] px-4 py-3 font-sans text-base text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus-visible:border-[color:var(--accent)]",
          error ? "border-[color:var(--state-danger-border)]" : "border-[color:var(--border-strong)]",
          className
        )}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={cn(hintId, errorId) || undefined}
        {...props}
      />
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
