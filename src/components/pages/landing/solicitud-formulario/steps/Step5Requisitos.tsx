"use client";

import { useId } from "react";
import { IconCheck } from "@tabler/icons-react";
import { cn } from "@/lib/utils/cn";
import type { RequisitosArchivos } from "../types";

const REQ_DEFS: Array<[key: keyof RequisitosArchivos, label: string]> = [
  ["ruc", "RUC"],
  ["cedulaColor", "Copia de cédula a color"],
  ["nombramientos", "Nombramientos (si aplica)"],
  ["certBancarios", "2 certificados bancarios"],
  ["certComerciales", "2 certificados comerciales"],
];

function RequisitoRow({
  reqKey,
  label,
  file,
  onFileChange,
}: {
  reqKey: string;
  label: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
}) {
  const inputId = useId();
  return (
    <div className="flex items-center gap-3.5 rounded-lg border border-[color:var(--border)] bg-[var(--bg-page-soft)] px-4 py-3.5">
      <span
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
          file ? "bg-[var(--state-success-bg)] text-[var(--state-success-text)]" : "bg-[var(--bg-surface-alt)] text-[var(--text-muted)]"
        )}
      >
        {file ? <IconCheck size={16} aria-hidden="true" /> : <span className="text-lg leading-none">•</span>}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-[var(--text-primary)]">{label}</div>
        <div className="truncate font-mono text-xs text-[var(--text-muted)]">
          {file ? file.name : "Pendiente de adjuntar"}
        </div>
      </div>
      <label
        htmlFor={inputId}
        className="shrink-0 cursor-pointer rounded-md border border-[color:var(--accent-border)] bg-[var(--accent-soft)] px-3.5 py-2 text-sm font-semibold text-[var(--action-primary)] hover:bg-[var(--accent-border)]"
      >
        {file ? "Cambiar" : "Adjuntar"}
      </label>
      <input
        id={inputId}
        data-req={reqKey}
        type="file"
        accept="application/pdf,image/jpeg,image/png"
        className="hidden"
        onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}

export function Step5Requisitos({
  requisitos,
  onFileChange,
}: {
  requisitos: RequisitosArchivos;
  onFileChange: (key: keyof RequisitosArchivos, file: File | null) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <p className="-mt-1 mb-1 text-sm text-[var(--text-muted)]">
        Adjunta los documentos requeridos (PDF o imagen). Puedes completarlos después si aún no los
        tienes.
      </p>
      {REQ_DEFS.map(([key, label]) => (
        <RequisitoRow
          key={key}
          reqKey={key}
          label={label}
          file={requisitos[key]}
          onFileChange={(file) => onFileChange(key, file)}
        />
      ))}
    </div>
  );
}
