import type { ReactNode } from "react";
import { IconAlertTriangle } from "@tabler/icons-react";

/** Mensaje genérico a propósito: nunca exponer detalles internos de
 *  Supabase/servidor en pantalla (ver consideraciones-tecnicas, sección 7). */
export function ErrorState({
  title = "No pudimos cargar esta información",
  description = "Ocurrió un problema al conectar con el servidor. Intenta de nuevo en unos minutos.",
  action,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-[color:var(--state-danger-border)] bg-[var(--state-danger-bg)] px-6 py-10 text-center">
      <IconAlertTriangle size={28} stroke={1.5} className="text-[var(--state-danger-text)]" aria-hidden />
      <p className="text-base font-semibold text-[var(--state-danger-text)]">{title}</p>
      <p className="max-w-sm text-sm text-[var(--state-danger-text)] leading-normal">{description}</p>
      {action}
    </div>
  );
}
