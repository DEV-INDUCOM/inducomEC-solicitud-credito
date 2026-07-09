"use client";

import { useId, useRef, useState } from "react";
import { IconPaperclip } from "@tabler/icons-react";

export function FileField({
  label,
  hint,
  accept,
  maxSizeMb,
  onFileSelected,
}: {
  label: string;
  hint?: string;
  accept?: string;
  maxSizeMb?: number;
  onFileSelected?: (file: File | null) => void;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleChange(file: File | undefined) {
    if (!file) {
      setFileName(null);
      setError(null);
      onFileSelected?.(null);
      return;
    }

    if (maxSizeMb && file.size > maxSizeMb * 1024 * 1024) {
      setError(`El archivo supera el máximo de ${maxSizeMb} MB.`);
      setFileName(null);
      onFileSelected?.(null);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setError(null);
    setFileName(file.name);
    onFileSelected?.(file);
  }

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className="text-sm font-medium text-[var(--text-primary)]">
        {label}
      </label>
      <label
        htmlFor={inputId}
        className="flex cursor-pointer items-center gap-3 rounded border border-dashed border-[color:var(--border-strong)] bg-[var(--bg-page-soft)] p-4 hover:border-[color:var(--accent)]"
      >
        <IconPaperclip size={20} className="shrink-0 text-[var(--text-muted)]" aria-hidden="true" />
        <span className="text-sm text-[var(--text-secondary)]">
          {fileName ? (
            <span className="font-medium text-[var(--text-primary)]">{fileName}</span>
          ) : (
            "Seleccionar archivo…"
          )}
        </span>
      </label>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        className="absolute h-px w-px overflow-hidden [clip:rect(0,0,0,0)]"
        onChange={(e) => handleChange(e.target.files?.[0])}
      />
      {hint && !error && <span className="text-xs text-[var(--text-muted)]">{hint}</span>}
      {error && (
        <span className="text-sm text-[var(--state-danger-text)]" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
