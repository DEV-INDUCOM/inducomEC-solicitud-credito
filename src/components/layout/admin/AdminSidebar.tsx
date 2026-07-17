import Link from "next/link";
import { IconUserCircle } from "@tabler/icons-react";
import { LogoutButton } from "@/components/layout/portal/LogoutButton";
import { routes } from "@/lib/config/site";
import { AdminNavList } from "./AdminNavList";

export function AdminSidebar() {
  return (
    <aside className="hidden h-full w-64 shrink-0 flex-col overflow-y-auto bg-brand-navy-900 px-4 py-6 md:flex">
      <Link href={routes.adminResumen} className="px-2 pb-6">
        <p className="font-display text-lg font-bold text-[var(--text-on-dark)]">INDUCOM</p>
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-orange-400">Administración</p>
      </Link>
      <AdminNavList />
      <div className="mt-auto flex flex-col gap-3 border-t border-[color:var(--border-on-dark)] pt-4">
        <Link
          href={routes.adminPerfil}
          className="flex items-center gap-3 rounded px-3 py-2 text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white"
        >
          <IconUserCircle size={18} stroke={1.75} aria-hidden />
          Perfil
        </Link>
        <div className="px-3">
          <LogoutButton redirectTo={routes.adminLogin} />
        </div>
      </div>
    </aside>
  );
}
