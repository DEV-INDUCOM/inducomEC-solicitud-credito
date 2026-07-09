import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { SelectCard } from "@/components/ui/SelectCard";
import type { Financiamiento, FormErrors, TieneCotizacion } from "../types";

export function Step4Financiamiento({
  financiamiento,
  errors,
  onSetTieneCotizacion,
  onFieldChange,
}: {
  financiamiento: Financiamiento;
  errors: FormErrors;
  onSetTieneCotizacion: (value: Exclude<TieneCotizacion, "">) => void;
  onFieldChange: (field: keyof Financiamiento, value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-5.5">
      <div>
        <p className="mb-3 font-mono text-xs font-semibold tracking-[0.08em] text-[var(--action-primary)] uppercase">
          ¿Tienes una cotización del equipo?
        </p>
        <div className="grid grid-cols-2 gap-3.5 max-[560px]:grid-cols-1">
          <SelectCard
            selected={financiamiento.tieneCotizacion === "si"}
            title="Sí, tengo cotización"
            description="Ingresaré el número de cotización."
            onClick={() => onSetTieneCotizacion("si")}
          />
          <SelectCard
            selected={financiamiento.tieneCotizacion === "no"}
            title="Aún no tengo cotización"
            description="Quiero iniciar el crédito de todas formas."
            onClick={() => onSetTieneCotizacion("no")}
          />
        </div>
      </div>

      {financiamiento.tieneCotizacion === "si" && (
        <Input
          label="Número de cotización"
          placeholder="Ej. COT-2026-00123"
          value={financiamiento.numeroCotizacion}
          onChange={(e) => onFieldChange("numeroCotizacion", e.target.value)}
          error={errors.numeroCotizacion}
          className="max-w-[21rem]"
        />
      )}

      {financiamiento.tieneCotizacion === "no" && (
        <div className="max-w-[32rem] rounded-lg border border-[color:var(--state-warning-border)] bg-[var(--state-warning-bg)] px-4 py-3.5 text-sm font-medium text-[var(--state-warning-text)]">
          Sin problema. Un asesor de INDUCOM te ayudará a cotizar el equipo. Cuéntanos abajo qué
          necesitas.
        </div>
      )}

      <div className="grid grid-cols-2 gap-x-4.5 gap-y-3.5 max-[560px]:grid-cols-1">
        <Textarea
          label="Equipo industrial que deseas adquirir"
          rows={2}
          placeholder="Ej. Horno industrial, compresor, maquinaria metalúrgica…"
          value={financiamiento.equipoDescripcion}
          onChange={(e) => onFieldChange("equipoDescripcion", e.target.value)}
          className="col-span-2 max-[560px]:col-span-1"
        />
        <Input
          label="Monto aproximado (USD)"
          inputMode="decimal"
          placeholder="0.00"
          value={financiamiento.montoAprox}
          onChange={(e) => onFieldChange("montoAprox", e.target.value)}
        />
        <Input
          label="Plazo deseado (meses)"
          inputMode="numeric"
          placeholder="Ej. 12"
          value={financiamiento.plazoMeses}
          onChange={(e) => onFieldChange("plazoMeses", e.target.value)}
        />
      </div>
    </div>
  );
}
