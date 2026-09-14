import { Logo } from "@/components/ui/Logo";
import { LinkButton } from "@/components/ui/LinkButton";
import { publicNavLinks, routes } from "@/lib/config/site";

export function PublicNavbar() {
  return (
    <header className="sticky top-0 z-40 bg-[var(--nav-bg)] border-b border-[color:var(--border)]">
      {/* h-16 (antes h-22): 88px sticky era demasiado peso fijo de viewport */}
      {/* Desde 860px los 3 grupos (logo | links | botones) se centran como un
          solo cluster y la separación se controla con los `ml-*` de cada grupo
          (ver abajo). Debajo de 860px se mantiene justify-between: ahí solo
          quedan logo y botones, y deben ir pegados a cada extremo. */}
      {/* PERILLA 3 — margen contra los bordes de la pantalla.
          `page-container` trae 24px fijos (padding-inline: --space-6, ver
          globals.css). Este px-* lo pisa SOLO acá porque las utilities de
          Tailwind ganan sobre @layer components, sin tocar el resto de la
          landing. px-0 = pegado al filo · px-2 = 8px · px-4 = 16px. */}
      <div className="page-container flex h-22 items-center justify-between gap-4 px-0 min-[860px]:justify-center min-[860px]:gap-0">
        <Logo variant="full" src="/Images/logo-inducom.png" />

        {/* Links de navegación: existían en site.ts (publicNavLinks) pero nunca se
            renderizaban. Se ocultan por debajo de 860px para no chocar con los botones. */}
        {/* PERILLA 1 — separación entre el logo y el grupo de links.
            Súbela (ml-16 → ml-24 → ml-32…) para empujar los grupos hacia
            las esquinas; bájala para juntarlos. */}
        <nav
          className="hidden items-center gap-5 min-[860px]:ml-36 min-[860px]:flex"
          aria-label="Navegación principal"
        >
          {publicNavLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[var(--nav-text)] hover:text-[var(--nav-text-hover)]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* PERILLA 2 — separación entre el grupo de links y los dos botones.
            Independiente de la PERILLA 1: se pueden tener huecos distintos. */}
        <nav className="flex items-center gap-7 min-[860px]:ml-36" aria-label="Acciones de cuenta">
          {/* variant="ghost" (antes "outline"): que no compita en peso con el CTA naranja */}
          <LinkButton href={routes.login} variant="ghost" size="sm">
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
