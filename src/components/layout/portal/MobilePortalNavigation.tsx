"use client";

import { IconX } from "@tabler/icons-react";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/utils/cn";
import { PortalNavList } from "./PortalNavList";

export function MobilePortalNavigation({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <div className={cn("fixed inset-0 z-40 md:hidden", !open && "pointer-events-none")} aria-hidden={!open}>
      <div
        onClick={onClose}
        className={cn("absolute inset-0 bg-black/40 transition-opacity duration-200", open ? "opacity-100" : "opacity-0")}
      />
      <div
        className={cn(
          "absolute inset-y-0 left-0 flex w-72 max-w-[80vw] flex-col bg-brand-navy-900 px-4 py-6 shadow-lg transition-transform duration-200",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Navegación del portal"
      >
        <div className="flex items-center justify-between px-2 pb-6">
          <Logo
            variant="full"
            src="/Images/logo-inducom-blanco.png"
            imageClassName="h-8 w-auto"
            width={290}
            height={100}
          />
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded text-white/70 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]"
            aria-label="Cerrar menú"
          >
            <IconX size={20} stroke={1.75} />
          </button>
        </div>
        <PortalNavList onNavigate={onClose} />
      </div>
    </div>
  );
}
