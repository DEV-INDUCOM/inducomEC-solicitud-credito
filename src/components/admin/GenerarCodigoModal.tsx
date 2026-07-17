"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { IconCheck, IconCopy, IconQrcode, IconX } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { FormStatus, type FormStatusTone } from "@/components/ui/FormStatus";
import { generarCodigo } from "@/lib/admin/actions";
import { formatFecha } from "@/lib/admin/format";

export function GenerarCodigoModal({ clientes }: { clientes: { id: string; nombre: string }[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<{ tone: FormStatusTone; message: string } | null>(null);
  const [generado, setGenerado] = useState<{ codigo: string; vence: string } | null>(null);
  const [copiado, setCopiado] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setStatus({ tone: "loading", message: "Generando código…" });

    const result = await generarCodigo(String(form.get("clienteId") ?? ""), Number(form.get("diasValidez")) || 30);

    if (!result.ok) {
      setStatus({ tone: "error", message: result.message });
      return;
    }

    setStatus(null);
    setGenerado({ codigo: result.codigo, vence: result.fechaVencimiento });
    router.refresh();
  }

  function handleClose() {
    setOpen(false);
    setGenerado(null);
    setCopiado(false);
    setStatus(null);
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <IconQrcode size={18} stroke={1.75} />
        Generar código
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={handleClose} />
          <div className="relative z-10 w-full max-w-md rounded-lg bg-[var(--bg-surface)] p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-xl">Generar código de invitación</h2>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Cerrar"
                className="inline-flex h-9 w-9 items-center justify-center rounded text-[var(--text-secondary)] hover:bg-[var(--bg-surface-alt)]"
              >
                <IconX size={20} />
              </button>
            </div>

            {generado ? (
              <div className="mt-5 flex flex-col gap-4">
                <FormStatus tone="success">Código generado correctamente.</FormStatus>
                <div className="flex items-center justify-between rounded border border-[color:var(--border-strong)] bg-[var(--bg-surface-alt)] px-4 py-3">
                  <span className="font-mono text-lg font-semibold text-[var(--text-primary)]">{generado.codigo}</span>
                  <button
                    type="button"
                    onClick={() => {
                      void navigator.clipboard.writeText(generado.codigo);
                      setCopiado(true);
                    }}
                    aria-label="Copiar código"
                    className="inline-flex h-9 w-9 items-center justify-center rounded text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]"
                  >
                    {copiado ? <IconCheck size={18} className="text-[var(--state-success-text)]" /> : <IconCopy size={18} />}
                  </button>
                </div>
                <p className="text-sm text-[var(--text-secondary)]">Vence el {formatFecha(generado.vence)}.</p>
                <Button onClick={handleClose} block>
                  Cerrar
                </Button>
              </div>
            ) : (
              <form className="mt-5 flex flex-col gap-4" onSubmit={handleSubmit}>
                <Select
                  label="Empresa"
                  name="clienteId"
                  required
                  placeholder="Selecciona una empresa"
                  options={clientes.map((c) => ({ value: c.id, label: c.nombre }))}
                />
                <Input label="Días de validez" name="diasValidez" type="number" min="1" defaultValue={30} required />

                {status && <FormStatus tone={status.tone}>{status.message}</FormStatus>}

                <Button type="submit" block loading={status?.tone === "loading"}>
                  Generar código
                </Button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
