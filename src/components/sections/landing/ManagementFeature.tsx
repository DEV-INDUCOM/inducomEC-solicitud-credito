import { IconCircleCheck } from "@tabler/icons-react";
import { Reveal } from "@/components/ui/Reveal";

const items = [
  {
    title: "Consultar estados de cuenta",
    description: "Visualice sus facturas, pagos pendientes y cupos disponibles en tiempo real.",
  },
  {
    title: "Invitaciones exclusivas",
    description: "Acceda a preventas técnicas y webinars especializados para socios estratégicos.",
  },
  {
    title: "Gestión ágil de pedidos",
    description: "Realice cotizaciones y órdenes de compra con un solo clic desde cualquier dispositivo.",
  },
];

export function ManagementFeature() {
  return (
    <section className="bg-[var(--bg-medium)] py-28" id="beneficios">
      <div className="page-container grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] items-center gap-12 max-[900px]:grid-cols-1">
        <Reveal>
          <p className="text-xs font-semibold tracking-[0.06em] text-brand-orange-600 uppercase">
            Gestión centralizada
          </p>
          <h2 className="mt-3 max-w-[20ch] text-3xl">
            Optimice su gestión comercial con herramientas digitales
          </h2>

          <ul className="mt-8 flex flex-col gap-5">
            {items.map((item) => (
              <li key={item.title} className="flex gap-3">
                <IconCircleCheck size={20} className="mt-0.5 shrink-0 text-[var(--accent)]" aria-hidden="true" />
                <div>
                  <p className="font-semibold">{item.title}</p>
                  <p className="mt-1 text-sm text-[var(--text-secondary)] leading-normal">
                    {item.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delayMs={150}>
          <div
            role="img"
            aria-label="Vista previa del portal de clientes"
            className="rounded-xl bg-brand-navy-900 p-5 shadow-lg"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <span className="h-3 w-[45%] rounded-full bg-white/12" />
              <span className="flex gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-brand-orange-500" />
                <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
              </span>
            </div>
            <div className="grid grid-cols-[1fr_1.2fr] gap-4">
              <div className="flex min-h-[140px] flex-col gap-2 rounded bg-white/8 p-3">
                <span className="block h-2 rounded-full bg-white/18" />
                <span className="block h-2 w-[70%] rounded-full bg-white/18" />
              </div>
              <div className="flex min-h-[140px] flex-col justify-end gap-2 rounded bg-[linear-gradient(160deg,rgba(238,107,3,0.35),rgba(238,107,3,0.08))] p-3">
                <span className="block h-[34px] rounded-sm bg-white/25" />
              </div>
            </div>
            <div className="mt-4 h-2 rounded-full bg-white/10" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
