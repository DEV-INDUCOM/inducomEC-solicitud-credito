import { fmt, num } from "../validation";
import type { Activos, Pasivos } from "../types";

const ACTIVOS_LABELS: Record<keyof Activos, string> = {
  cajaBancos: "Caja / Bancos",
  cuentasCobrar: "Cuentas por cobrar",
  inventario: "Inventario / Mercadería",
  terrenos: "Terrenos",
  inmuebles: "Inmuebles",
  vehiculos: "Vehículos",
  otrosBienes: "Otros bienes",
};

const PASIVOS_LABELS: Record<keyof Pasivos, string> = {
  prestamos: "Préstamos",
  documentosPagar: "Documentos / Ctas. por pagar",
  otrasInstituciones: "Otras inst. financieras",
  otrasDeudas: "Otras deudas",
};

function MoneyRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex-1 text-sm font-medium text-[var(--text-secondary)]">{label}</span>
      <div className="flex w-32.5 items-center overflow-hidden rounded border border-[color:var(--border-strong)] bg-[var(--bg-surface)]">
        <span className="pl-2 font-mono text-xs text-[var(--text-muted)]">$</span>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          inputMode="decimal"
          placeholder="0.00"
          className="w-full bg-transparent px-2 py-2 text-right font-mono text-sm text-[var(--text-primary)] outline-none"
        />
      </div>
    </div>
  );
}

export function Step3Financiera({
  activos,
  pasivos,
  onFieldChange,
}: {
  activos: Activos;
  pasivos: Pasivos;
  onFieldChange: (group: "activos" | "pasivos", field: string, value: string) => void;
}) {
  const totalActivos = (Object.keys(activos) as Array<keyof Activos>).reduce(
    (acc, key) => acc + num(activos[key]),
    0
  );
  const totalPasivos = (Object.keys(pasivos) as Array<keyof Pasivos>).reduce(
    (acc, key) => acc + num(pasivos[key]),
    0
  );

  return (
    <div className="flex flex-col gap-5.5">
      <p className="-mt-1 text-sm text-[var(--text-muted)]">
        Ingresa los valores en USD. Los totales se calculan automáticamente.
      </p>

      <div className="grid grid-cols-2 gap-5 max-[640px]:grid-cols-1">
        <div className="overflow-hidden rounded-lg border border-[color:var(--border)]">
          <div className="bg-[var(--accent-soft)] px-3.5 py-2.5 font-mono text-xs font-semibold tracking-[0.06em] text-[var(--action-primary)] uppercase">
            Activos
          </div>
          <div className="flex flex-col gap-2.5 p-3.5">
            {(Object.keys(ACTIVOS_LABELS) as Array<keyof Activos>).map((key) => (
              <MoneyRow
                key={key}
                label={ACTIVOS_LABELS[key]}
                value={activos[key]}
                onChange={(value) => onFieldChange("activos", key, value)}
              />
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-[color:var(--border)]">
          <div className="bg-[var(--state-danger-bg)] px-3.5 py-2.5 font-mono text-xs font-semibold tracking-[0.06em] text-[var(--state-danger-text)] uppercase">
            Pasivos
          </div>
          <div className="flex flex-col gap-2.5 p-3.5">
            {(Object.keys(PASIVOS_LABELS) as Array<keyof Pasivos>).map((key) => (
              <MoneyRow
                key={key}
                label={PASIVOS_LABELS[key]}
                value={pasivos[key]}
                onChange={(value) => onFieldChange("pasivos", key, value)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 max-[520px]:grid-cols-1">
        <div className="rounded-lg bg-[var(--bg-page-soft)] p-3.5 text-center">
          <div className="mb-1 font-mono text-[10px] font-medium tracking-[0.06em] text-[var(--text-muted)] uppercase">
            Total activos
          </div>
          <div className="font-mono text-lg font-semibold text-[var(--action-primary)]">
            $ {fmt(totalActivos)}
          </div>
        </div>
        <div className="rounded-lg bg-[var(--bg-page-soft)] p-3.5 text-center">
          <div className="mb-1 font-mono text-[10px] font-medium tracking-[0.06em] text-[var(--text-muted)] uppercase">
            Total pasivos
          </div>
          <div className="font-mono text-lg font-semibold text-[var(--state-danger-text)]">
            $ {fmt(totalPasivos)}
          </div>
        </div>
        <div className="rounded-lg bg-[var(--bg-dark)] p-3.5 text-center">
          <div className="mb-1 font-mono text-[10px] font-medium tracking-[0.06em] text-[var(--border-on-dark)] uppercase">
            Patrimonio neto
          </div>
          <div className="font-mono text-lg font-semibold text-white">
            $ {fmt(totalActivos - totalPasivos)}
          </div>
        </div>
      </div>
    </div>
  );
}
