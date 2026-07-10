"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { portalNavItems } from "@/lib/portal/nav";

export function PortalNavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1" aria-label="Navegación del portal">
      {portalNavItems.map((item) => {
        const Icon = item.icon;

        if (!item.href) {
          return (
            <span
              key={item.label}
              aria-disabled="true"
              className="flex items-center justify-between gap-3 rounded px-3 py-2.5 text-sm font-medium text-white/40"
            >
              <span className="flex items-center gap-3">
                <Icon size={18} stroke={1.75} aria-hidden />
                {item.label}
              </span>
              <span className="rounded-full border border-dashed border-white/25 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.04em] text-white/40">
                Próximamente
              </span>
            </span>
          );
        }

        const active = pathname === item.href;

        return (
          <Link
            key={item.label}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded px-3 py-2.5 text-sm font-medium transition-colors",
              "focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]",
              active ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white"
            )}
          >
            <span
              className={cn("h-5 w-1 shrink-0 rounded-full", active ? "bg-[var(--accent)]" : "bg-transparent")}
              aria-hidden
            />
            <Icon size={18} stroke={1.75} aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
