"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { IconPlus, IconX } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { FormStatus, type FormStatusTone } from "@/components/ui/FormStatus";
import { registrarPago } from "@/lib/admin/actions";
import { metodoPagoLabel } from "@/lib/admin/labels";
import type { MetodoPago } from "@/lib/admin/types";

const METODOS: MetodoPago[] = ["transferencia", "tarjeta", "efectivo", "cheque", "ventanilla", "otro"];

export function RegistrarPagoModal({ clientes }: { clientes: { id: string; nombre: string }[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<{ tone: FormStatusTone; message: string } | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setStatus({ tone: "loading", message: "Registrando pago…" });

    const result = await registrarPago({
      clienteId: String(form.get("clienteId") ?? ""),
      monto: Number(form.get("monto")),
      fecha: String(form.get("fecha") ?? ""),
      metodoPago: form.get("metodoPago") as MetodoPago,
      referencia: String(form.get("referencia") ?? ""),
    });

    if (!result.ok) {
      setStatus({ tone: "error", message: result.message });
      return;
    }

    setStatus(null);
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <IconPlus size={18} stroke={1.75} />
        Registrar pago
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative z-10 w-full max-w-lg rounded-lg bg-[var(--bg-surface)] p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-xl">Registrar pago</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar"
                className="inline-flex h-9 w-9 items-center justify-center rounded text-[var(--text-secondary)] hover:bg-[var(--bg-surface-alt)]"
              >
                <IconX size={20} />
              </button>
            </div>

            <form className="mt-5 flex flex-col gap-4" onSubmit={handleSubmit}>
              <Select
                label="Empresa"
                name="clienteId"
                required
                placeholder="Selecciona una empresa"
                options={clientes.map((c) => ({ value: c.id, label: c.nombre }))}
              />
              <Input label="Monto (USD)" name="monto" type="number" step="0.01" min="0.01" required />
              <Input label="Fecha de pago" name="fecha" type="date" required />
              <Select
                label="Método de pago"
                name="metodoPago"
                required
                placeholder="Selecciona un método"
                options={METODOS.map((m) => ({ value: m, label: metodoPagoLabel[m] }))}
              />
              <Input label="Referencia" name="referencia" placeholder="N.° de referencia (opcional)" />

              {status && <FormStatus tone={status.tone}>{status.message}</FormStatus>}

              <Button type="submit" block loading={status?.tone === "loading"}>
                Guardar pago
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
