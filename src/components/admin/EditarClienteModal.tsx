"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { IconPencil, IconX } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Switch } from "@/components/ui/Switch";
import { FormStatus, type FormStatusTone } from "@/components/ui/FormStatus";
import { actualizarCliente, obtenerClienteEditable, type ClienteEditable } from "@/lib/admin/actions";
import { tipoClienteLabel } from "@/lib/admin/labels";

export function EditarClienteModal({
  clienteId,
  clienteNombre,
  paises,
}: {
  clienteId: string;
  clienteNombre: string;
  paises: { id: number; nombre: string }[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [cliente, setCliente] = useState<ClienteEditable | null>(null);
  const [activo, setActivo] = useState(true);
  const [status, setStatus] = useState<{ tone: FormStatusTone; message: string } | null>(null);

  //? El listado no trae correo, país ni los campos del subtipo: se cargan
  //? recién al abrir, así el modal siempre parte del dato actual.
  async function handleOpen() {
    setOpen(true);
    setCliente(null);
    setStatus({ tone: "loading", message: "Cargando datos…" });

    const result = await obtenerClienteEditable(clienteId);
    if (!result.ok) {
      setStatus({ tone: "error", message: result.message });
      return;
    }

    setCliente(result.data);
    setActivo(result.data.activo);
    setStatus(null);
  }

  function handleClose() {
    setOpen(false);
    setCliente(null);
    setStatus(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!cliente) return;

    const form = new FormData(event.currentTarget);
    setStatus({ tone: "loading", message: "Guardando cambios…" });

    const result = await actualizarCliente({
      clienteId,
      // El tipo no se edita, pero decide qué campos del subtipo se mandan.
      tipoCliente: cliente.tipoCliente,
      activo,
      paisId: Number(form.get("paisId")),
      nombreVisible: String(form.get("nombreVisible") ?? ""),
      email: String(form.get("email") ?? ""),
      identificacion: String(form.get("identificacion") ?? ""),
      nombres: String(form.get("nombres") ?? ""),
      apellidos: String(form.get("apellidos") ?? ""),
      representanteLegal: String(form.get("representanteLegal") ?? ""),
    });

    if (!result.ok) {
      setStatus({ tone: "error", message: result.message });
      return;
    }

    handleClose();
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        aria-label={`Editar ${clienteNombre}`}
        className="inline-flex h-9 w-9 items-center justify-center rounded text-[var(--text-secondary)] hover:bg-[var(--bg-surface-alt)] hover:text-[var(--action-primary)]"
      >
        <IconPencil size={18} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={handleClose} />
          <div className="relative z-10 w-full max-w-md rounded-lg bg-[var(--bg-surface)] p-6 shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-xl">Editar empresa</h2>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Cerrar"
                className="inline-flex h-9 w-9 items-center justify-center rounded text-[var(--text-secondary)] hover:bg-[var(--bg-surface-alt)]"
              >
                <IconX size={20} />
              </button>
            </div>

            {cliente ? (
              <form className="mt-5 flex flex-col gap-4" onSubmit={handleSubmit}>
                {/* El tipo de cliente se muestra pero no se edita: cambiarlo
                    movería la fila entre personas_naturales y empresas. */}
                <p className="text-sm text-[var(--text-secondary)]">
                  Tipo de cliente:{" "}
                  <span className="font-medium text-[var(--text-primary)]">
                    {tipoClienteLabel[cliente.tipoCliente]}
                  </span>
                </p>

                <div className="flex items-center justify-between rounded border border-[color:var(--border-strong)] px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">Cliente activo</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {activo ? "Puede acceder al portal." : "Archivado: sin acceso al portal."}
                    </p>
                  </div>
                  <Switch checked={activo} onChange={setActivo} label="Cliente activo" />
                </div>

                <Select
                  label="País"
                  name="paisId"
                  required
                  defaultValue={String(cliente.paisId)}
                  options={paises.map((p) => ({ value: String(p.id), label: p.nombre }))}
                />
                <Input
                  label={cliente.tipoCliente === "natural" ? "Nombre completo" : "Nombre de la empresa"}
                  name="nombreVisible"
                  required
                  defaultValue={cliente.nombreVisible}
                />
                <Input label="Correo" name="email" type="email" required defaultValue={cliente.email} />
                <Input
                  label={cliente.tipoCliente === "natural" ? "Cédula" : "RUC"}
                  name="identificacion"
                  required
                  defaultValue={cliente.identificacion}
                />

                {cliente.tipoCliente === "natural" ? (
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Nombres" name="nombres" required defaultValue={cliente.nombres} />
                    <Input label="Apellidos" name="apellidos" required defaultValue={cliente.apellidos} />
                  </div>
                ) : (
                  <Input
                    label="Representante legal"
                    name="representanteLegal"
                    required
                    defaultValue={cliente.representanteLegal}
                  />
                )}

                {status && <FormStatus tone={status.tone}>{status.message}</FormStatus>}

                <Button type="submit" block loading={status?.tone === "loading"}>
                  Guardar cambios
                </Button>
              </form>
            ) : (
              //? Sin datos todavía: se muestra el estado de carga o el error.
              <div className="mt-5 flex flex-col gap-4">
                {status && <FormStatus tone={status.tone}>{status.message}</FormStatus>}
                {status?.tone === "error" && (
                  <Button variant="outline" onClick={handleClose} block>
                    Cerrar
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
