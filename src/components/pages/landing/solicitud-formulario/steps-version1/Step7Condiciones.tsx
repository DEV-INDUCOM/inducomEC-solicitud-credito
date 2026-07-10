"use client";

import { useRef } from "react";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { SignaturePad, type SignaturePadHandle } from "../SignaturePad";
import type { Condiciones, FormErrors } from "../types";

const TERMS = [
  {
    title: "Autorización de verificación crediticia:",
    body: "autorizo a INDUCOM a verificar, consultar y reportar mi información e historial crediticio ante cualquier buró de crédito o central de riesgo, cuantas veces sea necesario.",
  },
  {
    title: "Reconocimiento de deuda:",
    body: "reconozco que toda obligación derivada del crédito será considerada deuda líquida, pura, exigible y de plazo vencido, constituyendo título ejecutivo suficiente.",
  },
  {
    title: "Cesión de cartera:",
    body: "autorizo a INDUCOM a ceder, transferir o vender la presente obligación a cualquier entidad financiera o de cobranza, sin necesidad de notificación previa.",
  },
  {
    title: "Responsabilidad solidaria:",
    body: "en calidad de representante legal asumo la condición de deudor solidario y garante personal e ilimitado respecto de las obligaciones de la empresa solicitante.",
  },
];

export function Step7Condiciones({
  condiciones,
  errors,
  onFieldChange,
  onToggleAcepta,
  onSignatureChange,
}: {
  condiciones: Condiciones;
  errors: FormErrors;
  onFieldChange: (field: "ciudad" | "fecha", value: string) => void;
  onToggleAcepta: (checked: boolean) => void;
  onSignatureChange: (dataUrl: string) => void;
}) {
  const sigRef = useRef<SignaturePadHandle>(null);

  return (
    <div className="flex flex-col gap-5.5">
      <div className="max-h-60 overflow-y-auto rounded-lg border border-[color:var(--border)] bg-[var(--bg-page-soft)] px-4.5 py-4">
        <p className="mb-2.5 font-mono text-xs font-semibold tracking-[0.08em] text-[var(--action-primary)] uppercase">
          Condiciones generales
        </p>
        <p className="mb-2.5 text-[13px] leading-normal text-[var(--text-secondary)]">
          En calidad de representante legal / solicitante, manifiesto de manera libre, expresa,
          voluntaria e irrevocable lo siguiente:
        </p>
        <ol className="ml-4.5 flex list-decimal flex-col gap-2">
          {TERMS.map((term) => (
            <li key={term.title} className="text-xs leading-normal text-[var(--text-secondary)]">
              <strong className="text-[var(--text-primary)]">{term.title}</strong> {term.body}
            </li>
          ))}
        </ol>
      </div>

      <div className="grid grid-cols-2 gap-x-4.5 gap-y-3.5 max-[480px]:grid-cols-1">
        <Input
          label="Ciudad"
          placeholder="Ciudad de firma"
          value={condiciones.ciudad}
          onChange={(e) => onFieldChange("ciudad", e.target.value)}
          error={errors.cCiudad}
        />
        <Input
          label="Fecha"
          type="date"
          value={condiciones.fecha}
          onChange={(e) => onFieldChange("fecha", e.target.value)}
        />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="font-mono text-xs font-semibold tracking-[0.06em] text-[var(--text-secondary)] uppercase">
            Firma del representante legal
          </span>
          <button
            type="button"
            onClick={() => {
              sigRef.current?.clear();
              onSignatureChange("");
            }}
            className="text-sm font-medium text-[var(--action-primary)] hover:underline"
          >
            Limpiar
          </button>
        </div>
        <SignaturePad ref={sigRef} initialValue={condiciones.firmaDataUrl} onChange={onSignatureChange} />
        {errors.firma && <p className="mt-1.5 text-sm text-[var(--state-danger-text)]">{errors.firma}</p>}
      </div>

      {/* Checkbox aplica su className al <input>, no al contenedor — por eso el
          fondo/borde resaltado van en este <div> envolvente, no en el componente. */}
      <div className="rounded-lg border border-[color:var(--accent-border)] bg-[var(--accent-soft)] p-3.5">
        <Checkbox
          label="He leído y acepto las condiciones generales descritas, y declaro que la información proporcionada es verídica."
          checked={condiciones.acepta}
          onChange={(e) => onToggleAcepta(e.target.checked)}
          error={errors.acepta}
        />
      </div>
    </div>
  );
}
