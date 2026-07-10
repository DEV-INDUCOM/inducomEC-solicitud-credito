import { Input } from "@/components/ui/Input";
import { FileField } from "@/components/ui/FileField";
import { Checkbox } from "@/components/ui/Checkbox";
import type { DatosStep2, FormErrors, TipoSolicitud } from "../types";

type TextField = "nombreSolicitante" | "emailSolicitante" | "rucSolicitante" | "numeroCotizacion";
type FileFieldKey = Exclude<keyof DatosStep2, TextField | "aceptaConsentimiento">;

const FILE_DEFS: Array<[key: FileFieldKey, label: string, requiredErrorKey?: string]> = [
  ["solicitudFirmada", "Solicitud de crédito firmada"],
  ["cedula", "Cédula de identidad"],
  ["rucArchivo", "RUC"],
  ["certBancario", "Certificado bancario con máximo 3 meses de emisión"],
  ["refsComerciales", "Referencias comerciales actualizadas"],
  ["nombramiento", "Nombramiento representante legal"],
  ["ordenCompra", "Orden de compra cliente (opcional)"],
];

// Tercer y último paso del wizard v2: junta el par de datos de texto con el
// checklist de documentos que antes vivía en un paso "Requisitos" aparte.
export function Step2Datos({
  tipoSolicitud,
  datos,
  errors,
  onFieldChange,
  onFileChange,
  onToggleConsentimiento,
}: {
  tipoSolicitud: TipoSolicitud;
  datos: DatosStep2;
  errors: FormErrors;
  onFieldChange: (field: TextField, value: string) => void;
  onFileChange: (field: FileFieldKey, file: File | null) => void;
  onToggleConsentimiento: (checked: boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-5.5">
      {/* Datos del solicitante: requeridos por la tabla (nombre y correo NOT NULL). */}
      <div className="grid grid-cols-2 gap-x-4.5 gap-y-3.5 max-[560px]:grid-cols-1">
        <Input
          label="Nombre del solicitante"
          placeholder="Nombres y apellidos"
          value={datos.nombreSolicitante}
          onChange={(e) => onFieldChange("nombreSolicitante", e.target.value)}
          error={errors.nombreSolicitante}
        />
        <Input
          label="Correo del solicitante"
          type="email"
          placeholder="correo@empresa.com"
          value={datos.emailSolicitante}
          onChange={(e) => onFieldChange("emailSolicitante", e.target.value)}
          error={errors.emailSolicitante}
        />
        <Input
          label="RUC actualizado del solicitante"
          placeholder="Ej. 0990000000001"
          value={datos.rucSolicitante}
          onChange={(e) => onFieldChange("rucSolicitante", e.target.value)}
          error={errors.rucSolicitante}
        />
        {/* Solo aplica a "Nueva solicitud de crédito"; en apertura de línea no hay cotización que referenciar. */}
        {tipoSolicitud === "nueva" && (
          <Input
            label="Número de cotización"
            placeholder="Ej. COT-2026-00123"
            value={datos.numeroCotizacion}
            onChange={(e) => onFieldChange("numeroCotizacion", e.target.value)}
            error={errors.numeroCotizacion}
          />
        )}
      </div>

      <div>
        <p className="mb-3 font-mono text-xs font-semibold tracking-[0.08em] text-[var(--action-primary)] uppercase">
          Documentos requeridos
        </p>
        <div className="grid grid-cols-2 gap-x-4.5 gap-y-3.5 max-[560px]:grid-cols-1">
          {FILE_DEFS.map(([key, label]) => (
            <div key={key}>
              <FileField
                label={label}
                accept="application/pdf,image/jpeg,image/png"
                onFileSelected={(file) => onFileChange(key, file)}
              />
              {errors[key] && <p className="mt-1 text-sm text-[var(--state-danger-text)]">{errors[key]}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Consentimiento: la BD exige consentimiento_aceptado = true, así que el
          envío se bloquea hasta marcar esta casilla (ver validateStep2). */}
      <div className="rounded-lg border border-[color:var(--accent-border)] bg-[var(--accent-soft)] p-3.5">
        <Checkbox
          label="Declaro que la información proporcionada es verídica y acepto las condiciones del proceso de solicitud de crédito."
          checked={datos.aceptaConsentimiento}
          onChange={(e) => onToggleConsentimiento(e.target.checked)}
          error={errors.aceptaConsentimiento}
        />
      </div>
    </div>
  );
}
