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
  montoPagado: number;
  fecha: string;
  origen: "manual" | "csv" | "paypal";
  referencia: string | null;
  /** Snapshot de la cotización que originó el pago (solo pagos PayPal).
   *  Se guardan en `pagos` al registrarlo, no se leen del esquema `payments`:
   *  si la cotización se edita después, el histórico no debe cambiar. */
  cotizacionNumero: string | null;
  dealNombre: string | null;
  montoCotizado: number | null;
  /** Link público a la cotización; el cliente puede abrirlo. */
  cotizacionUrl: string | null;
  /** Cuándo se cargó el pago al sistema (no la fecha de la transacción):
   *  es lo que respalda el aviso "saldo actualizado al …" en la UI. */
  creadoEn: string;
}
