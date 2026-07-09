"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { FormStatus, type FormStatusTone } from "@/components/ui/FormStatus";
import { invitationCodeSchema, registerAccountSchema } from "@/lib/validations/auth";
import { simulateRegisterAccount, simulateValidateInvitationCode } from "@/lib/stubs/placeholder-actions";
import { routes } from "@/lib/config/site";

type Step = "code" | "account";

export function RegisterForm() {
  const [step, setStep] = useState<Step>("code");
  const [code, setCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<{ tone: FormStatusTone; message: string } | null>(null);

  async function handleValidateCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});

    const result = invitationCodeSchema.safeParse({ code });
    if (!result.success) {
      setFieldErrors({ code: result.error.issues[0]?.message ?? "Código no válido." });
      setStatus(null);
      return;
    }

    setStatus({ tone: "loading", message: "Validando código…" });
    const response = await simulateValidateInvitationCode(result.data.code);
    setStatus({ tone: response.ok ? "success" : "error", message: response.message });

    if (response.ok) {
      setStep("account");
      setStatus(null);
    }
  }

  async function handleCreateAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});

    const result = registerAccountSchema.safeParse({ fullName, email, password, confirmPassword });
    if (!result.success) {
      const errors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        errors[String(issue.path[0])] = issue.message;
      }
      setFieldErrors(errors);
      setStatus(null);
      return;
    }

    setStatus({ tone: "loading", message: "Creando cuenta…" });
    const response = await simulateRegisterAccount();
    setStatus({ tone: response.ok ? "success" : "info", message: response.message });
  }

  if (step === "account") {
    return (
      <>
        <h2 className="text-xl">Crea tu cuenta</h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)] leading-normal">
          Código verificado. Completa tus datos para finalizar el registro.
        </p>

        <form className="mt-6 flex flex-col gap-5" onSubmit={handleCreateAccount} noValidate>
          <Input
            label="Nombre completo"
            placeholder="Nombre y apellido"
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            error={fieldErrors.fullName}
          />
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
            placeholder="Mínimo 8 caracteres"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
          />
          <PasswordInput
            label="Confirmar contraseña"
            placeholder="Repite tu contraseña"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={fieldErrors.confirmPassword}
          />

          {status && <FormStatus tone={status.tone}>{status.message}</FormStatus>}

          <Button type="submit" block size="lg" loading={status?.tone === "loading"}>
            Crear cuenta
          </Button>

          <Button type="button" variant="ghost" size="sm" onClick={() => setStep("code")}>
            ← Cambiar código de invitación
          </Button>
        </form>

        <hr className="my-6 border-t border-[color:var(--border)]" />
        <p className="text-center text-sm text-[var(--text-secondary)] leading-normal">
          ¿Ya tienes una cuenta?{" "}
          <Link href={routes.login} className="font-medium text-brand-navy-600">
            Iniciar sesión
          </Link>
        </p>
      </>
    );
  }

  return (
    <>
      <h2 className="text-xl">Crear cuenta</h2>
      <p className="mt-2 text-sm text-[var(--text-secondary)] leading-normal">
        Ingresa tu código de invitación para continuar con el registro.
      </p>

      <form className="mt-6 flex flex-col gap-5" onSubmit={handleValidateCode} noValidate>
        <Input
          label="Código de invitación"
          placeholder="Ej. IND-XXXXXX"
          autoComplete="off"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          error={fieldErrors.code}
        />

        {status && <FormStatus tone={status.tone}>{status.message}</FormStatus>}

        <Button type="submit" block size="lg" loading={status?.tone === "loading"}>
          Validar código
        </Button>
      </form>

      <hr className="my-6 border-t border-[color:var(--border)]" />
      <p className="text-center text-sm text-[var(--text-secondary)] leading-normal">
        ¿Ya tienes una cuenta?{" "}
        <Link href={routes.login} className="font-semibold text-[var(--accent)]">
          Iniciar sesión
        </Link>
      </p>
    </>
  );
}
