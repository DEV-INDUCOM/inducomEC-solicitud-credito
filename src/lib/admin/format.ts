export { formatFecha, formatMonto } from "@/lib/portal/format";

/** Mismo criterio que el route.ts público (`SOL-${id.slice(0,8).toUpperCase()}`):
 *  el folio que ve el cliente en su correo/pantalla de éxito debe ser
 *  identificable en el panel con el mismo formato. */
export function getFolio(id: string) {
  return `SOL-${id.slice(0, 8).toUpperCase()}`;
}

export function formatFechaHora(iso: string) {
  return new Intl.DateTimeFormat("es-EC", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
