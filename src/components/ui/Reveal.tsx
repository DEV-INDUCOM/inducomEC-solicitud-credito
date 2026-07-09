"use client";

import type { ReactNode } from "react";
import { useReveal } from "@/hooks/useReveal";
import { cn } from "@/lib/utils/cn";

// Wrapper genérico: fade + slide-up cuando el elemento entra en viewport,
// una sola vez (usa useReveal). Si ya está visible al cargar la página
// (ej. el Hero), dispara de inmediato, funcionando como animación de carga.
export function Reveal({
  children,
  className,
  delayMs = 0,
}: {
  children: ReactNode;
  className?: string;
  delayMs?: number;
}) {
  const { ref, isVisible } = useReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delayMs}ms` }}
      className={cn(
        "transition-all duration-700 ease-out",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
        className
      )}
    >
      {children}
    </div>
  );
}
