import { SelectCard } from "@/components/ui/SelectCard";
import type { FormErrors, TipoSolicitud } from "../types";

// Primer paso del wizard v2: define si el resto del formulario pide
// cotización/equipo (nueva solicitud) o no (apertura de línea).
export function Step0TwoOptions({
  tipoSolicitud,
  errors,
  onSelect,
}: {
  tipoSolicitud: TipoSolicitud;
  errors: FormErrors;
  onSelect: (value: Exclude<TipoSolicitud, "">) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-3 font-mono text-xs font-semibold tracking-[0.08em] text-[var(--action-primary)] uppercase">
          Tipo de solicitud
        </p>
        <div className="flex flex-col gap-3.5">
          <SelectCard
            selected={tipoSolicitud === "nueva"}
            title="Nueva solicitud de crédito"
            description="Inicia la evaluación para solicitar financiamiento empresarial."
            onClick={() => onSelect("nueva")}
          />
          <SelectCard
            selected={tipoSolicitud === "apertura"}
            title="Apertura de línea de crédito"
            description="Solicita un cupo disponible para compras futuras."
            onClick={() => onSelect("apertura")}
          />
        </div>
        {errors.tipoSolicitud && (
          <p className="mt-2 text-sm text-[var(--state-danger-text)]">{errors.tipoSolicitud}</p>
        )}
      </div>
    </div>
  );
}
