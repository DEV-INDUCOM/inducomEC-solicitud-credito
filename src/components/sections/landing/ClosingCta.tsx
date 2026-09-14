import { LinkButton } from "@/components/ui/LinkButton";
import { Reveal } from "@/components/ui/Reveal";
import { routes } from "@/lib/config/site";

export function ClosingCta() {
  return (
    // py-32 (antes py-[170px], número mágico fuera de la escala de espaciado)
    <section className="bg-[var(--bg-medium-dark)] py-32">
      <div className="page-container">
        {/* Panel navy (antes naranja --accent): el texto blanco/90 sobre naranja
            no pasaba contraste AA. Sobre navy sí, y deja que el naranja del botón
            sea el único acento, más coherente con "navy dominante, naranja de acento". */}
        <Reveal className="flex items-center justify-between gap-8 rounded-xl bg-[var(--bg-dark)] px-12 py-10 max-[760px]:flex-col max-[760px]:items-start max-[760px]:p-8">
          <div>
            <h2 className="max-w-[20ch] text-4xl text-white">¿Listo para transformar su operación?</h2>
            <p className="mt-3 max-w-[44ch] text-white/90">
              Solicite su crédito hoy mismo e inicie el proceso de acceso al ecosistema digital de
              INDUCOM.
            </p>
          </div>
          {/* target=_blank: el wizard de solicitud es largo, se abre aparte para no perder la landing */}
          {/* variant="primary" (antes "dark"): en superficie landing --action-primary es naranja,
              así que el botón queda naranja sobre el panel navy */}
          <LinkButton
            href={routes.creditRequest}
            variant="primary"
            size="lg"
            className="shrink-0"
            target="_blank"
            rel="noopener noreferrer"
          >
            Solicitar Crédito Ahora
          </LinkButton>
        </Reveal>
      </div>
    </section>
  );
}
