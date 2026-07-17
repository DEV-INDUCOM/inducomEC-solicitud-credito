"use client";

import { useState } from "react";
import { IconDownload, IconLoader2 } from "@tabler/icons-react";
import { obtenerUrlDocumento } from "@/lib/admin/actions";

export function DocumentoDownloadButton({ storagePath }: { storagePath: string }) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const result = await obtenerUrlDocumento(storagePath);
    setLoading(false);
    if (result.ok) window.open(result.url, "_blank", "noopener,noreferrer");
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      aria-label="Descargar documento"
      className="inline-flex h-9 w-9 items-center justify-center rounded text-[var(--text-secondary)] hover:bg-[var(--bg-surface-alt)] hover:text-[var(--action-primary)] disabled:opacity-60"
    >
      {loading ? <IconLoader2 size={18} className="animate-form-spin" /> : <IconDownload size={18} />}
    </button>
  );
}
