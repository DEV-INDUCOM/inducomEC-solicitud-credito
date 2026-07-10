import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ToggleChip } from "@/components/ui/ToggleChip";
import type { AutorizadoPara, FirmaAutorizada, FormErrors } from "../types";

const AUTORIZADO_OPTIONS: Array<[value: AutorizadoPara, label: string]> = [
  ["compra", "Compra"],
  ["retiros", "Retiros"],
  ["ambos", "Ambos"],
];

export function Step6Firmas({
  firmas,
  errors,
  onAdd,
  onRemove,
  onChange,
  onSetAutorizadoPara,
}: {
  firmas: FirmaAutorizada[];
  errors: FormErrors;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (index: number, field: "nombres" | "cargo", value: string) => void;
  onSetAutorizadoPara: (index: number, value: AutorizadoPara) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="font-mono text-xs font-semibold tracking-[0.08em] text-[var(--action-primary)] uppercase">
          Autorizadas para órdenes de compra y retiros
        </p>
        <Button type="button" variant="outline" size="sm" onClick={onAdd}>
          + Agregar
        </Button>
      </div>
      {errors.firmas && <p className="text-sm text-[var(--state-danger-text)]">{errors.firmas}</p>}

      <div className="flex flex-col gap-3">
        {firmas.map((f, i) => (
          <div key={i} className="rounded-lg border border-[color:var(--border)] bg-[var(--bg-page-soft)] p-3.5">
            <div className="grid grid-cols-[1fr_1fr_auto_auto] items-end gap-3 max-[720px]:grid-cols-2">
              <Input
                label="Nombre completo"
                value={f.nombres}
                onChange={(e) => onChange(i, "nombres", e.target.value)}
              />
              <Input label="Cargo" value={f.cargo} onChange={(e) => onChange(i, "cargo", e.target.value)} />
              <div className="flex flex-col gap-1.5">
                <span className="font-mono text-[10px] font-semibold tracking-[0.06em] text-[var(--text-muted)] uppercase">
                  Autorizado para
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {AUTORIZADO_OPTIONS.map(([value, label]) => (
                    <ToggleChip
                      key={value}
                      variant="soft"
                      label={label}
                      active={f.autorizadoPara === value}
                      onClick={() => onSetAutorizadoPara(i, value)}
                    />
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="justify-self-end p-2 text-sm font-medium text-[var(--state-danger-text)] hover:underline"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
