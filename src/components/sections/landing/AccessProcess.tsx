import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils/cn";

const steps = [
  {
    number: 1,
    title: "Solicitud",
    description: "Complete el formulario de aplicación comercial en línea.",
  },
  {
    number: 2,
    title: "Revisión",
    description: "Nuestro equipo evalúa su perfil crediticio y capacidad operativa.",
  },
  {
    number: 3,
    title: "Invitación",
    description: "Reciba un código de acceso único y seguro a su correo oficial.",
  },
  {
    number: 4,
    title: "Registro",
    description: "Active su cuenta y empiece a gestionar su operación técnica.",
  },
];

export function AccessProcess() {
  return (
    <section className="bg-[var(--bg-page)] py-28" id="proceso">
      <div className="page-container">
        <Reveal className="mb-16 text-center">
          <h2 className="text-3xl">Proceso de acceso al portal</h2>
          <span className="mx-auto mt-3 block h-[3px] w-14 rounded-full bg-[var(--accent)]" aria-hidden="true" />
        </Reveal>

        {/* max-[760px]: por debajo de 760px, los 4 pasos pasan de fila
            horizontal (grid-cols-4) a lista vertical (grid-cols-1), y se
            oculta la línea conectora (before:...) porque ya no aplica
            en vertical. Cambia el 760px si quieres que el salto a mobile
            ocurra en otro ancho. */}
        <ol className="relative grid grid-cols-4 gap-8 max-[760px]:grid-cols-1 max-[760px]:gap-6 before:absolute before:top-6 before:left-[12.5%] before:right-[12.5%] before:h-0.5 before:bg-[var(--border-strong)] max-[760px]:before:hidden">
          {steps.map((step, index) => (
            // <li> se queda como hijo directo del grid (antes tenía flex/gap/text-align,
            // ahora eso se mueve al <Reveal> de adentro para no romper el grid-cols-4).
            <li key={step.number} className="relative">
              <Reveal
                delayMs={index * 150}
                // "group": el color del círculo ahora depende del hover sobre
                // todo el paso (group-hover en el span), ya no de un flag fijo
                // "active" en los datos.
                className="group flex flex-col items-center gap-3 text-center max-[760px]:flex-row max-[760px]:text-left"
              >
                <span
                  className={cn(
                    "relative z-1 inline-flex h-12 w-12 items-center justify-center rounded-full font-display text-lg font-semibold text-[var(--text-on-dark)] transition-colors",
                    "bg-brand-navy-600 group-hover:bg-[var(--accent)]"
                  )}
                >
                  {step.number}
                </span>
                <div>
                  <p className="text-base font-semibold">{step.title}</p>
                  <p className="max-w-[22ch] text-sm text-[var(--text-secondary)]">{step.description}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
