"use client";

import { useRouter } from "next/navigation";
import { IconMenu2, IconSearch, IconUserCircle } from "@tabler/icons-react";
import { routes } from "@/lib/config/site";

export function AdminTopbar({ onMenuClick, adminNombre }: { onMenuClick: () => void; adminNombre?: string }) {
  const router = useRouter();

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = new FormData(event.currentTarget).get("q");
    const query = typeof value === "string" ? value.trim() : "";
    router.push(query ? `${routes.adminSolicitudes}?q=${encodeURIComponent(query)}` : routes.adminSolicitudes);
  }

  return (
    <header className="flex h-22 shrink-0 items-center justify-between gap-4 border-b border-[color:var(--border)] bg-[var(--bg-surface)] px-4 md:px-8">
      <button
        type="button"
        onClick={onMenuClick}
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded text-[var(--text-primary)] hover:bg-[var(--bg-surface-alt)] focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)] md:hidden"
        aria-label="Abrir menú de navegación"
      >
        <IconMenu2 size={22} stroke={1.75} />
      </button>

      <form onSubmit={handleSearch} className="hidden max-w-sm flex-1 md:block">
        <label className="relative flex items-center">
          <IconSearch size={18} className="pointer-events-none absolute left-3 text-[var(--text-muted)]" />
          <input
            type="search"
            name="q"
            placeholder="Buscar empresa o solicitud…"
            className="h-10 w-full rounded border border-[color:var(--border-strong)] bg-[var(--bg-surface)] pl-10 pr-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus-visible:border-[color:var(--accent)]"
          />
        </label>
      </form>

      {adminNombre && (
        <div className="flex items-center gap-2">
          <IconUserCircle size={28} stroke={1.5} className="text-[var(--text-secondary)]" />
          <p className="hidden text-sm font-medium text-[var(--text-primary)] md:block">{adminNombre}</p>
        </div>
      )}
    </header>
  );
}
