export type IncentivoTipo = "cashback_1" | "garantia_extendida" | "despacho_rapido";

export interface PortalEmpresa {
  id: string;
  nombre: string;
  pais: string | null;
  incentivoActivo: IncentivoTipo | null;
}

export interface PortalPerfil {
  id: string;
  email: string;
  empresaId: string;
}

export interface PortalContext {
  perfil: PortalPerfil;
  empresa: PortalEmpresa;
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
