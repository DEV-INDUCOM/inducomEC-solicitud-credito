import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { routes } from "@/lib/config/site";

export function PortalShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--bg-page)]">
      <header className="bg-[var(--bg-surface)] border-b border-[color:var(--border)]">
        <div className="page-container flex h-16 items-center justify-between gap-4">
          <Logo variant="full" />
          <nav className="flex items-center gap-2" aria-label="Navegación del portal">
            <Link
              href={routes.dashboard}
              className="rounded-sm px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-surface-alt)] hover:text-[var(--action-primary)]"
            >
              Dashboard
            </Link>
            <Link
              href={routes.paypal}
              className="rounded-sm px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-surface-alt)] hover:text-[var(--action-primary)]"
            >
              PayPal
            </Link>
            <Button variant="outline" size="sm">
              Cerrar sesión
            </Button>
          </nav>
        </div>
      </header>
      <main className="page-container py-10">{children}</main>
    </div>
  );
}
