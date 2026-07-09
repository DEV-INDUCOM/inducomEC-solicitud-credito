"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FormStatus, type FormStatusTone } from "@/components/ui/FormStatus";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import { simulateForgotPassword } from "@/lib/stubs/placeholder-actions";
import { routes } from "@/lib/config/site";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<{ tone: FormStatusTone; message: string } | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});

    const result = forgotPasswordSchema.safeParse({ email });
    if (!result.success) {
      setFieldErrors({ email: result.error.issues[0]?.message ?? "Correo no válido." });
      setStatus(null);
      return;
    }

    setStatus({ tone: "loading", message: "Enviando…" });
    const response = await simulateForgotPassword();
    setStatus({ tone: response.ok ? "success" : "error", message: response.message });
  }

  return (
    <>
      <h2 className="text-xl">Recuperar contraseña</h2>
      <p className="mt-2 text-sm text-[var(--text-secondary)] leading-normal">
        Ingresa el correo de tu cuenta y te enviaremos instrucciones para restablecer tu
        contraseña.
      </p>

      <form className="mt-6 flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
        <Input
          label="Correo electrónico"
          type="email"
          placeholder="ejemplo@empresa.com"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldErrors.email}
        />

        {status && <FormStatus tone={status.tone}>{status.message}</FormStatus>}

        <Button type="submit" block size="lg" loading={status?.tone === "loading"}>
          Enviar instrucciones
        </Button>
      </form>

      <hr className="my-6 border-t border-[color:var(--border)]" />
      <p className="text-center text-sm text-[var(--text-secondary)] leading-normal">
        <Link href={routes.login} className="font-medium text-brand-navy-600">
          ← Volver a iniciar sesión
        </Link>
      </p>
    </>
  );
}
