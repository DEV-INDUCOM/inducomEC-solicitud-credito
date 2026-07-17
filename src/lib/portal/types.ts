export type IncentivoTipo = "cashback_1" | "garantia_extendida";

export interface PortalCliente {
  id: string;
  nombre: string;
  pais: string | null;
  incentivoActivo: IncentivoTipo | null;
}

export interface PortalPerfil {
  id: string;
  email: string;
  clienteId: string;
}

export interface PortalContext {
  perfil: PortalPerfil;
  cliente: PortalCliente;
}

export interface PortalPago {
  id: string;
  monto: number;
  fecha: string;
  origen: "manual" | "csv";
  referencia: string | null;
  /** Cuándo se cargó el pago al sistema (no la fecha de la transacción):
   *  es lo que respalda el aviso "saldo actualizado al …" en la UI. */
  creadoEn: string;
}
