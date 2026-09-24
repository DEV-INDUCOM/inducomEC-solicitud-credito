export interface PortalCliente {
  id: string;
  nombre: string;
  pais: string | null;
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

/** Cashback: 1% de lo pagado por PayPal, menos lo ya canjeado.
 *  Sale de la vista `saldo_por_cliente`. */
export interface PortalCashback {
  /** 1% acumulado histórico, sin descontar canjes. */
  acumulado: number;
  redimido: number;
  /** Lo que el cliente puede canjear hoy (acumulado − redimido). */
  disponible: number;
  faltanteParaCanje: number;
  puedeCanjear: boolean;
}

/** Ciclo de acumulación hacia los umbrales de garantía. Se reinicia al
 *  completar USD 10.000; por eso `acumulado` no es el histórico de compras. */
export interface PortalCicloGarantia {
  id: string;
  numero: number;
  acumulado: number;
  umbral5kDesbloqueado: boolean;
  umbral10kDesbloqueado: boolean;
}

export type EstadoGarantia = "activa" | "revocada_por_limite";

/** Un beneficio desbloqueado, atado a la cotización cuyo pago cruzó el umbral. */
export interface PortalGarantia {
  id: string;
  cicloId: string;
  cicloNumero: number | null;
  umbral: number;
  cotizacionNumero: string | null;
  dealNombre: string | null;
  cotizacionUrl: string | null;
  montoPago: number;
  acumuladoAlcanzado: number;
  mesesFabrica: number;
  mesesExtension: number;
  mesesTotales: number;
  fechaInicio: string;
  fechaFinFabrica: string;
  fechaFinTotal: string;
  estado: EstadoGarantia;
  /** La extensión sigue corriendo hoy: ni revocada ni vencida. Se calcula
   *  contra la fecha actual, no se guarda (ver migración de beneficios). */
  vigente: boolean;
  /** Null mientras el cliente no haya visto el modal de desbloqueo. */
  vistaEn: string | null;
}

/** Compra que acumuló en el ciclo actual (para la tabla de la pantalla). */
export interface PortalCompraCiclo {
  pagoId: string;
  fecha: string;
  monto: number;
  acumuladoDespues: number;
  cotizacionNumero: string | null;
  dealNombre: string | null;
}

/** Todo lo que necesita la pantalla de garantía extendida en una sola pasada. */
export interface PortalGarantiaResumen {
  ciclo: PortalCicloGarantia;
  compras: PortalCompraCiclo[];
  /** Historial completo, incluidos ciclos anteriores (las garantías
   *  sobreviven al reinicio del acumulado). */
  garantias: PortalGarantia[];
  /** Garantía recién desbloqueada que el cliente todavía no vio, si la hay. */
  pendienteDeAviso: PortalGarantia | null;
  /** Garantía que perdió su extensión por culpa de `pendienteDeAviso`. */
  desplazadaPorAviso: PortalGarantia | null;
}
