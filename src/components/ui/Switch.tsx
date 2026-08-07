"use client";

import { cn } from "@/lib/utils/cn";

/** Toggle on/off real (no un ToggleChip de pill): verde cuando está
 *  encendido, gris neutro cuando no — nunca rojo, "apagado" no es un error. */
export function Switch({
  checked,
  onChange,
  disabled,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full border transition-colors disabled:opacity-60",
        checked
          ? "border-[color:var(--state-success-border)] bg-[var(--state-success-text)]"
          : "border-[color:var(--border-strong)] bg-[var(--bg-surface-alt)]"
      )}
    >
      {/* left/right en vez de translate-x con un píxel fijo: ese valor se
          calculaba a mano para un ancho exacto de track y el borde lo
          corría lo suficiente para que el círculo se saliera por el borde
          derecho. Con left/right, el margen de 2px queda fijo siempre,
          sin importar el ancho real del track. */}
      <span
        className={cn(
          "absolute top-0.5 h-4.5 w-4.5 rounded-full bg-white shadow-sm transition-all",
          checked ? "right-0.5" : "left-0.5"
        )}
        aria-hidden
      />
    </button>
  );
}