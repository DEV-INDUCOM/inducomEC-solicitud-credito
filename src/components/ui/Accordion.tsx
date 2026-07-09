"use client";

import { useId, useState } from "react";
import { IconChevronDown } from "@tabler/icons-react";

export interface AccordionItemData {
  question: string;
  answer: string;
}

export function Accordion({
  items,
  defaultOpenIndex = 0,
}: {
  items: AccordionItemData[];
  defaultOpenIndex?: number | null;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(defaultOpenIndex);
  const baseId = useId();

  return (
    <div>
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const triggerId = `${baseId}-trigger-${index}`;
        const panelId = `${baseId}-panel-${index}`;

        return (
          // Vuelto a clases de Tailwind (bg-[var(--...)]) en vez de nombres custom sin CSS asociado,
          // y colores ajustados a los tokens "on-dark" porque FaqSection ahora usa fondo oscuro.
          <div
            key={item.question}
            className="border-b border-[color:var(--border)] first:border-t"
            data-open={isOpen}
          >
            <h3>
              <button
                type="button"
                id={triggerId}
                className="flex w-full items-center justify-between gap-4 py-5 text-left font-medium text-[var(--text-secundary)]"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenIndex(isOpen ? null : index)}
              >
                <span>{item.question}</span>
                <IconChevronDown
                  size={20}
                  className={`shrink-0 text-[var(--text-secondary)] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                  aria-hidden="true"
                />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={triggerId}
              hidden={!isOpen}
            >
              <div className="px-2 pb-5 text-[var(--text-secondary)] leading-normal">{item.answer}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
