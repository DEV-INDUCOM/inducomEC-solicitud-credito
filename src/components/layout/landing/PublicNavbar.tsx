import { Logo } from "@/components/ui/Logo";
import { LinkButton } from "@/components/ui/LinkButton";
import { routes } from "@/lib/config/site";

export function PublicNavbar() {
  return (
    <header className="sticky top-0 z-40 bg-[var(--nav-bg)] border-b border-[color:var(--border)]">
      <div className="page-container flex h-22 items-center justify-between gap-4 max-[480px]:h-16">
        <Logo variant="full" src="/Images/logo-inducom.png" />
        <nav className="flex items-center gap-5" aria-label="Acciones de cuenta">
          <LinkButton href={routes.login} variant="outline" size="sm">
            Iniciar sesión
          </LinkButton>
          {/* target=_blank: el wizard de solicitud es largo, se abre aparte para no perder la landing */}
          <LinkButton href={routes.creditRequest} variant="primary" size="sm" target="_blank" rel="noopener noreferrer">
            Solicitar crédito
          </LinkButton>
        </nav>
      </div>
    </header>
  );
}