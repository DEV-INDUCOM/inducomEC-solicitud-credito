"use client";

import { useState } from "react";
import { IconAlertCircle } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { FormStatus, type FormStatusTone } from "@/components/ui/FormStatus";
import { Stepper } from "./Stepper";
import { SuccessScreen } from "./SuccessScreen";
import { Step0Datos } from "./steps-version1/Step0Datos";
import { Step1Actividad } from "./steps-version1/Step1Actividad";
import { Step2Referencias } from "./steps-version1/Step2Referencias";
import { Step3Financiera } from "./steps-version1/Step3Financiera";
import { Step4Financiamiento } from "./steps-version1/Step4Financiamiento";
import { Step5Requisitos } from "./steps-version1/Step5Requisitos";
import { Step6Firmas } from "./steps-version1/Step6Firmas";
import { Step7Condiciones } from "./steps-version1/Step7Condiciones";
import { fmt, num, validateStep } from "./validation";
import { blankState, TOTAL_STEPS, type WizardState } from "./types";

type GroupKey = "datos" | "actividad" | "activos" | "pasivos" | "financiamiento" | "condiciones";
type ListKey = "refsBancarias" | "refsComerciales" | "firmas";

function blankRow(list: ListKey) {
  if (list === "refsBancarias") return { institucion: "", tipo: "cte" as const, noCta: "" };
  if (list === "refsComerciales") return { nombre: "", direccion: "", telefono: "" };
  return { nombres: "", cargo: "", autorizadoPara: "compra" as const };
}

