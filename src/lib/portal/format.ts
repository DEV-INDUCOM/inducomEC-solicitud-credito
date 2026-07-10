/** Locale por defecto del portal: INDUCOM opera en EC/BO/PE/CO, es-EC es la
 *  convención de referencia (ver design-portal.md sección 4). */
export function formatMonto(valor: number) {
  return new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD" }).format(
    Number.isFinite(valor) ? valor : 0
  );
}

export function formatFecha(iso: string) {
  return new Intl.DateTimeFormat("es-EC", { dateStyle: "medium" }).format(new Date(iso));
}
