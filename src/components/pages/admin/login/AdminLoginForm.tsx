"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { FormStatus, type FormStatusTone } from "@/components/ui/FormStatus";
import { loginSchema } from "@/lib/validations/auth";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { routes } from "@/lib/config/site";

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<{ tone: FormStatusTone; message: string } | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const errors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        errors[String(issue.path[0])] = issue.message;
      }
      setFieldErrors(errors);
      setStatus(null);
      return;
    }

    setStatus({ tone: "loading", message: "Verificando credenciales…" });
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: result.data.email,
      password: result.data.password,
    });

    if (error || !data.user) {
      setStatus({ tone: "error", message: "Correo o contraseña incorrectos." });
      return;
    }

    const { data: personal, error: personalError } = await supabase
      .from("personal_interno")
      .select("id, activo")
      .eq("id", data.user.id)
      .maybeSingle();

    if (personalError || !personal || !personal.activo) {
      await supabase.auth.signOut();
      setStatus({ tone: "error", message: "Tu cuenta no tiene acceso al panel administrativo." });
      return;
    }

    router.replace(routes.adminResumen);
    router.refresh();
  }

  return (
    <>
      <h2 className="text-xl">Panel administrativo</h2>
      <p className="mt-2 text-sm text-[var(--text-secondary)] leading-normal">
        Acceso exclusivo para personal interno de INDUCOM.
      </p>

      <form className="mt-6 flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
        <Input
          label="Correo electrónico"
          type="email"
          placeholder="nombre@inducom.com"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldErrors.email}
        />

        <PasswordInput
          label="Contraseña"
          placeholder="••••••••"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors.password}
        />

        {status && <FormStatus tone={status.tone}>{status.message}</FormStatus>}

        <Button type="submit" block size="lg" loading={status?.tone === "loading"}>
          Iniciar sesión
        </Button>
      </form>
    </>
  );
}
