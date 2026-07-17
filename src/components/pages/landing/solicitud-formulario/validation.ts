import type { FormErrors, WizardState, WizardState2 } from "./types";

//? EXPRESIONES REGULARES PARA VALIDACIONES
const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || "");
const idOk = (v: string) => /^\d{10}$|^\d{13}$/.test((v || "").trim());
const rucOk = (v: string) => /^\d{13}$/.test((v || "").trim());
const numCotiOK = (v: string) => /^\d{8}-\d{9}$/.test((v || "").trim());


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

// ---- Validación wizard v2 (steps-version2): reglas propias para el flujo de 3 pasos ----
export function validateStep2(step: number, s: WizardState2): FormErrors {
  const e: FormErrors = {};

  if (step === 0) {
    // El texto visible vive en el FormStatus de arriba (CreditRequestForm2.tsx),
    // no en un <p> por tarjeta; el valor solo necesita ser no-vacío para que
    // Object.values(errors).some(Boolean) active ese aviso.
    if (!s.tipoSolicitud) e.tipoSolicitud = "Selecciona el tipo de solicitud.";
  } else if (step === 1) {
    if (!s.tipoCliente) e.tipoCliente = "Selecciona el tipo de cliente.";
  } else if (step === 2) {
    if (!s.datos.nombres.trim()) e.nombres = "Ingresa los nombres del solicitante.";
    if (!s.datos.apellidos.trim()) e.apellidos = "Ingresa los apellidos del solicitante.";
    if (!emailOk(s.datos.emailSolicitante)) e.emailSolicitante = "Correo inválido.";
    // La razón social solo se pide (y se guarda) para persona jurídica.
    if (s.tipoCliente === "juridica" && !s.datos.razonSocial.trim()) {
      e.razonSocial = "Ingresa la razón social de la empresa.";
    }
    if (!rucOk(s.datos.rucSolicitante)) e.rucSolicitante = "El RUC debe tener 13 dígitos.";

    // Cotización solo se exige en "nueva solicitud"; en apertura de línea el campo ni se muestra.
    if (s.tipoSolicitud === "nueva" && !s.datos.numeroCotizacion.trim()) {
      if (!numCotiOK(s.datos.numeroCotizacion)) {
        e.numeroCotizacion = "El número de cotización debe tener el formato correcto (Ej. 20260140-090280887).";
      }
    }
    if (!s.datos.solicitudFirmada) e.solicitudFirmada = "Adjunta la solicitud de crédito firmada.";
    if (!s.datos.cedula) e.cedula = "Adjunta la cédula de identidad.";
    if (!s.datos.rucArchivo) e.rucArchivo = "Adjunta el RUC.";
    if (!s.datos.certBancario) e.certBancario = "Adjunta el certificado bancario.";
    if (!s.datos.refsComerciales) e.refsComerciales = "Adjunta las referencias comerciales.";
    if (!s.datos.nombramiento) e.nombramiento = "Adjunta el nombramiento del representante legal.";
    // "Orden de compra cliente" es el único documento opcional del step.
    if (!s.datos.aceptaConsentimiento) e.aceptaConsentimiento = "Debes aceptar el consentimiento para continuar.";
  }

  return e;
}

export function num(v: string) {
  return parseFloat(String(v ?? "").replace(/[^0-9.-]/g, "")) || 0;
}

export function fmt(n: number) {
  return n.toLocaleString("es-EC", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
