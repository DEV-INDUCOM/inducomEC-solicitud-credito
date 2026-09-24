/** Reglas del programa de beneficios PayPal (cashback + garantía extendida).
 *  Los mismos números viven en la base (procesar_beneficios_pago); acá están
 *  solo para calcular lo que se muestra —progresos, faltantes, textos—, nunca
 *  para decidir si un beneficio se otorga. Eso lo decide la base. */

/** Saldo mínimo de cashback para poder canjear. */
export const CASHBACK_MINIMO_CANJE = 20;

/** Porcentaje de cashback sobre el monto pagado. */
export const CASHBACK_PORCENTAJE = 0.01;

export const UMBRAL_5K = 5000;
export const UMBRAL_10K = 10000;

/** Garantía de fábrica; la extensión se suma encima, nunca la reemplaza. */
export const MESES_GARANTIA_FABRICA = 12;

/** Cuánto falta para el siguiente umbral del ciclo, o null si ya se
 *  desbloquearon los dos (el ciclo se cierra y el siguiente arranca en 0). */
export function faltanteProximoUmbral(acumulado: number, umbral5k: boolean, umbral10k: boolean) {
  if (!umbral5k) return { umbral: UMBRAL_5K, meses: 6, faltante: Math.max(UMBRAL_5K - acumulado, 0) };
  if (!umbral10k) return { umbral: UMBRAL_10K, meses: 12, faltante: Math.max(UMBRAL_10K - acumulado, 0) };
  return null;
}

/** Progreso del ciclo completo (0–100), siempre sobre USD 10.000: es la barra
 *  con las dos marcas que ve el cliente, no el avance al siguiente hito. */
export function progresoCiclo(acumulado: number) {
  return Math.min(Math.round((acumulado / UMBRAL_10K) * 100), 100);
}

/** Progreso hacia el canje de cashback (0–100). */
export function progresoCashback(disponible: number) {
  return Math.min(Math.round((disponible / CASHBACK_MINIMO_CANJE) * 100), 100);
}
