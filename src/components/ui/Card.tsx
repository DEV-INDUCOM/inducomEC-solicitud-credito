import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  shadow?: boolean;
}

/** Radio, borde y sombra salen de tokens --card-*: la landing conserva su
 *  acabado (12px, borde, sin sombra) y la superficie portal aplica el v2. */
export function Card({ shadow = false, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--card-radius)] border border-[color:var(--card-border)] bg-[var(--bg-surface)] p-6",
        shadow ? "shadow-[var(--card-shadow-raised)]" : "shadow-[var(--card-shadow)]",
        className
      )}
      {...props}
    />
  );
}

export type IconTileVariant = "neutral" | "highlight" | "accent" | "onDark";
export type IconTileShape = "square" | "circle";

/** Cada variante fija bg + text completos — evita mezclar utilidades con
 *  nombre y arbitrarias para la misma propiedad (ver nota en Button.tsx). */
const iconTileVariantClasses: Record<IconTileVariant, string> = {
  neutral: "bg-[var(--bg-surface-alt)] text-brand-navy-600",
  // Métricas y datos (cashback, PayPal): azul de interfaz en el portal.
  highlight: "bg-[var(--highlight-soft)] text-[var(--highlight)]",
  accent: "bg-[var(--accent-soft)] text-brand-orange-600",
  onDark: "bg-brand-navy-800 text-[var(--text-on-dark)]",
};

const iconTileShapeClasses: Record<IconTileShape, string> = {
  square: "rounded",
  circle: "rounded-full",
};

export function IconTile({
  children,
  variant = "neutral",
  shape = "square",
  className,
}: {
  children: ReactNode;
  variant?: IconTileVariant;
  shape?: IconTileShape;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex h-12 w-12 shrink-0 items-center justify-center",
        iconTileVariantClasses[variant],
        iconTileShapeClasses[shape],
        className
      )}
    >
      {children}
    </div>
  );
}
