"use client";

import { cn } from "@/lib/utils/cn";
import {
  STEP_SHORT_LABELS,
  STEP_SHORT_LABELS2,
  STEP_TITLES,
  STEP_TITLES2,
  TOTAL_STEPS,
  TOTAL_STEPS2,
} from "./types";

export function Stepper({
  step,
  onGoTo,
}: {
  step: number;
  onGoTo: (index: number) => void;
}) {
  return (
    <div className="border-b border-[color:var(--border)] bg-[var(--bg-surface)] px-6 pt-4 pb-3.5 max-[640px]:px-4">
      <div className="mx-auto max-w-[55rem]">
        <div className="flex items-baseline gap-3 flex-wrap">
          {/* v1: {`PASO 0${step + 1} / 0${TOTAL_STEPS}`} y {STEP_TITLES[step]} */}
          <span className="font-mono text-[11px] font-semibold tracking-[0.16em] text-[var(--accent)]">
            {`PASO 0${step + 1} / 0${TOTAL_STEPS2}`}
          </span>
          <span className="font-display text-lg font-bold text-[var(--text-primary)]">
            {STEP_TITLES2[step]}
          </span>
        </div>

        <div className="my-2.5 h-1.5 overflow-hidden rounded-full bg-[var(--bg-page-soft)]">
          {/* v1: width basada en TOTAL_STEPS (8 pasos) */}
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,var(--action-primary),var(--accent))] transition-[width] duration-300 ease-out"
            style={{ width: `${((step + 1) / TOTAL_STEPS2) * 100}%` }}
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-0.5">
          {/* STEP_SHORT_LABELS 2 es para la versión 2 de los pasos y STEP_SHORT_LABELS es para la versión 1 
          es para cambiar la ruta del archivo CreaditRequestForm2 en el tsconfig.json*/}
          {/* {STEP_SHORT_LABELS.map((label, i) => {
            const done = i < step;
            const active = i === step;
            const clickable = i <= step;
            return (  
              <button
                key={label}
                type="button"
                disabled={!clickable}
                onClick={() => clickable && onGoTo(i)}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-full border py-1.5 pr-3 pl-1.5",
                  active
                    ? "border-[color:var(--accent-border)] bg-[var(--accent-soft)]"
                    : "border-transparent bg-transparent",
                  clickable ? "cursor-pointer" : "cursor-default"
                )}
              >
                <span
                  className={cn(
                    "flex h-6.5 w-6.5 items-center justify-center rounded-full font-mono text-xs font-semibold",
                    active
                      ? "bg-[var(--action-primary)] text-white"
                      : done
                        ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                        : "bg-[var(--bg-page-soft)] text-[var(--text-muted)]"
                  )}
                >
                  {i + 1}
                </span>
                <span
                  className={cn(
                    "font-sans text-[11px] font-semibold whitespace-nowrap",
                    active
                      ? "text-[var(--accent)]"
                      : done
                        ? "text-[var(--text-secondary)]"
                        : "text-[var(--text-muted)]"
                  )}
                >
                  {label}
                </span>
              </button>
            );
          } */}
          
          
          {STEP_SHORT_LABELS2.map((label, i) => {
            const done = i < step;
            const active = i === step;
            const clickable = i <= step;
            return (  
              <button
                key={label}
                type="button"
                disabled={!clickable}
                onClick={() => clickable && onGoTo(i)}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-full border py-1.5 pr-3 pl-1.5",
                  active
                    ? "border-[color:var(--accent-border)] bg-[var(--accent-soft)]"
                    : "border-transparent bg-transparent",
                  clickable ? "cursor-pointer" : "cursor-default"
                )}
              >
                <span
                  className={cn(
                    "flex h-6.5 w-6.5 items-center justify-center rounded-full font-mono text-xs font-semibold",
                    active
                      ? "bg-[var(--action-primary)] text-white"
                      : done
                        ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                        : "bg-[var(--bg-page-soft)] text-[var(--text-muted)]"
                  )}
                >
                  {i + 1}
                </span>
                <span
                  className={cn(
                    "font-sans text-[11px] font-semibold whitespace-nowrap",
                    active
                      ? "text-[var(--accent)]"
                      : done
                        ? "text-[var(--text-secondary)]"
                        : "text-[var(--text-muted)]"
                  )}
                >
                  {label}
                </span>
              </button>
            );
          }
          
          
          )}
        </div>
      </div>
    </div>
  );
}
