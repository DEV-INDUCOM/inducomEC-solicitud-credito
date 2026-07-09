import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { ToggleChip } from "@/components/ui/ToggleChip";
import type { ActividadEconomica, FormErrors } from "../types";

const SECTOR_DEFS: Array<[key: "publica" | "privada" | "comercial" | "servicios" | "produccion", label: string]> = [
  ["publica", "Pública"],
  ["privada", "Privada"],
  ["comercial", "Comercial"],
  ["servicios", "Servicios"],
  ["produccion", "Producción"],
];

export function Step1Actividad({
  actividad,
  errors,
  onToggleSector,
  onFieldChange,
}: {
  actividad: ActividadEconomica;
  errors: FormErrors;
  onToggleSector: (field: (typeof SECTOR_DEFS)[number][0]) => void;
  onFieldChange: (field: keyof ActividadEconomica, value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-5.5">
      <div>
        <p className="mb-3 font-mono text-xs font-semibold tracking-[0.08em] text-[var(--action-primary)] uppercase">
          Tipo de actividad
        </p>
        <div className="flex flex-wrap gap-2.5">
          {SECTOR_DEFS.map(([key, label]) => (
            <ToggleChip
              key={key}
              label={label}
              active={actividad[key]}
              onClick={() => onToggleSector(key)}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-4.5 gap-y-3.5 max-[560px]:grid-cols-1">
        <Input
          label="Nombre de la empresa"
          value={actividad.nombreEmpresa}
          onChange={(e) => onFieldChange("nombreEmpresa", e.target.value)}
          error={errors.nombreEmpresa}
          className="col-span-2 max-[560px]:col-span-1"
        />
        <Textarea
          label="Actividad de la empresa o negocio"
          rows={2}
          placeholder="Describe la actividad económica principal"
          value={actividad.actividadNegocio}
          onChange={(e) => onFieldChange("actividadNegocio", e.target.value)}
          error={errors.actividadNegocio}
          className="col-span-2 max-[560px]:col-span-1"
        />
        <Input
          label="Dirección"
          value={actividad.direccion}
          onChange={(e) => onFieldChange("direccion", e.target.value)}
          error={errors.direccion}
          className="col-span-2 max-[560px]:col-span-1"
        />
        <Input
          label="Provincia"
          value={actividad.provincia}
          onChange={(e) => onFieldChange("provincia", e.target.value)}
        />
        <Input
          label="Ciudad"
          value={actividad.ciudad}
          onChange={(e) => onFieldChange("ciudad", e.target.value)}
          error={errors.ciudad}
        />
        <Input
          label="Sector"
          placeholder="Ej. Norte"
          value={actividad.sector}
          onChange={(e) => onFieldChange("sector", e.target.value)}
        />
        <Input
          label="Correo"
          type="email"
          value={actividad.correo}
          onChange={(e) => onFieldChange("correo", e.target.value)}
        />
        <Input
          label="Teléfono"
          inputMode="tel"
          value={actividad.telefono}
          onChange={(e) => onFieldChange("telefono", e.target.value)}
          error={errors.telefono}
        />
        <Input
          label="Celular"
          inputMode="tel"
          value={actividad.celular}
          onChange={(e) => onFieldChange("celular", e.target.value)}
        />
      </div>
    </div>
  );
}