export function CreditRequestForm() {
  const [state, setState] = useState<WizardState>(blankState);
  const [status, setStatus] = useState<{ tone: FormStatusTone; message: string } | null>(null);
  const [folio, setFolio] = useState<string | null>(null);
  // Honeypot: campo invisible para personas, que los bots de spam sí suelen
  // rellenar. Si llega con contenido, el servidor finge éxito sin procesar.
  const [website, setWebsite] = useState("");

  const errors = state.errors;

  function setField(group: GroupKey, field: string, value: string | boolean) {
    setState((s) => ({
      ...s,
      [group]: { ...(s[group] as unknown as Record<string, unknown>), [field]: value },
      errors: { ...s.errors, [field]: "" },
    }));
  }

  function addRow(list: ListKey) {
    setState((s) => ({ ...s, [list]: [...(s[list] as unknown[]), blankRow(list)] }));
  }
  function removeRow(list: ListKey, index: number) {
    setState((s) => ({ ...s, [list]: (s[list] as unknown[]).filter((_, i) => i !== index) }));
  }
  function updateRow(list: ListKey, index: number, field: string, value: unknown) {
    setState((s) => ({
      ...s,
      [list]: (s[list] as unknown as Array<Record<string, unknown>>).map((row, i) =>
        i === index ? { ...row, [field]: value } : row
      ),
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
    setState(blankState());
    setStatus(null);
    setFolio(null);
  }

  async function submit() {
    setStatus({ tone: "loading", message: "Enviando solicitud…" });

    const { requisitos, errors: _errors, ...dataOnly } = state;
    void _errors;

    const body = new FormData();
    body.set("website", website);
    body.set("data", JSON.stringify(dataOnly));
    for (const [key, file] of Object.entries(requisitos)) {
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
    const stepErrors = validateStep(state.step, state);
    if (Object.keys(stepErrors).length) {
      setState((s) => ({ ...s, errors: stepErrors }));
      window.scrollTo({ top: 0 });
      return;
    }
    if (state.step === TOTAL_STEPS - 1) {
      void submit();
      return;
    }
    setState((s) => ({ ...s, step: s.step + 1, errors: {} }));
    window.scrollTo({ top: 0 });
  }

  if (state.submitted && folio) {
    const summaryName =
      state.datos.razonSocial.trim() ||
      `${state.datos.nombres} ${state.datos.apellidos}`.trim() ||
      "—";
    let summaryFin = "Por cotizar";
    if (state.financiamiento.tieneCotizacion === "si" && state.financiamiento.numeroCotizacion.trim()) {
      summaryFin = `Cotización ${state.financiamiento.numeroCotizacion.trim()}`;
    } else if (state.financiamiento.montoAprox.trim()) {
      summaryFin = `$ ${fmt(num(state.financiamiento.montoAprox))} aprox.`;
    }

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
            <Step0Datos
              tipoCliente={state.tipoCliente}
              datos={state.datos}
              errors={errors}
              onSelectTipoCliente={(value) =>
                setState((s) => ({ ...s, tipoCliente: value, errors: { ...s.errors, tipoCliente: "" } }))
              }
              onFieldChange={(field, value) => setField("datos", field, value)}
            />
          )}

          {state.step === 1 && (
            <Step1Actividad
              actividad={state.actividad}
              errors={errors}
              onToggleSector={(field) =>
                setState((s) => ({
                  ...s,
                  actividad: { ...s.actividad, [field]: !s.actividad[field] },
                }))
              }
              onFieldChange={(field, value) => setField("actividad", field, value)}
            />
          )}

          {state.step === 2 && (
            <Step2Referencias
              refsBancarias={state.refsBancarias}
              refsComerciales={state.refsComerciales}
              errors={errors}
              onAddBancaria={() => addRow("refsBancarias")}
              onRemoveBancaria={(i) => removeRow("refsBancarias", i)}
              onChangeBancaria={(i, field, value) => updateRow("refsBancarias", i, field, value)}
              onSetTipoCuenta={(i, tipo) => updateRow("refsBancarias", i, "tipo", tipo)}
              onAddComercial={() => addRow("refsComerciales")}
              onRemoveComercial={(i) => removeRow("refsComerciales", i)}
              onChangeComercial={(i, field, value) => updateRow("refsComerciales", i, field, value)}
            />
          )}

          {state.step === 3 && (
            <Step3Financiera
              activos={state.activos}
              pasivos={state.pasivos}
              onFieldChange={(group, field, value) => setField(group, field, value)}
            />
          )}

          {state.step === 4 && (
            <Step4Financiamiento
              financiamiento={state.financiamiento}
              errors={errors}
              onSetTieneCotizacion={(value) =>
                setState((s) => ({
                  ...s,
                  financiamiento: {
                    ...s.financiamiento,
                    tieneCotizacion: value,
                    numeroCotizacion: value === "no" ? "" : s.financiamiento.numeroCotizacion,
                  },
                  errors: { ...s.errors, numeroCotizacion: "" },
                }))
              }
              onFieldChange={(field, value) => setField("financiamiento", field, value)}
            />
          )}

          {state.step === 5 && (
            <Step5Requisitos
              requisitos={state.requisitos}
              onFileChange={(key, file) =>
                setState((s) => ({ ...s, requisitos: { ...s.requisitos, [key]: file } }))
              }
            />
          )}

          {state.step === 6 && (
            <Step6Firmas
              firmas={state.firmas}
              errors={errors}
              onAdd={() => addRow("firmas")}
              onRemove={(i) => removeRow("firmas", i)}
              onChange={(i, field, value) => updateRow("firmas", i, field, value)}
              onSetAutorizadoPara={(i, value) => updateRow("firmas", i, "autorizadoPara", value)}
            />
          )}

          {state.step === 7 && (
            <Step7Condiciones
              condiciones={state.condiciones}
              errors={errors}
              onFieldChange={(field, value) => setField("condiciones", field, value)}
              onToggleAcepta={(checked) => setField("condiciones", "acepta", checked)}
              onSignatureChange={(dataUrl) => setField("condiciones", "firmaDataUrl", dataUrl)}
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
              {state.step === TOTAL_STEPS - 1 ? "Enviar solicitud" : "Continuar →"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
