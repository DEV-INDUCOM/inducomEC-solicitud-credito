import type { StatusTone } from "@/components/ui/StatusBadge";
import type { EstadoSolicitud, IncentivoTipo, MetodoPago, OrigenPago } from "./types";

export const estadoSolicitudLabel: Record<EstadoSolicitud, string> = {
  recibido: "Recibido",
  en_revision: "En revisión",
  aprobado: "Aprobado",
  rechazado: "Rechazado",
  pendiente_informacion: "Pendiente de información",
};

export const estadoSolicitudTone: Record<EstadoSolicitud, StatusTone> = {
  recibido: "neutral",
  en_revision: "warning",
  aprobado: "success",
  rechazado: "danger",
  pendiente_informacion: "info",
};

export const estadoCodigoLabel: Record<"activo" | "usado" | "vencido", string> = {
  activo: "Activo",
  usado: "Usado",
  vencido: "Vencido",
};

export const estadoCodigoTone: Record<"activo" | "usado" | "vencido", StatusTone> = {
  activo: "success",
  usado: "info",
  vencido: "danger",
};

export const incentivoLabel: Record<IncentivoTipo, string> = {
  cashback_1: "Cashback 1%",
  garantia_extendida: "Garantía extendida",
  despacho_rapido: "Despacho rápido",
};

export const metodoPagoLabel: Record<MetodoPago, string> = {
  transferencia: "Transferencia bancaria",
  tarjeta: "Tarjeta de crédito",
  efectivo: "Efectivo",
  cheque: "Cheque",
  ventanilla: "Pago en ventanilla",
  otro: "Otro",
};

export const origenPagoLabel: Record<OrigenPago, string> = {
  manual: "Carga manual",
  csv: "Carga CSV",
};

export const tipoClienteLabel: Record<"natural" | "juridica", string> = {
  natural: "Persona natural",
  juridica: "Persona jurídica",
};
