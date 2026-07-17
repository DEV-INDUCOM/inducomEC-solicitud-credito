export interface AdminPerfil {
  id: string;
  nombre: string;
  email: string;
}

export type EstadoSolicitud = "recibido" | "en_revision" | "aprobado" | "rechazado" | "pendiente_informacion";

export type TipoCliente = "natural" | "juridica";

export type OrigenPago = "manual" | "csv";

export type MetodoPago = "transferencia" | "tarjeta" | "efectivo" | "cheque" | "ventanilla" | "otro";

export type IncentivoTipo = "cashback_1" | "garantia_extendida" | "despacho_rapido";

export interface AdminSolicitudListItem {
  id: string;
  folio: string;
  nombreSolicitante: string;
  nombreEmpresa: string | null;
  identificacion: string;
  pais: string | null;
  estado: EstadoSolicitud;
  cantidadDocumentos: number;
  createdAt: string;
}

export interface AdminDocumento {
  id: string;
  nombreArchivo: string;
  tipoMime: string;
  tamanoBytes: number;
  storagePath: string;
}

export interface AdminHistorialEntry {
  id: string;
  estadoAnterior: EstadoSolicitud;
  estadoNuevo: EstadoSolicitud;
  nota: string | null;
  actorNombre: string | null;
  createdAt: string;
}

export interface AdminSolicitudDetalle {
  id: string;
  folio: string;
  estado: EstadoSolicitud;
  nombreSolicitante: string;
  emailSolicitante: string;
  telefonoSolicitante: string | null;
  identificacion: string;
  pais: string | null;
  nombreEmpresa: string | null;
  datosAdicionales: Record<string, unknown>;
  consentimientoAceptado: boolean;
  consentimientoFecha: string | null;
  createdAt: string;
  montoSolicitado: number | null;
  documentos: AdminDocumento[];
  historial: AdminHistorialEntry[];
}

export interface AdminClienteListItem {
  id: string;
  nombre: string;
  identificacion: string;
  tipoCliente: TipoCliente;
  pais: string | null;
  usuarios: number;
  incentivoActivo: IncentivoTipo | null;
  totalPagos: number;
  cashbackAcumulado: number | null;
  ultimoPago: string | null;
}

export interface AdminClienteDetalle {
  id: string;
  nombre: string;
  identificacion: string;
  tipoCliente: TipoCliente;
  pais: string | null;
  email: string;
  incentivoActivo: IncentivoTipo | null;
  usuarios: { id: string; email: string }[];
  pagos: AdminPago[];
  saldo: number;
}

export interface AdminPago {
  id: string;
  clienteId: string;
  clienteNombre: string;
  monto: number;
  fecha: string;
  origen: OrigenPago;
  metodoPago: MetodoPago | null;
  referencia: string | null;
  createdAt: string;
}

export interface AdminCodigo {
  id: string;
  codigo: string;
  clienteId: string;
  clienteNombre: string;
  estado: "activo" | "usado" | "vencido";
  fechaVencimiento: string;
  usadoPorEmail: string | null;
  createdAt: string;
}
