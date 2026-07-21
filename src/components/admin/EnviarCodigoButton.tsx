"use client";

import { useState } from "react";
import { IconCheck, IconMail } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { enviarCorreoCodigo } from "@/lib/admin/actions";

export function EnviarCodigoButton({ codigo }: { codigo: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);

  async function handleClick() {
    setLoading(true);
    setError(null);
    const result = await enviarCorreoCodigo(codigo);
    setLoading(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }
    setEnviado(true);
  }

  if (enviado) {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm text-[var(--state-success-text)]">
        <IconCheck size={16} stroke={2} />
        Correo enviado al cliente.
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Button type="button" variant="outline" onClick={handleClick} loading={loading} block>
        <IconMail size={16} stroke={1.75} />
        Enviar código por correo
      </Button>
      {error && <p className="text-sm text-[var(--state-danger-text)]">{error}</p>}
    </div>
  );
}
