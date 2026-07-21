"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { FormStatus, type FormStatusTone } from "@/components/ui/FormStatus";
import { asignarIncentivo } from "@/lib/admin/actions";
import { incentivoLabel } from "@/lib/admin/labels";
import type { IncentivoTipo } from "@/lib/admin/types";

const SIN_INCENTIVO = "sin_incentivo";

export function IncentivoSelector({
  clienteId,
  incentivoActual,
}: {
  clienteId: string;
  incentivoActual: IncentivoTipo | null;
}) {
  const router = useRouter();
  const [valor, setValor] = useState(incentivoActual ?? SIN_INCENTIVO);
  const [status, setStatus] = useState<{ tone: FormStatusTone; message: string } | null>(null);

  const cambioSinGuardar = valor !== (incentivoActual ?? SIN_INCENTIVO);

  async function handleGuardar() {
    setStatus({ tone: "loading", message: "Guardando…" });
    const tipo = valor === SIN_INCENTIVO ? null : (valor as IncentivoTipo);
    const result = await asignarIncentivo(clienteId, tipo);

    if (!result.ok) {
      setStatus({ tone: "error", message: result.message });
      return;
    }

    setStatus({ tone: "success", message: "Incentivo actualizado." });
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-3">
      <Select
        label="Incentivo activo"
        value={valor}
        onChange={(event) => {
          setValor(event.target.value);
          setStatus(null);
        }}
        options={[
          { value: SIN_INCENTIVO, label: "Sin incentivo" },
          { value: "cashback_1", label: incentivoLabel.cashback_1 },
          { value: "garantia_extendida", label: incentivoLabel.garantia_extendida },
          { value: "despacho_rapido", label: incentivoLabel.despacho_rapido },
        ]}
      />
      {status && <FormStatus tone={status.tone}>{status.message}</FormStatus>}
      <Button size="sm" onClick={handleGuardar} disabled={!cambioSinGuardar} loading={status?.tone === "loading"}>
        Guardar
      </Button>
    </div>
  );
}
