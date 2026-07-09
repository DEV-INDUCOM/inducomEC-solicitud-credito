import { Input } from "@/components/ui/Input";
import { SelectCard } from "@/components/ui/SelectCard";
import type { DatosPersonales, FormErrors, TipoCliente } from "../types";

export function Step0Datos({
  tipoCliente,
  datos,
  errors,
  onSelectTipoCliente,
  onFieldChange,
}: {
  tipoCliente: TipoCliente;
  datos: DatosPersonales;
  errors: FormErrors;
  onSelectTipoCliente: (value: Exclude<TipoCliente, "">) => void;
  onFieldChange: (field: keyof DatosPersonales, value: string) => void;
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
            onClick={() => onSelectTipoCliente("natural")}
          />
          <SelectCard
            selected={tipoCliente === "juridica"}
            title="Persona Jurídica"
            description="Solicitas en nombre de una empresa."
            onClick={() => onSelectTipoCliente("juridica")}
          />
        </div>
        {errors.tipoCliente && (
          <p className="mt-2 text-sm text-[var(--state-danger-text)]">{errors.tipoCliente}</p>
        )}
      </div>

      {tipoCliente === "juridica" && (
        <Input
          label="Razón Social"
          placeholder="Nombre legal de la empresa"
          value={datos.razonSocial}
          onChange={(e) => onFieldChange("razonSocial", e.target.value)}
          error={errors.razonSocial}
        />
      )}

      <div>
        <p className="mb-3 font-mono text-xs font-semibold tracking-[0.08em] text-[var(--action-primary)] uppercase">
          {tipoCliente === "natural" ? "Datos del solicitante" : "Solicitante / Representante legal"}
        </p>
        <div className="grid grid-cols-2 gap-x-4.5 gap-y-3.5 max-[560px]:grid-cols-1">
          <Input
            label="Apellidos"
            placeholder="Apellidos completos"
            value={datos.apellidos}
            onChange={(e) => onFieldChange("apellidos", e.target.value)}
            error={errors.apellidos}
          />
          <Input
            label="Nombres"
            placeholder="Nombres completos"
            value={datos.nombres}
            onChange={(e) => onFieldChange("nombres", e.target.value)}
            error={errors.nombres}
          />
          <Input
            label="Cédula / RUC / Pasaporte"
            placeholder="10 ó 13 dígitos"
            inputMode="numeric"
            value={datos.cedula}
            onChange={(e) => onFieldChange("cedula", e.target.value)}
            error={errors.cedula}
          />
          <Input
            label="Nacionalidad"
            placeholder="Ej. Ecuatoriano"
            value={datos.nacionalidad}
            onChange={(e) => onFieldChange("nacionalidad", e.target.value)}
          />
          <Input
            label="Fecha de nacimiento"
            type="date"
            value={datos.fechaNac}
            onChange={(e) => onFieldChange("fechaNac", e.target.value)}
          />
          <Input
            label="Correo del representante legal"
            type="email"
            placeholder="correo@empresa.com"
            value={datos.correo}
            onChange={(e) => onFieldChange("correo", e.target.value)}
            error={errors.correo}
            className="col-span-2 max-[560px]:col-span-1"
          />
        </div>
      </div>

      <div>
        <p className="font-mono text-xs font-semibold tracking-[0.08em] text-[var(--action-primary)] uppercase">
          Cónyuge del solicitante
        </p>
        <p className="mt-1 mb-3 text-xs text-[var(--text-muted)]">Opcional — completa solo si aplica.</p>
        <div className="grid grid-cols-3 gap-x-4.5 gap-y-3.5 max-[720px]:grid-cols-2 max-[420px]:grid-cols-1">
          <Input
            label="Apellido paterno"
            value={datos.cyApPaterno}
            onChange={(e) => onFieldChange("cyApPaterno", e.target.value)}
          />
          <Input
            label="Apellido materno"
            value={datos.cyApMaterno}
            onChange={(e) => onFieldChange("cyApMaterno", e.target.value)}
          />
          <Input
            label="Nombres"
            value={datos.cyNombres}
            onChange={(e) => onFieldChange("cyNombres", e.target.value)}
          />
          <Input
            label="Cédula / RUC"
            inputMode="numeric"
            value={datos.cyCedula}
            onChange={(e) => onFieldChange("cyCedula", e.target.value)}
          />
          <Input
            label="Nacionalidad"
            value={datos.cyNacionalidad}
            onChange={(e) => onFieldChange("cyNacionalidad", e.target.value)}
          />
          <Input
            label="Fecha de nacimiento"
            type="date"
            value={datos.cyFechaNac}
            onChange={(e) => onFieldChange("cyFechaNac", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
