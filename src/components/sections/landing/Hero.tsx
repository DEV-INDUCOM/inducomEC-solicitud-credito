import { IconArrowRight } from "@tabler/icons-react";
import { Eyebrow } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/LinkButton";
import { Reveal } from "@/components/ui/Reveal";
import { routes } from "@/lib/config/site";

export function Hero() {
  return (
    // Fondo: foto real (public/images/background-image.png) + degradado navy a la izquierda
    // (donde va el texto) que se desvanece hacia la foto a la derecha, en vez del gradiente falso anterior.
    <section className="relative flex min-h-[700px] items-center overflow-hidden bg-[linear-gradient(90deg,var(--brand-navy-900)_0%,rgba(0,0,39,0.85)_38%,rgba(0,0,39,0.25)_70%,transparent_100%),url('/images/background-image.png')] bg-cover bg-center text-[var(--text-on-dark)]">
      <div className="page-container relative py-24 max-[900px]:py-16">
        <Reveal className="max-w-[46rem]">
          <Eyebrow className="mb-5">B2B Industrial Portal</Eyebrow>
          {/* max-[640px]: en celular el título baja de text-5xl (48px) a
              text-4xl (36px) para que no se vea gigante. Cambia
              "max-[640px]:text-4xl" por otro tamaño (text-3xl, text-2xl…)
              si lo quieres más chico/grande en mobile. */}
          <h1 className="text-5xl leading-tight text-[var(--text-on-dark)] max-[640px]:text-4xl">
            Portal de Clientes INDUCOM:{" "}
            <span className="text-brand-orange-400">Impulsando la Eficiencia Industrial</span>
          </h1>
          <p className="mt-5 max-w-[42ch] text-lg text-slate-300">
            Centralice su operación, gestione líneas de crédito y acceda a beneficios exclusivos
            diseñados para optimizar la cadena de suministro de su empresa.
          </p>
          {/* flex-wrap: si los 2 botones no caben en una fila (pantallas
              angostas), el segundo baja automáticamente en vez de
              desbordar. No necesitas breakpoint manual para esto. */}
          <div className="mt-8 flex flex-wrap gap-4">
            {/* target=_blank: el wizard de solicitud es largo, se abre aparte para no perder la landing */}
            <LinkButton href={routes.creditRequest} size="lg" target="_blank" rel="noopener noreferrer">
              Solicitar crédito
              <IconArrowRight size={18} aria-hidden="true" />
            </LinkButton>
            <LinkButton href="#beneficios" variant="outlineOnDark" size="lg">
              Conocer beneficios
            </LinkButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
