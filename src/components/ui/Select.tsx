import { useId, type ReactNode, type SelectHTMLAttributes } from "react";
import { IconChevronDown } from "@tabler/icons-react";
import { cn } from "@/lib/utils/cn";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
}

export function Select({
  label,
  options,
  placeholder,
  error,
  id,
  className,
  ...props
}: SelectProps): ReactNode {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const errorId = error ? `${selectId}-error` : undefined;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={selectId} className="text-sm font-medium text-[var(--text-primary)]">
        {label}
      </label>
      <div className="relative">
        <select
          id={selectId}
          className={cn(
            "w-full h-11 appearance-none rounded border bg-[var(--bg-surface)] pl-4 pr-10 text-base text-[var(--text-primary)] invalid:text-[var(--text-muted)] focus-visible:border-[color:var(--accent)]",
            error
              ? "border-[color:var(--state-danger-border)]"
              : "border-[color:var(--border-strong)]",
            className
          )}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={errorId}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <IconChevronDown
          size={18}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
          aria-hidden="true"
        />
      </div>
      {error && (
        <span id={errorId} className="text-sm text-[var(--state-danger-text)]" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
