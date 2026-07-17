"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { adminNavItems } from "@/lib/admin/nav";

export function AdminNavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1" aria-label="Navegación del panel administrativo">
      {adminNavItems.map((item) => {
        const Icon = item.icon;
        const active = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);

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
