import type { FormErrors, WizardState } from "./types";

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || "");
const idOk = (v: string) => /^\d{10}$|^\d{13}$/.test((v || "").trim());

// Réplica de validateStep() del prototipo de referencia: mismas reglas, un paso a la vez.
export function validateStep(step: number, s: WizardState): FormErrors {
  const e: FormErrors = {};

  if (step === 0) {
    if (!s.tipoCliente) e.tipoCliente = "Selecciona el tipo de cliente.";
    if (s.tipoCliente === "juridica" && !s.datos.razonSocial.trim()) {
      e.razonSocial = "Ingresa la razón social.";
    }
    if (!s.datos.apellidos.trim()) e.apellidos = "Requerido.";
    if (!s.datos.nombres.trim()) e.nombres = "Requerido.";
    if (!idOk(s.datos.cedula)) e.cedula = "Debe tener 10 (cédula) ó 13 (RUC) dígitos.";
    if (!emailOk(s.datos.correo)) e.correo = "Correo inválido.";
  } else if (step === 1) {
    if (!s.actividad.nombreEmpresa.trim()) e.nombreEmpresa = "Requerido.";
    if (!s.actividad.actividadNegocio.trim()) e.actividadNegocio = "Requerido.";
    if (!s.actividad.direccion.trim()) e.direccion = "Requerido.";
    if (!s.actividad.ciudad.trim()) e.ciudad = "Requerido.";
    if (!s.actividad.telefono.trim() && !s.actividad.celular.trim()) {
      e.telefono = "Ingresa un teléfono o celular.";
    }
  } else if (step === 2) {
    if (s.refsBancarias.filter((r) => r.institucion.trim() && r.noCta.trim()).length === 0) {
      e.refsBancarias = "Agrega al menos una referencia bancaria completa.";
    }
  } else if (step === 4) {
    if (s.financiamiento.tieneCotizacion === "si" && !s.financiamiento.numeroCotizacion.trim()) {
      e.numeroCotizacion = "Ingresa el número de cotización.";
    }
  } else if (step === 6) {
    if (s.firmas.filter((r) => r.nombres.trim() && r.cargo.trim()).length === 0) {
      e.firmas = "Agrega al menos una persona autorizada (nombre y cargo).";
    }
  } else if (step === 7) {
    if (!s.condiciones.ciudad.trim()) e.cCiudad = "Indica la ciudad.";
    if (!s.condiciones.acepta) e.acepta = "Debes aceptar las condiciones para continuar.";
    if (!s.condiciones.firmaDataUrl) e.firma = "Firma en el recuadro.";
  }

  return e;
}

export function num(v: string) {
  return parseFloat(String(v ?? "").replace(/[^0-9.-]/g, "")) || 0;
}

export function fmt(n: number) {
  return n.toLocaleString("es-EC", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
