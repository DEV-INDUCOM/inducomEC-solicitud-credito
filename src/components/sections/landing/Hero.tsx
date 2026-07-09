import { IconArrowRight } from "@tabler/icons-react";
import { Eyebrow } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/LinkButton";
import { routes } from "@/lib/config/site";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[radial-gradient(ellipse_120%_100%_at_100%_0%,var(--brand-navy-500)_0%,var(--brand-navy-800)_45%,var(--brand-navy-900)_100%)] text-[var(--text-on-dark)]">
      {/* max-[900px]: por debajo de 900px de ancho, el layout pasa de 2
          columnas (texto | imagen) a 1 sola columna apilada, y baja el
          padding vertical. Para cambiar en qué ancho "salta" a mobile,
          cambia el 900px aquí y en el <div> de la imagen más abajo
          (usa el mismo breakpoint para que ambos cambien juntos). */}
      <div className="page-container relative grid grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] items-center gap-12 py-20 max-[900px]:grid-cols-1 max-[900px]:py-16 max-[900px]:pb-12">
        <div className="max-w-[46rem]">
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
            <LinkButton href={routes.creditRequest} size="lg">
              Solicitar crédito
              <IconArrowRight size={18} aria-hidden="true" />
            </LinkButton>
            <LinkButton href="#beneficios" variant="outlineOnDark" size="lg">
              Conocer beneficios
            </LinkButton>
          </div>
        </div>
        {/* Panel decorativo (imagen simulada). max-[900px]:aspect-video
            achata el bloque a proporción 16:9 en mobile/tablet en vez de
            la 4:3 de escritorio, para que no ocupe demasiado alto cuando
            se apila debajo del texto. */}
        <div
          role="img"
          aria-label="Planta industrial INDUCOM"
          className="relative aspect-4/3 overflow-hidden rounded-xl border border-[color:var(--border-on-dark)] shadow-lg max-[900px]:aspect-video bg-[linear-gradient(160deg,rgba(238,107,3,0.25),transparent_55%),repeating-linear-gradient(120deg,rgba(255,255,255,0.05)_0_2px,transparent_2px_26px),linear-gradient(200deg,var(--brand-navy-700),var(--brand-navy-950))] after:absolute after:inset-0 after:bg-[linear-gradient(0deg,rgba(0,0,39,0.55),transparent_60%)] after:content-['']"
        />
      </div>
    </section>
  );
}
