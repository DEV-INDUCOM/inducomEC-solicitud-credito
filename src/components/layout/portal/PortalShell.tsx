"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { MobilePortalNavigation } from "./MobilePortalNavigation";
import { PortalSidebar } from "./PortalSidebar";
import { PortalTopbar } from "./PortalTopbar";

export function PortalShell({ children, clienteNombre }: { children: ReactNode; clienteNombre?: string }) {
  const [open, setOpen] = useState(false);

  // Cierra el drawer móvil con Escape (accesibilidad de un diálogo modal).
  useEffect(() => {
    if (!open) return;
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open]);

  return (
    // Shell fijo a la altura del viewport: sidebar y topbar quedan siempre
    // completos, y solo <main> hace scroll. Con sidebar "sticky" dentro de
    // una página larga, el sidebar se "acababa" cerca del final de la
    // página (comportamiento normal de sticky, pero no el que queremos acá).
    <div className="flex h-screen overflow-hidden bg-[var(--bg-page)]">
      <PortalSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <PortalTopbar onMenuClick={() => setOpen(true)} clienteNombre={clienteNombre} />
        <main className="page-container w-full flex-1 overflow-y-auto py-8 md:py-10">{children}</main>
      </div>
      <MobilePortalNavigation open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
