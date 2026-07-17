"use client";

import Link from "next/link";
import { IconX } from "@tabler/icons-react";
import { routes } from "@/lib/config/site";
import { cn } from "@/lib/utils/cn";
import { AdminNavList } from "./AdminNavList";

export function MobileAdminNavigation({ open, onClose }: { open: boolean; onClose: () => void }) {
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
        aria-label="Navegación del panel administrativo"
      >
        <div className="flex items-center justify-between px-2 pb-6">
          <Link href={routes.adminResumen} onClick={onClose}>
            <p className="font-display text-lg font-bold text-[var(--text-on-dark)]">INDUCOM</p>
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-orange-400">Administración</p>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded text-white/70 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]"
            aria-label="Cerrar menú"
          >
            <IconX size={20} stroke={1.75} />
          </button>
        </div>
        <AdminNavList onNavigate={onClose} />
      </div>
    </div>
  );
}
