import { LinkButton } from "@/components/ui/LinkButton";
import { routes } from "@/lib/config/site";

export function ClosingCta() {
  return (
    <section className="bg-[var(--bg-page-soft)] py-16">
      <div className="page-container">
        <div className="flex items-center justify-between gap-8 rounded-xl bg-[var(--accent)] px-12 py-10 max-[760px]:flex-col max-[760px]:items-start max-[760px]:p-8">
          <div>
            <h2 className="max-w-[20ch] text-3xl text-white">¿Listo para transformar su operación?</h2>
            <p className="mt-3 max-w-[44ch] text-white/90">
              Solicite su crédito hoy mismo e inicie el proceso de acceso al ecosistema digital de
              INDUCOM.
            </p>
          </div>
          <LinkButton href={routes.creditRequest} variant="dark" size="lg" className="shrink-0">
            Solicitar Crédito Ahora
          </LinkButton>
        </div>
      </div>
    </section>
  );
}
