import { LinkButton } from "@/components/ui/LinkButton";
import { Reveal } from "@/components/ui/Reveal";
import { routes } from "@/lib/config/site";

export function ClosingCta() {
  return (
    // py-32 (128px, más que el resto) para que se note el cierre antes del footer
    <section className="bg-[var(--bg-medium)] py-[170px]">
      <div className="page-container">
        <Reveal className="flex items-center justify-between gap-8 rounded-xl bg-[var(--accent)] px-12 py-10 max-[760px]:flex-col max-[760px]:items-start max-[760px]:p-8">
          <div>
            <h2 className="max-w-[20ch] text-3xl text-white">¿Listo para transformar su operación?</h2>
            <p className="mt-3 max-w-[44ch] text-white/90">
              Solicite su crédito hoy mismo e inicie el proceso de acceso al ecosistema digital de
              INDUCOM.
            </p>
          </div>
          {/* target=_blank: el wizard de solicitud es largo, se abre aparte para no perder la landing */}
          <LinkButton
            href={routes.creditRequest}
            variant="dark"
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
