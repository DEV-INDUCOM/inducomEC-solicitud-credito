"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { FormStatus, type FormStatusTone } from "@/components/ui/FormStatus";
import { loginSchema } from "@/lib/validations/auth";
import { simulateLogin } from "@/lib/stubs/placeholder-actions";
import { routes } from "@/lib/config/site";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<{ tone: FormStatusTone; message: string } | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});

    const result = loginSchema.safeParse({ email, password, rememberMe });
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
    const response = await simulateLogin();
    setStatus({ tone: response.ok ? "success" : "info", message: response.message });
  }

  return (
    <>
      <h2 className="text-xl">Iniciar sesión</h2>
      <p className="mt-2 text-sm text-[var(--text-secondary)] leading-normal">
        Ingresa con el correo y contraseña registrados en el portal.
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

        <PasswordInput
          label="Contraseña"
          placeholder="••••••••"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors.password}
          labelAction={
            <Link href={routes.forgotPassword} className="text-sm font-medium text-[var(--accent)]">
              ¿Olvidaste tu contraseña?
            </Link>
          }
        />

        <Checkbox
          label="Recordar sesión en este equipo"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
        />

        {status && <FormStatus tone={status.tone}>{status.message}</FormStatus>}

        <Button type="submit" block size="lg" loading={status?.tone === "loading"}>
          Iniciar sesión
        </Button>
      </form>

      <hr className="my-6 border-t border-[color:var(--border)]" />

      <p className="text-center text-sm text-[var(--text-secondary)] leading-normal">
        ¿Tienes un código de invitación?{" "}
        <Link href={routes.register} className="font-semibold text-[var(--accent)]">
          Regístrate aquí.
        </Link>
      </p>
      <p className="mt-3 text-center text-sm text-[var(--text-secondary)] leading-normal">
        ¿Aún no has solicitado crédito?{" "}
        <Link href={routes.creditRequest} className="font-semibold text-[var(--accent)]">
          Solicitar crédito
        </Link>
      </p>
    </>
  );
}
