"use client";

import { useId, useMemo, useRef, useState } from "react";
import { IconChevronDown } from "@tabler/icons-react";
import { cn } from "@/lib/utils/cn";

export interface ComboboxOption {
  value: string;
  label: string;
}

/** Como Select.tsx pero con filtro de texto — para listas largas (ej.
 *  clientes) donde escribir es más rápido que scrollear un <select>. Emite
 *  el valor elegido vía un <input type="hidden" name={name}>, así se lee
 *  igual que cualquier otro campo con FormData(form) en el submit. */
export function Combobox({
  label,
  name,
  options,
  placeholder = "Buscar…",
  required,
  error,
  defaultValue,
}: {
  label: string;
  name: string;
  options: ComboboxOption[];
  placeholder?: string;
  required?: boolean;
  error?: string;
  defaultValue?: string;
}) {
  const inputId = useId();
  const errorId = error ? `${inputId}-error` : undefined;
  const listboxId = `${inputId}-listbox`;

  const defaultOption = options.find((o) => o.value === defaultValue) ?? null;
  const [selected, setSelected] = useState<ComboboxOption | null>(defaultOption);
  const [query, setQuery] = useState(defaultOption?.label ?? "");
  const [open, setOpen] = useState(false);
  const blurTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || selected?.label === query) return options;
    return options.filter((option) => option.label.toLowerCase().includes(q));
  }, [options, query, selected]);

  function handleSelect(option: ComboboxOption) {
    setSelected(option);
    setQuery(option.label);
    setOpen(false);
  }

  function handleBlur() {
    // Si lo escrito no matchea ninguna opción elegida, se descarta al
    // cerrar (vuelve al último valor válido): evita dejar el formulario con
    // texto visible pero sin un value real detrás.
    blurTimeout.current = setTimeout(() => {
      setOpen(false);
      if (!selected || selected.label !== query) setQuery(selected?.label ?? "");
    }, 120);
  }

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className="text-sm font-medium text-[var(--text-primary)]">
        {label}
      </label>
      <div className="relative">
        <input type="hidden" name={name} value={selected?.value ?? ""} required={required} />
        <input
          id={inputId}
          type="text"
          value={query}
          placeholder={placeholder}
          autoComplete="off"
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            setSelected(null);
            setOpen(true);
          }}
          onBlur={handleBlur}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={errorId}
          aria-expanded={open}
          aria-controls={listboxId}
          role="combobox"
          aria-autocomplete="list"
          className={cn(
            "h-11 w-full rounded border bg-[var(--bg-surface)] pl-4 pr-10 text-base text-[var(--text-primary)] focus-visible:border-[color:var(--accent)]",
            error ? "border-[color:var(--state-danger-border)]" : "border-[color:var(--border-strong)]"
          )}
        />
        <IconChevronDown
          size={18}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
          aria-hidden="true"
        />
        {open && (
          <ul
            id={listboxId}
            role="listbox"
            className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded border border-[color:var(--border-strong)] bg-[var(--bg-surface)] py-1 shadow-md"
          >
            {filtered.length === 0 ? (
              <li className="px-4 py-2 text-sm text-[var(--text-muted)]">Sin resultados.</li>
            ) : (
              filtered.map((option) => (
                <li key={option.value} role="option" aria-selected={selected?.value === option.value}>
                  <button
                    type="button"
                    // onMouseDown, no onClick: el blur del input dispara antes
                    // que un click y cerraría la lista antes de registrarlo.
                    onMouseDown={(event) => {
                      event.preventDefault();
                      clearTimeout(blurTimeout.current);
                      handleSelect(option);
                    }}
                    className={cn(
                      "w-full px-4 py-2 text-left text-sm hover:bg-[var(--bg-surface-alt)]",
                      selected?.value === option.value
                        ? "font-medium text-[var(--action-primary)]"
                        : "text-[var(--text-primary)]"
                    )}
                  >
                    {option.label}
                  </button>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
      {error && (
        <span id={errorId} className="text-sm text-[var(--state-danger-text)]" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
