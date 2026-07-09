import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ToggleChip } from "@/components/ui/ToggleChip";
import type { FormErrors, ReferenciaBancaria, ReferenciaComercial, TipoCuenta } from "../types";

export function Step2Referencias({
  refsBancarias,
  refsComerciales,
  errors,
  onAddBancaria,
  onRemoveBancaria,
  onChangeBancaria,
  onSetTipoCuenta,
  onAddComercial,
  onRemoveComercial,
  onChangeComercial,
}: {
  refsBancarias: ReferenciaBancaria[];
  refsComerciales: ReferenciaComercial[];
  errors: FormErrors;
  onAddBancaria: () => void;
  onRemoveBancaria: (index: number) => void;
  onChangeBancaria: (index: number, field: keyof ReferenciaBancaria, value: string) => void;
  onSetTipoCuenta: (index: number, tipo: TipoCuenta) => void;
  onAddComercial: () => void;
  onRemoveComercial: (index: number) => void;
  onChangeComercial: (index: number, field: keyof ReferenciaComercial, value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-6.5">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="font-mono text-xs font-semibold tracking-[0.08em] text-[var(--action-primary)] uppercase">
            Referencias bancarias
          </p>
          <Button type="button" variant="outline" size="sm" onClick={onAddBancaria}>
            + Agregar
          </Button>
        </div>
        {errors.refsBancarias && (
          <p className="mb-2 text-sm text-[var(--state-danger-text)]">{errors.refsBancarias}</p>
        )}
        <div className="flex flex-col gap-3">
          {refsBancarias.map((ref, i) => (
            <div key={i} className="rounded-lg border border-[color:var(--border)] bg-[var(--bg-page-soft)] p-3.5">
              <div className="grid grid-cols-[1fr_1fr_auto_auto] items-end gap-3 max-[640px]:grid-cols-2">
                <Input
                  label="Institución"
                  placeholder="Banco"
                  value={ref.institucion}
                  onChange={(e) => onChangeBancaria(i, "institucion", e.target.value)}
                />
                <Input
                  label="No. de cuenta"
                  inputMode="numeric"
                  value={ref.noCta}
                  onChange={(e) => onChangeBancaria(i, "noCta", e.target.value)}
                />
                <div className="flex flex-col gap-1.5">
                  <span className="font-mono text-[10px] font-semibold tracking-[0.06em] text-[var(--text-muted)] uppercase">
                    Tipo
                  </span>
                  <div className="flex gap-1.5">
                    <ToggleChip
                      variant="soft"
                      label="Ahorros"
                      active={ref.tipo === "ahorro"}
                      onClick={() => onSetTipoCuenta(i, "ahorro")}
                    />
                    <ToggleChip
                      variant="soft"
                      label="Cta. Cte."
                      active={ref.tipo === "cte"}
                      onClick={() => onSetTipoCuenta(i, "cte")}
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveBancaria(i)}
                  className="justify-self-end p-2 text-sm font-medium text-[var(--state-danger-text)] hover:underline"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="font-mono text-xs font-semibold tracking-[0.08em] text-[var(--action-primary)] uppercase">
            Referencias comerciales
          </p>
          <Button type="button" variant="outline" size="sm" onClick={onAddComercial}>
            + Agregar
          </Button>
        </div>
        <div className="flex flex-col gap-3">
          {refsComerciales.map((ref, i) => (
            <div key={i} className="rounded-lg border border-[color:var(--border)] bg-[var(--bg-page-soft)] p-3.5">
              <div className="grid grid-cols-[1fr_2fr_1fr_auto] items-end gap-3 max-[640px]:grid-cols-2">
                <Input
                  label="Nombre"
                  value={ref.nombre}
                  onChange={(e) => onChangeComercial(i, "nombre", e.target.value)}
                />
                <Input
                  label="Dirección"
                  value={ref.direccion}
                  onChange={(e) => onChangeComercial(i, "direccion", e.target.value)}
                />
                <Input
                  label="Teléfono"
                  inputMode="tel"
                  value={ref.telefono}
                  onChange={(e) => onChangeComercial(i, "telefono", e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => onRemoveComercial(i)}
                  className="justify-self-end p-2 text-sm font-medium text-[var(--state-danger-text)] hover:underline"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
