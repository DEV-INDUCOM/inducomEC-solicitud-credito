import { Card } from "@/components/ui/Card";
import { formatMonto } from "@/lib/portal/format";
import type { PortalPago } from "@/lib/portal/types";

/** Meses que muestra la tendencia. Se incluyen los meses sin compras para que
 *  la línea se lea como una evolución en el tiempo y no como puntos sueltos. */
const MESES_VISIBLES = 6;

interface PuntoMes {
  clave: string;
  etiqueta: string;
  total: number;
}

function comprasPorMes(pagos: PortalPago[]): PuntoMes[] {
  const totales = new Map<string, number>();
  for (const pago of pagos) {
    if (pago.origen !== "paypal") continue;
    const fecha = new Date(pago.fecha);
    const clave = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`;
    totales.set(clave, (totales.get(clave) ?? 0) + pago.montoPagado);
  }

  const formatoMes = new Intl.DateTimeFormat("es-EC", { month: "short" });
  const hoy = new Date();
  const puntos: PuntoMes[] = [];

  for (let atras = MESES_VISIBLES - 1; atras >= 0; atras--) {
    const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - atras, 1);
    const clave = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`;
    puntos.push({
      clave,
      etiqueta: formatoMes.format(fecha).replace(".", ""),
      total: totales.get(clave) ?? 0,
    });
  }

  return puntos;
}

/** Gráfica de línea en SVG, sin dependencias nuevas. Es deliberadamente
 *  secundaria: una sola serie, sin ejes ni rejilla, con la línea en acero
 *  (#00005B, --action-primary) y solo el último punto etiquetado. Cada punto
 *  lleva un <title>, que es el tooltip nativo y a la vez su nombre accesible. */
function TendenciaMensual({ puntos }: { puntos: PuntoMes[] }) {
  // Proporción ancha y baja (800×110): el SVG escala al ancho del contenedor,
  // así que la relación de aspecto es lo que fija su altura. Con esta queda
  // alrededor de 150px en el dashboard, secundaria frente a las tarjetas.
  const ancho = 800;
  const alto = 110;
  const margenY = 18;
  const maximo = Math.max(...puntos.map((punto) => punto.total));
  const paso = ancho / puntos.length;

  // Los puntos van al centro de su columna para que coincidan exactamente con
  // las etiquetas de mes, que se maquetan aparte en HTML (tipografía del
  // portal, no texto SVG que se deformaría al escalar).
  const coordenadas = puntos.map((punto, indice) => ({
    ...punto,
    x: paso * (indice + 0.5),
    y:
      maximo === 0
        ? alto - margenY
        : alto - margenY - (punto.total / maximo) * (alto - margenY * 2),
  }));

  const linea = coordenadas.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`).join(" ");
  const area = `${linea} L ${coordenadas[coordenadas.length - 1].x} ${alto - margenY} L ${coordenadas[0].x} ${alto - margenY} Z`;
  const ultimo = coordenadas[coordenadas.length - 1];

  return (
    <div className="flex flex-col gap-2">
      <svg
        viewBox={`0 0 ${ancho} ${alto}`}
        className="w-full"
        role="img"
        aria-label={`Compras mediante PayPal por mes: ${puntos
          .map((punto) => `${punto.etiqueta}, ${formatMonto(punto.total)}`)
          .join("; ")}`}
      >
        {/* Línea base recesiva, en lugar de una rejilla completa. */}
        <line
          x1={0}
          y1={alto - margenY}
          x2={ancho}
          y2={alto - margenY}
          stroke="var(--border)"
          strokeWidth={2}
        />

        {maximo > 0 && <path d={area} fill="var(--action-primary)" fillOpacity={0.07} />}

        <path
          d={linea}
          fill="none"
          stroke="var(--action-primary)"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {coordenadas.map((punto) => (
          <circle
            key={punto.clave}
            cx={punto.x}
            cy={punto.y}
            r={punto.clave === ultimo.clave ? 5.5 : 4}
            fill="var(--bg-surface)"
            stroke="var(--action-primary)"
            strokeWidth={2.5}
          >
            <title>{`${punto.etiqueta}: ${formatMonto(punto.total)}`}</title>
          </circle>
        ))}
      </svg>

      {/* Etiquetas de mes: una columna por punto, centradas igual que ellos. */}
      <div
        className="grid text-center"
        style={{ gridTemplateColumns: `repeat(${puntos.length}, minmax(0, 1fr))` }}
      >
        {coordenadas.map((punto) => (
          <span key={punto.clave} className="text-xs text-[var(--text-secondary)]">
            {punto.etiqueta}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Resumen de actividad PayPal del dashboard: una métrica del ciclo y la
 *  evolución mensual. Los umbrales de garantía NO se muestran acá. */
export function ActividadPaypal({
  pagos,
  totalCiclo,
  transaccionesCiclo,
}: {
  pagos: PortalPago[];
  totalCiclo: number;
  transaccionesCiclo: number;
}) {
  const puntos = comprasPorMes(pagos);
  const hayCompras = puntos.some((punto) => punto.total > 0);

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-[var(--text-primary)]">Actividad PayPal</h2>

      <Card className="flex flex-col gap-5">
        <div>
          <p className="font-mono text-xs font-semibold tracking-[0.06em] text-[var(--text-secondary)] uppercase">
            Compras mediante PayPal
          </p>
          <p className="font-mono text-3xl font-medium tabular-nums text-[var(--text-primary)]">
            {formatMonto(totalCiclo)}
          </p>
          <p className="text-sm text-[var(--text-secondary)]">
            {transaccionesCiclo}{" "}
            {transaccionesCiclo === 1 ? "transacción este ciclo" : "transacciones este ciclo"}
          </p>
        </div>

        {hayCompras ? (
          <TendenciaMensual puntos={puntos} />
        ) : (
          <p className="text-sm text-[var(--text-secondary)]">
            Aún no hay compras registradas en los últimos {MESES_VISIBLES} meses.
          </p>
        )}
      </Card>
    </section>
  );
}
