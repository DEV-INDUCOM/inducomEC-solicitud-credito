"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { FormStatus, type FormStatusTone } from "@/components/ui/FormStatus";
import { actualizarEstadoSolicitud } from "@/lib/admin/actions";
import { estadoSolicitudLabel } from "@/lib/admin/labels";
import type { EstadoSolicitud } from "@/lib/admin/types";

const ESTADOS: EstadoSolicitud[] = ["recibido", "en_revision", "aprobado", "rechazado", "pendiente_informacion"];

export function EstadoSolicitudForm({ solicitudId, estadoActual }: { solicitudId: string; estadoActual: EstadoSolicitud }) {
  const router = useRouter();
  const [nuevoEstado, setNuevoEstado] = useState<EstadoSolicitud>(estadoActual);
  const [nota, setNota] = useState("");
  const [status, setStatus] = useState<{ tone: FormStatusTone; message: string } | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus({ tone: "loading", message: "Guardando cambios…" });

    const result = await actualizarEstadoSolicitud(solicitudId, nuevoEstado, nota);
    if (!result.ok) {
      setStatus({ tone: "error", message: result.message });
      return;
    }

    setStatus({ tone: "success", message: "Cambios guardados." });
    setNota("");
    router.refresh();
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-[var(--text-primary)]">Nuevo estado</span>
        <select
          value={nuevoEstado}
          onChange={(e) => setNuevoEstado(e.target.value as EstadoSolicitud)}
          className="h-11 rounded border border-[color:var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)]"
        >
          {ESTADOS.map((estado) => (
            <option key={estado} value={estado}>
              {estadoSolicitudLabel[estado]}
            </option>
          ))}
        </select>
      </label>

      <Textarea
        label="Nota interna"
        placeholder="Añada una justificación o comentario para el equipo…"
        rows={4}
        value={nota}
        onChange={(e) => setNota(e.target.value)}
      />

      {status && <FormStatus tone={status.tone}>{status.message}</FormStatus>}

      {nuevoEstado === "aprobado" && estadoActual !== "aprobado" && (
        <p className="text-xs text-[var(--text-secondary)] leading-normal">
          Al aprobar se genera automáticamente un código de invitación para el cliente.
        </p>
      )}

      <Button type="submit" block loading={status?.tone === "loading"}>
        Guardar cambios
      </Button>
    </form>
  );
}
