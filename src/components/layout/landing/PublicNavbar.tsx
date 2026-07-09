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
          <LinkButton href={routes.creditRequest} variant="primary" size="sm">
            Solicitar crédito
          </LinkButton>
        </nav>
      </div>
    </header>
  );
}
