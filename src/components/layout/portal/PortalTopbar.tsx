"use client";

import { IconMenu2 } from "@tabler/icons-react";
import { Logo } from "@/components/ui/Logo";
import { LogoutButton } from "./LogoutButton";

export function PortalTopbar({
  onMenuClick,
  empresaNombre,
}: {
  onMenuClick: () => void;
  empresaNombre?: string;
}) {
  return (
    <header className="flex h-22 shrink-0 items-center justify-between gap-4 border-b border-[color:var(--border)] bg-[var(--bg-surface)] px-4 md:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="inline-flex h-10 w-10 items-center justify-center rounded text-[var(--text-primary)] hover:bg-[var(--bg-surface-alt)] focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)] md:hidden"
          aria-label="Abrir menú de navegación"
        >
          <IconMenu2 size={22} stroke={1.75} />
        </button>
        <div className="md:hidden">
          <Logo variant="full" imageClassName="h-8 w-auto" width={290} height={100} />
        </div>
        {empresaNombre && (
          <p className="hidden text-sm font-medium text-[var(--text-secondary)] md:block">{empresaNombre}</p>
        )}
      </div>
      <LogoutButton />
    </header>
  );
}
