import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export type ButtonVariant = "primary" | "outline" | "outlineOnDark" | "ghost" | "dark";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  loading?: boolean;
}

/** Compartidas con LinkButton — `disabled:pointer-events-none` hace innecesario
 *  un guard `enabled:` en hover/active (y `:enabled` no aplica a `<a>` de todos modos). */
export const btnBaseClasses =
  "inline-flex items-center justify-center gap-2 rounded border font-sans font-medium whitespace-nowrap text-center transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none";

/** Cada variante fija su propio border-color (incluso cuando es transparente):
 *  mezclar una utilidad con nombre (border-transparent) y una arbitraria
 *  tipo "border-[color:var(--x)]" para la misma propiedad es orden-dependiente
 *  en Tailwind y puede perder silenciosamente contra la otra.
 *  (Nota: este comentario se reescribió para no incluir un ejemplo con
 *  tres puntos suspensivos literales, ya que el scanner de Tailwind lo
 *  detectaba como si fuera una clase real y generaba CSS invalido.) */
export const btnVariantClasses: Record<ButtonVariant, string> = {
  primary:
    "border-transparent bg-[var(--action-primary)] text-[var(--action-primary-text)] hover:bg-[var(--action-primary-hover)] active:bg-[var(--action-primary-pressed)]",
  outline:
    "border-[color:var(--border-strong)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:border-[color:var(--action-primary)] hover:text-[var(--action-primary)]",
  outlineOnDark:
    "border-[color:var(--border-on-dark)] bg-transparent text-[var(--text-on-dark)] hover:border-[color:var(--text-on-dark)] hover:bg-white/8",
  ghost: "border-transparent bg-transparent text-[var(--text-primary)] hover:text-[var(--link-hover)]",
  dark: "border-transparent bg-brand-navy-600 text-white hover:bg-brand-navy-700 active:bg-brand-navy-800",
};

export const btnSizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-base",
  lg: "h-13 px-8 text-lg",
};

export function Button({
  variant = "primary",
  size = "md",
  block = false,
  loading = false,
  disabled,
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        btnBaseClasses,
        btnVariantClasses[variant],
        btnSizeClasses[size],
        block && "w-full",
        className
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? "Procesando…" : children}
    </button>
  );
}
