"use client";

import { useState } from "react";
import { IconAlertCircle } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { FormStatus, type FormStatusTone } from "@/components/ui/FormStatus";
import { Stepper } from "./Stepper";
import { SuccessScreen } from "./SuccessScreen";
import { Step0TwoOptions } from "./steps-version2/Step0TwoOptions";
import { Step1TipoCliente } from "./steps-version2/Step1TipoCliente";
import { Step2Datos } from "./steps-version2/Step2Datos";
import { validateStep2 } from "./validation";
import { blankState2, TOTAL_STEPS2, type DatosStep2, type WizardState2 } from "./types";

type DatosTextField = "nombreSolicitante" | "emailSolicitante" | "rucSolicitante" | "numeroCotizacion";
type DatosFileField = Exclude<keyof DatosStep2, DatosTextField | "aceptaConsentimiento">;

// Wizard v2: 3 pasos (Inicio -> Tipo de cliente -> Datos). Vive junto a la v1
// (steps-version1 + CreditRequestForm.tsx) para poder volver a esa versión
// cuando se quiera, sin perder lo que ya estaba hecho.
export function CreditRequestForm2() {
  const [state, setState] = useState<WizardState2>(blankState2);
  const [status, setStatus] = useState<{ tone: FormStatusTone; message: string } | null>(null);
  const [folio, setFolio] = useState<string | null>(null);
  // Honeypot: campo invisible para personas, que los bots de spam sí suelen
  // rellenar. Si llega con contenido, el servidor finge éxito sin procesar.
  const [website, setWebsite] = useState("");

  const errors = state.errors;

  function setDatosField(field: DatosTextField, value: string) {
    setState((s) => ({
      ...s,
      datos: { ...s.datos, [field]: value },
      errors: { ...s.errors, [field]: "" },
    }));
  }

  function setDatosFile(field: DatosFileField, file: File | null) {
    setState((s) => ({
      ...s,
      datos: { ...s.datos, [field]: file },
      errors: { ...s.errors, [field]: "" },
    }));
  }

  function goTo(index: number) {
    if (index > state.step) return;
    setState((s) => ({ ...s, step: index, errors: {} }));
    window.scrollTo({ top: 0 });
  }

  function back() {
    setState((s) => ({ ...s, step: Math.max(0, s.step - 1), errors: {} }));
    window.scrollTo({ top: 0 });
  }

  function reset() {
    setState(blankState2());
    setStatus(null);
    setFolio(null);
  }

  async function submit() {
    setStatus({ tone: "loading", message: "Enviando solicitud…" });

    const {
      nombreSolicitante,
      emailSolicitante,
      rucSolicitante,
      numeroCotizacion,
      solicitudFirmada,
      cedula,
      rucArchivo,
      certBancario,
      refsComerciales,
      nombramiento,
      ordenCompra,
      aceptaConsentimiento,
    } = state.datos;

    const body = new FormData();
    body.set("website", website);
    body.set(
      "data",
      JSON.stringify({
        tipoSolicitud: state.tipoSolicitud,
        tipoCliente: state.tipoCliente,
        nombreSolicitante,
        emailSolicitante,
        rucSolicitante,
        numeroCotizacion,
        aceptaConsentimiento,
      })
    );
    const archivos: Record<string, File | null> = {
      solicitudFirmada,
      cedula,
      ruc: rucArchivo,
      certBancario,
      refsComerciales,
      nombramiento,
      ordenCompra,
    };
    for (const [key, file] of Object.entries(archivos)) {
      if (file instanceof File) body.set(key, file);
    }

    try {
      const res = await fetch("/api/solicitud-credito", { method: "POST", body });
      const result = (await res.json()) as { ok: boolean; folio?: string; message?: string };

      if (res.ok && result.ok) {
        setFolio(result.folio ?? `SOL-${String(Date.now()).slice(-6)}`);
        setState((s) => ({ ...s, submitted: true, errors: {} }));
        setStatus(null);
        window.scrollTo({ top: 0 });
      } else {
        setStatus({
          tone: "error",
          message: result.message ?? "No pudimos procesar tu solicitud. Intenta de nuevo.",
        });
      }
    } catch {
      setStatus({
        tone: "error",
        message: "No pudimos conectar con el servidor. Revisa tu conexión e intenta de nuevo.",
      });
    }
  }

  function next() {
    const stepErrors = validateStep2(state.step, state);
    if (Object.keys(stepErrors).length) {
      setState((s) => ({ ...s, errors: stepErrors }));
      window.scrollTo({ top: 0 });
      return;
    }
    if (state.step === TOTAL_STEPS2 - 1) {
      void submit();
      return;
    }
    setState((s) => ({ ...s, step: s.step + 1, errors: {} }));
    window.scrollTo({ top: 0 });
  }

  if (state.submitted && folio) {
    const summaryName = state.datos.nombreSolicitante.trim() || "—";
    const summaryFin =
      state.tipoSolicitud === "nueva" && state.datos.numeroCotizacion.trim()
        ? `Cotización ${state.datos.numeroCotizacion.trim()}`
        : state.tipoSolicitud === "apertura"
          ? "Apertura de línea de crédito"
          : "Por confirmar";

    return (
      <div className="mx-auto max-w-[55rem] px-6 py-10 max-[640px]:px-4">
        <SuccessScreen summaryName={summaryName} summaryFin={summaryFin} folio={folio} onReset={reset} />
      </div>
    );
  }

  return (
    <div>
      {/* Sin header propio: el PublicNavbar del layout (public) ya trae el logo,
          tenerlo también acá duplicaba el logo dos veces en la misma pantalla. */}
      <Stepper step={state.step} onGoTo={goTo} />

      {/* Honeypot anti-spam: invisible y fuera del tab order para personas reales. */}
      <input
        type="text"
        name="website"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-px w-px overflow-hidden"
      />

      <main className="mx-auto max-w-[55rem] px-6 py-6.5 pb-15 max-[640px]:px-4">
        <div className="rounded-2xl bg-[var(--bg-surface)] p-7.5 shadow-md max-[640px]:p-5">
          {Object.keys(errors).length > 0 && (
            <div className="mb-5.5 flex items-center gap-2.5 rounded-lg border border-[color:var(--state-danger-border)] bg-[var(--state-danger-bg)] px-3.5 py-2.5">
              <IconAlertCircle size={18} className="shrink-0 text-[var(--state-danger-text)]" aria-hidden="true" />
              <span className="text-sm font-medium text-[var(--state-danger-text)]">
                Revisa los campos marcados para continuar.
              </span>
            </div>
          )}

          {state.step === 0 && (
            <Step0TwoOptions
              tipoSolicitud={state.tipoSolicitud}
              errors={errors}
              onSelect={(value) =>
                setState((s) => ({ ...s, tipoSolicitud: value, errors: { ...s.errors, tipoSolicitud: "" } }))
              }
            />
          )}

          {state.step === 1 && (
            <Step1TipoCliente
              tipoCliente={state.tipoCliente}
              errors={errors}
              onSelect={(value) =>
                setState((s) => ({ ...s, tipoCliente: value, errors: { ...s.errors, tipoCliente: "" } }))
              }
            />
          )}

          {state.step === 2 && (
            <Step2Datos
              tipoSolicitud={state.tipoSolicitud}
              datos={state.datos}
              errors={errors}
              onFieldChange={setDatosField}
              onFileChange={setDatosFile}
              onToggleConsentimiento={(checked) =>
                setState((s) => ({
                  ...s,
                  datos: { ...s.datos, aceptaConsentimiento: checked },
                  errors: { ...s.errors, aceptaConsentimiento: "" },
                }))
              }
            />
          )}

          {status && (
            <div className="mt-5.5">
              <FormStatus tone={status.tone}>{status.message}</FormStatus>
            </div>
          )}

          <div className="mt-7.5 flex items-center justify-between gap-3 border-t border-[color:var(--border)] pt-5.5">
            {state.step > 0 ? (
              <Button type="button" variant="outline" size="lg" onClick={back}>
                ← Atrás
              </Button>
            ) : (
              <span />
            )}
            <Button type="button" size="lg" onClick={next} loading={status?.tone === "loading"}>
              {state.step === TOTAL_STEPS2 - 1 ? "Enviar solicitud" : "Continuar →"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
