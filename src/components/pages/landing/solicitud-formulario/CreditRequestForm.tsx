"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { IconCircleCheck } from "@tabler/icons-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { FileField } from "@/components/ui/FileField";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { LinkButton } from "@/components/ui/LinkButton";
import { FormStatus, type FormStatusTone } from "@/components/ui/FormStatus";
import {
  ALLOWED_ATTACHMENT_TYPES,
  MAX_ATTACHMENT_SIZE_MB,
  countryOptions,
  creditRequestSchema,
} from "@/lib/validations/credit-request";
import { simulateCreditRequest } from "@/lib/stubs/placeholder-actions";
import { routes } from "@/lib/config/site";

const initialValues = {
  companyName: "",
  taxId: "",
  contactName: "",
  email: "",
  phone: "",
  country: "",
  monthlyIncome: "",
  requestedAmount: "",
  message: "",
};

export function CreditRequestForm() {
  const [values, setValues] = useState(initialValues);
  const [consent, setConsent] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<{ tone: FormStatusTone; message: string } | null>(null);
  const [reference, setReference] = useState<string | null>(null);

  function updateField<K extends keyof typeof values>(key: K, value: (typeof values)[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});

    const result = creditRequestSchema.safeParse({ ...values, consent });
    if (!result.success) {
      const errors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        errors[String(issue.path[0])] = issue.message;
      }
      setFieldErrors(errors);
      setStatus(null);
      return;
    }

    setStatus({ tone: "loading", message: "Enviando solicitud…" });
    const response = await simulateCreditRequest();

    if (response.ok) {
      setReference(`SC-${Math.floor(100000 + Math.random() * 900000)}`);
      setStatus(null);
    } else {
      setStatus({ tone: "error", message: response.message });
    }
  }

  if (reference) {
    return (
      <div className="flex flex-col items-start gap-4 px-0 py-4 text-left">
        <IconCircleCheck size={40} className="text-[var(--state-success-text)]" aria-hidden="true" />
        <div>
          <p className="text-lg font-semibold">Solicitud recibida</p>
          <p className="mt-2 text-[var(--text-secondary)]">
            Su número de referencia es <strong>{reference}</strong>. Nuestro equipo revisará la
            información y se pondrá en contacto por correo electrónico.
          </p>
        </div>
        <LinkButton href={routes.home} variant="outline">
          Volver al inicio
        </LinkButton>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="flex flex-col gap-5">
        <p className="text-sm font-semibold tracking-[0.04em] text-[var(--text-secondary)] uppercase">
          Datos de la empresa
        </p>
        <div className="grid grid-cols-2 gap-5 max-[640px]:grid-cols-1">
          <Input
            label="Razón social"
            placeholder="Nombre de la empresa"
            value={values.companyName}
            onChange={(e) => updateField("companyName", e.target.value)}
            error={fieldErrors.companyName}
          />
          <Input
            label="RUC / NIT / identificación tributaria"
            placeholder="Ej. 0999999999001"
            value={values.taxId}
            onChange={(e) => updateField("taxId", e.target.value)}
            error={fieldErrors.taxId}
          />
        </div>

        <hr className="border-t border-[color:var(--border)]" />
        <p className="text-sm font-semibold tracking-[0.04em] text-[var(--text-secondary)] uppercase">
          Datos de contacto
        </p>
        <div className="grid grid-cols-2 gap-5 max-[640px]:grid-cols-1">
          <Input
            label="Nombre del contacto"
            placeholder="Nombre y apellido"
            value={values.contactName}
            onChange={(e) => updateField("contactName", e.target.value)}
            error={fieldErrors.contactName}
          />
          <Input
            label="Correo electrónico"
            type="email"
            placeholder="ejemplo@empresa.com"
            value={values.email}
            onChange={(e) => updateField("email", e.target.value)}
            error={fieldErrors.email}
          />
          <Input
            label="Teléfono"
            type="tel"
            placeholder="+593 99 999 9999"
            value={values.phone}
            onChange={(e) => updateField("phone", e.target.value)}
            error={fieldErrors.phone}
          />
          <Select
            label="País"
            placeholder="Selecciona un país"
            options={countryOptions.map((c) => ({ value: c.value, label: c.label }))}
            value={values.country}
            onChange={(e) => updateField("country", e.target.value)}
            error={fieldErrors.country}
          />
        </div>

        <hr className="border-t border-[color:var(--border)]" />
        <p className="text-sm font-semibold tracking-[0.04em] text-[var(--text-secondary)] uppercase">
          Datos del crédito
        </p>
        <div className="grid grid-cols-2 gap-5 max-[640px]:grid-cols-1">
          <Input
            label="Ingresos mensuales estimados"
            placeholder="Ej. USD 15,000"
            value={values.monthlyIncome}
            onChange={(e) => updateField("monthlyIncome", e.target.value)}
            error={fieldErrors.monthlyIncome}
          />
          <Input
            label="Monto de crédito solicitado"
            placeholder="Ej. USD 20,000"
            value={values.requestedAmount}
            onChange={(e) => updateField("requestedAmount", e.target.value)}
            error={fieldErrors.requestedAmount}
          />
        </div>

        <Textarea
          label="Mensaje (opcional)"
          placeholder="Cuéntanos algo más sobre tu operación o necesidad de crédito."
          rows={4}
          value={values.message}
          onChange={(e) => updateField("message", e.target.value)}
          error={fieldErrors.message}
        />

        <FileField
          label="Documento de respaldo (opcional)"
          hint={`PDF, JPG o PNG · máximo ${MAX_ATTACHMENT_SIZE_MB} MB`}
          accept={ALLOWED_ATTACHMENT_TYPES.join(",")}
          maxSizeMb={MAX_ATTACHMENT_SIZE_MB}
        />

        <hr className="border-t border-[color:var(--border)]" />

        <Checkbox
          label={
            <>
              Acepto el tratamiento de mis datos personales conforme a la{" "}
              <Link href={routes.privacyPolicy}>Política de Privacidad</Link> de INDUCOM.
            </>
          }
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          error={fieldErrors.consent}
        />

        {status && <FormStatus tone={status.tone}>{status.message}</FormStatus>}

        <div className="flex flex-col items-start gap-4">
          <Button type="submit" size="lg" loading={status?.tone === "loading"}>
            Enviar solicitud
          </Button>
        </div>
      </div>
    </form>
  );
}
