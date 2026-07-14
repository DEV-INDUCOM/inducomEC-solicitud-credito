export type TipoCliente = "" | "natural" | "juridica";

export interface DatosPersonales {
  razonSocial: string;
  apellidos: string;
  nombres: string;
  cedula: string;
  nacionalidad: string;
  fechaNac: string;
  correo: string;
  cyApPaterno: string;
  cyApMaterno: string;
  cyNombres: string;
  cyCedula: string;
  cyNacionalidad: string;
  cyFechaNac: string;
}

export interface ActividadEconomica {
  publica: boolean;
  privada: boolean;
  comercial: boolean;
  servicios: boolean;
  produccion: boolean;
  nombreEmpresa: string;
  actividadNegocio: string;
  direccion: string;
  provincia: string;
  ciudad: string;
  correo: string;
  sector: string;
  telefono: string;
  celular: string;
}

export type TipoCuenta = "ahorro" | "cte";

export interface ReferenciaBancaria {
  institucion: string;
  tipo: TipoCuenta;
  noCta: string;
}

export interface ReferenciaComercial {
  nombre: string;
  direccion: string;
  telefono: string;
}

export interface Activos {
  cajaBancos: string;
  cuentasCobrar: string;
  inventario: string;
  terrenos: string;
  inmuebles: string;
  vehiculos: string;
  otrosBienes: string;
}

export interface Pasivos {
  prestamos: string;
  documentosPagar: string;
  otrasInstituciones: string;
  otrasDeudas: string;
}

export type TieneCotizacion = "" | "si" | "no";

export interface Financiamiento {
  tieneCotizacion: TieneCotizacion;
  numeroCotizacion: string;
  equipoDescripcion: string;
  montoAprox: string;
  plazoMeses: string;
}

export interface RequisitosArchivos {
  ruc: File | null;
  cedulaColor: File | null;
  nombramientos: File | null;
  certBancarios: File | null;
  certComerciales: File | null;
}

export type AutorizadoPara = "compra" | "retiros" | "ambos";

export interface FirmaAutorizada {
  nombres: string;
  cargo: string;
  autorizadoPara: AutorizadoPara;
}

export interface Condiciones {
  ciudad: string;
  fecha: string;
  acepta: boolean;
  firmaDataUrl: string;
}

export type FormErrors = Record<string, string>;

export interface WizardState {
  step: number;
  submitted: boolean;
  tipoCliente: TipoCliente;
  datos: DatosPersonales;
  actividad: ActividadEconomica;
  refsBancarias: ReferenciaBancaria[];
  refsComerciales: ReferenciaComercial[];
  activos: Activos;
  pasivos: Pasivos;
  financiamiento: Financiamiento;
  requisitos: RequisitosArchivos;
  firmas: FirmaAutorizada[];
  condiciones: Condiciones;
  errors: FormErrors;
}

export const STEP_TITLES = [
  "Datos personales",
  "Actividad económica",
  "Referencias",
  "Estado de situación financiera",
  "Financiamiento solicitado",
  "Requisitos",
  "Firmas autorizadas",
  "Condiciones y firma",
] as const;

export const STEP_SHORT_LABELS = [
  "Datos",
  "Actividad",
  "Referencias",
  "Finanzas",
  "Equipo",
  "Requisitos",
  "Firmas",
  "Revisión",
] as const;

//! ***************************** VERSION 2 (3 pasos) *****************************

// Version 2 of the steps
export const STEP_SHORT_LABELS2 = [
  "Inicio",
  "Tipo de cliente",
  "Datos",

] as const;



// Títulos largos del encabezado del Stepper para la versión 2 (3 pasos).
export const STEP_TITLES2 = [
  "Tipo de solicitud",
  "Tipo de cliente",
  "Datos y documentos",
] as const;

export const TOTAL_STEPS = STEP_TITLES.length;

// ---- Wizard v2 (steps-version2): flujo reducido a 3 pasos ----
export type TipoSolicitud = "" | "nueva" | "apertura";

export interface DatosStep2 {
  // Datos del solicitante: la tabla solicitudes_credito exige nombre y correo
  // (columnas NOT NULL), por eso v2 también los recolecta.
  nombreSolicitante: string;
  emailSolicitante: string;
  // Solo aplica a persona jurídica; se guarda en la columna nombre_empresa.
  razonSocial: string;
  rucSolicitante: string;
  // Solo aplica cuando tipoSolicitud === "nueva"; en apertura de línea no hay cotización.
  numeroCotizacion: string;
  solicitudFirmada: File | null;
  cedula: File | null;
  rucArchivo: File | null;
  certBancario: File | null;
  refsComerciales: File | null;
  nombramiento: File | null;
  ordenCompra: File | null;
  // El envío del formulario exige aceptar el consentimiento (constraint en BD).
  aceptaConsentimiento: boolean;
}

export interface WizardState2 {
  step: number;
  submitted: boolean;
  tipoSolicitud: TipoSolicitud;
  tipoCliente: TipoCliente;
  datos: DatosStep2;
  errors: FormErrors;
}

export const TOTAL_STEPS2 = STEP_SHORT_LABELS2.length;

export function blankState2(): WizardState2 {
  return {
    step: 0,
    submitted: false,
    tipoSolicitud: "",
    tipoCliente: "",
    datos: {
      nombreSolicitante: "",
      emailSolicitante: "",
      razonSocial: "",
      rucSolicitante: "",
      numeroCotizacion: "",
      solicitudFirmada: null,
      cedula: null,
      rucArchivo: null,
      certBancario: null,
      refsComerciales: null,
      nombramiento: null,
      ordenCompra: null,
      aceptaConsentimiento: false,
    },
    errors: {},
  };
}

export function blankState(): WizardState {
  return {
    step: 0,
    submitted: false,
    tipoCliente: "",
    datos: {
      razonSocial: "",
      apellidos: "",
      nombres: "",
      cedula: "",
      nacionalidad: "",
      fechaNac: "",
      correo: "",
      cyApPaterno: "",
      cyApMaterno: "",
      cyNombres: "",
      cyCedula: "",
      cyNacionalidad: "",
      cyFechaNac: "",
    },
    actividad: {
      publica: false,
      privada: false,
      comercial: false,
      servicios: false,
      produccion: false,
      nombreEmpresa: "",
      actividadNegocio: "",
      direccion: "",
      provincia: "",
      ciudad: "",
      correo: "",
      sector: "",
      telefono: "",
      celular: "",
    },
    refsBancarias: [{ institucion: "", tipo: "cte", noCta: "" }],
    refsComerciales: [{ nombre: "", direccion: "", telefono: "" }],
    activos: {
      cajaBancos: "",
      cuentasCobrar: "",
      inventario: "",
      terrenos: "",
      inmuebles: "",
      vehiculos: "",
      otrosBienes: "",
    },
    pasivos: {
      prestamos: "",
      documentosPagar: "",
      otrasInstituciones: "",
      otrasDeudas: "",
    },
    financiamiento: {
      tieneCotizacion: "",
      numeroCotizacion: "",
      equipoDescripcion: "",
      montoAprox: "",
      plazoMeses: "",
    },
    requisitos: {
      ruc: null,
      cedulaColor: null,
      nombramientos: null,
      certBancarios: null,
      certComerciales: null,
    },
    firmas: [{ nombres: "", cargo: "", autorizadoPara: "compra" }],
    condiciones: { ciudad: "", fecha: "", acepta: false, firmaDataUrl: "" },
    errors: {},
  };
}
