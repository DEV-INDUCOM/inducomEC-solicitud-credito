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
    active: true,
  },
  {
    number: 4,
    title: "Registro",
    description: "Active su cuenta y empiece a gestionar su operación técnica.",
  },
];

export function AccessProcess() {
  return (
    <section className="bg-[var(--bg-surface-alt)] py-16" id="proceso">
      <div className="page-container">
        <div className="mb-16 text-center">
          <h2 className="text-3xl">Proceso de acceso al portal</h2>
          <span className="mx-auto mt-3 block h-[3px] w-14 rounded-full bg-[var(--accent)]" aria-hidden="true" />
        </div>

        {/* max-[760px]: por debajo de 760px, los 4 pasos pasan de fila
            horizontal (grid-cols-4) a lista vertical (grid-cols-1), y se
            oculta la línea conectora (before:...) porque ya no aplica
            en vertical. Cambia el 760px si quieres que el salto a mobile
            ocurra en otro ancho. */}
        <ol className="relative grid grid-cols-4 gap-8 max-[760px]:grid-cols-1 max-[760px]:gap-6 before:absolute before:top-6 before:left-[12.5%] before:right-[12.5%] before:h-0.5 before:bg-[var(--border-strong)] max-[760px]:before:hidden">
          {steps.map((step) => (
            <li
              key={step.number}
              // En mobile cada paso pasa de columna centrada a fila
              // (número a la izquierda, texto a la derecha alineado).
              className="relative flex flex-col items-center gap-3 text-center max-[760px]:flex-row max-[760px]:text-left"
            >
              <span
                className={cn(
                  "relative z-1 inline-flex h-12 w-12 items-center justify-center rounded-full font-display text-lg font-semibold text-[var(--text-on-dark)]",
                  step.active ? "bg-[var(--accent)]" : "bg-brand-navy-600"
                )}
              >
                {step.number}
              </span>
              <div>
                <p className="text-base font-semibold">{step.title}</p>
                <p className="max-w-[22ch] text-sm text-[var(--text-secondary)]">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
