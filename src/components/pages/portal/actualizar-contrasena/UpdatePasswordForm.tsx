"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { FormStatus, type FormStatusTone } from "@/components/ui/FormStatus";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { routes } from "@/lib/config/site";

export function UpdatePasswordForm({ origen }: { origen?: string }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<{ tone: FormStatusTone; message: string } | null>(null);

  // Regresa al login del admin si el reset se inició desde ahí
  const loginHref = origen === "admin" ? routes.adminLogin : routes.login;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password.length < 8) {
      setStatus({ tone: "error", message: "La contraseña debe tener al menos 8 caracteres." });
      return;
    }
    if (password !== confirmPassword) {
      setStatus({ tone: "error", message: "Las contraseñas no coinciden." });
      return;
    }

    setStatus({ tone: "loading", message: "Actualizando contraseña…" });
    const { error } = await createSupabaseBrowserClient().auth.updateUser({ password });
    if (error) {
      setStatus({ tone: "error", message: "El enlace no es válido o venció. Solicita uno nuevo." });
      return;
    }
    setStatus({ tone: "success", message: "Contraseña actualizada. Ya puedes iniciar sesión." });
  }

  return (
    <>
      <h2 className="text-xl">Nueva contraseña</h2>
      <p className="mt-2 text-sm text-[var(--text-secondary)] leading-normal">
        Elige una contraseña nueva para tu cuenta.
      </p>
      <form className="mt-6 flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
        <PasswordInput
          label="Nueva contraseña"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <PasswordInput
          label="Confirmar contraseña"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
        />
        {status && <FormStatus tone={status.tone}>{status.message}</FormStatus>}
        <Button type="submit" block size="lg" loading={status?.tone === "loading"}>
          Guardar contraseña
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
        <Link href={loginHref} className="font-medium text-[var(--accent)]">Volver a iniciar sesión</Link>
      </p>
    </>
  );
}
