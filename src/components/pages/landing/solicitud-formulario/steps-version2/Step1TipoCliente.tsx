import { SelectCard } from "@/components/ui/SelectCard";
import type { FormErrors, TipoCliente } from "../types";

// Segundo paso del wizard v2: solo pregunta persona natural vs. jurídica.
// Los campos de datos personales que traía la v1 en este mismo paso se
// movieron/eliminaron: aquí ya no se piden.
export function Step1TipoCliente({
  tipoCliente,
  errors,
  onSelect,
}: {
  tipoCliente: TipoCliente;
  errors: FormErrors;
  onSelect: (value: Exclude<TipoCliente, "">) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-3 font-mono text-xs font-semibold tracking-[0.08em] text-[var(--action-primary)] uppercase">
          Tipo de cliente
        </p>
        <div className="grid grid-cols-2 gap-3.5 max-[520px]:grid-cols-1">
          <SelectCard
            selected={tipoCliente === "natural"}
            title="Persona Natural"
            description="Solicitas el crédito a título personal."
            onClick={() => onSelect("natural")}
          />
          <SelectCard
            selected={tipoCliente === "juridica"}
            title="Persona Jurídica"
            description="Solicitas en nombre de una empresa."
            onClick={() => onSelect("juridica")}
          />
        </div>
        {errors.tipoCliente && (
          <p className="mt-2 text-sm text-[var(--state-danger-text)]">{errors.tipoCliente}</p>
        )}
      </div>
    </div>
  );
}
