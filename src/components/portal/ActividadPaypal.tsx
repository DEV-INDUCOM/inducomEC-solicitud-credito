"use client";

import { useId, useState } from "react";
import { IconCalendar, IconChartLine, IconChevronDown, IconInfoCircle } from "@tabler/icons-react";
import { Card, IconTile } from "@/components/ui/Card";
import { formatMonto } from "@/lib/portal/format";

/** Solo lo que necesita la gráfica: el dashboard filtra los pagos PayPal en el
 *  servidor y no manda al navegador referencias ni cotizaciones. */
export interface CompraPaypal {
  fecha: string;
  monto: number;
}

/** Periodos del selector. El filtro se calcula en el navegador: getPagos ya
 *  trae el historial completo, así que no hace falta otra consulta. */
const PERIODOS = [3, 6, 12] as const;
type Periodo = (typeof PERIODOS)[number];
const PERIODO_INICIAL: Periodo = 6;

/** Líneas guía horizontales (incluida la base en 0). */
const DIVISIONES = 3;

interface PuntoMes {
  clave: string;
  /** Mes + año completo: tooltip y lector de pantalla. */
  etiqueta: string;
  mes: string;
  /** Año visible en el eje; null cuando se omite para no saturar. */
  anio: number | null;
  total: number;
}

function claveMes(fecha: Date) {
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`;
}

/** Agrupa por mes e incluye los meses sin compras, para que la línea se lea
 *  como una evolución en el tiempo y no como puntos sueltos. */
function comprasPorMes(compras: CompraPaypal[], meses: Periodo): PuntoMes[] {
  const totales = new Map<string, number>();
  for (const compra of compras) {
    const clave = claveMes(new Date(compra.fecha));
    totales.set(clave, (totales.get(clave) ?? 0) + compra.monto);
  }

  const formatoMes = new Intl.DateTimeFormat("es-EC", { month: "short" });
  const hoy = new Date();
  const puntos: PuntoMes[] = [];

  for (let atras = meses - 1; atras >= 0; atras--) {
    const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - atras, 1);
    const mes = formatoMes.format(fecha).replace(".", "");
    // Con 12 meses no caben "mes año" en todas las columnas: el año va solo
    // en el primer punto y en enero, que es donde cambia.
    const conAnio = meses <= 6 || atras === meses - 1 || fecha.getMonth() === 0;
    puntos.push({
      clave: claveMes(fecha),
      etiqueta: `${mes} ${fecha.getFullYear()}`,
      mes,
      anio: conAnio ? fecha.getFullYear() : null,
      total: totales.get(claveMes(fecha)) ?? 0,
    });
  }

  return puntos;
}

/** Tope "redondo" del eje Y (1, 2, 2.5 o 5 × 10^n por división) para que las
 *  etiquetas se lean como 2.000 / 4.000 / 6.000 y no como 1.933,33. */
function topeEje(maximo: number) {
  const bruto = maximo / DIVISIONES;
  const magnitud = 10 ** Math.floor(Math.log10(bruto));
  const paso = [1, 2, 2.5, 5, 10].map((f) => f * magnitud).find((p) => p >= bruto) ?? 10 * magnitud;
  return paso * DIVISIONES;
}

const formatoEje = new Intl.NumberFormat("es-EC", { maximumFractionDigits: 0 });

/** Gráfica de línea sin dependencias: rejilla y etiquetas en HTML (tipografía
 *  del portal, no texto SVG que se deforma al escalar), línea y área en un SVG
 *  estirado al contenedor, y puntos como HTML para que sigan siendo círculos. */
function TendenciaMensual({ puntos }: { puntos: PuntoMes[] }) {
  const tope = topeEje(Math.max(...puntos.map((punto) => punto.total)));
  const coordenadas = puntos.map((punto, indice) => ({
    ...punto,
    x: ((indice + 0.5) / puntos.length) * 100,
    y: 100 - (punto.total / tope) * 100,
  }));

  const linea = coordenadas.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`).join(" ");
  const area = `${linea} L ${coordenadas[coordenadas.length - 1].x} 100 L ${coordenadas[0].x} 100 Z`;
  const denso = puntos.length > 6;

  return (
    <div
      role="img"
      aria-label={`Compras mediante PayPal por mes: ${puntos
        .map((punto) => `${punto.etiqueta}, ${formatMonto(punto.total)}`)
        .join("; ")}`}
      className="grid grid-cols-[auto_1fr] gap-x-3"
    >
      {/* Eje Y: etiquetas alineadas con cada línea guía. */}
      <div className="relative h-44 w-10" aria-hidden>
        {Array.from({ length: DIVISIONES + 1 }, (_, i) => (
          <span
            key={i}
            className="absolute right-0 -translate-y-1/2 text-xs tabular-nums text-[var(--text-secondary)]"
            style={{ top: `${100 - (i / DIVISIONES) * 100}%` }}
          >
            {formatoEje.format((tope / DIVISIONES) * i)}
          </span>
        ))}
      </div>

      <div className="relative h-44" aria-hidden>
        {/* Líneas guía tenues; la base (0) un poco más marcada. */}
        {Array.from({ length: DIVISIONES + 1 }, (_, i) => (
          <div
            key={i}
            className={i === 0 ? "absolute inset-x-0 border-t border-[color:var(--border-strong)]" : "absolute inset-x-0 border-t border-[color:var(--border)]"}
            style={{ top: `${100 - (i / DIVISIONES) * 100}%` }}
          />
        ))}

        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
          <path d={area} fill="var(--highlight)" fillOpacity={0.08} />
          <path
            d={linea}
            fill="none"
            stroke="var(--highlight)"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* Puntos: el title es el tooltip nativo con mes y monto. */}
        {coordenadas.map((punto) => (
          <span
            key={punto.clave}
            title={`${punto.etiqueta}: ${formatMonto(punto.total)}`}
            className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--highlight)] ring-2 ring-[var(--bg-surface)]"
            style={{ left: `${punto.x}%`, top: `${punto.y}%` }}
          />
        ))}
      </div>

      {/* Etiquetas de mes: una columna por punto, centradas igual que ellos. */}
      <div
        className="col-start-2 mt-3 grid text-center"
        style={{ gridTemplateColumns: `repeat(${puntos.length}, minmax(0, 1fr))` }}
        aria-hidden
      >
        {coordenadas.map((punto, indice) => (
          <span
            key={punto.clave}
            className={
              // Con 12 meses en móvil se muestra uno sí y uno no.
              denso && indice % 2 === 1
                ? "hidden truncate text-xs text-[var(--text-secondary)] sm:block"
                : "truncate text-xs text-[var(--text-secondary)]"
            }
          >
            {punto.mes}
            {/* En móvil el año no cabe en la columna: solo desde sm. */}
            {punto.anio && <span className="hidden sm:inline"> {punto.anio}</span>}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Actividad PayPal del dashboard: total y transacciones del periodo elegido
 *  más la evolución mensual. Los umbrales de garantía NO se muestran acá. */
export function ActividadPaypal({ compras }: { compras: CompraPaypal[] }) {
  const [periodo, setPeriodo] = useState<Periodo>(PERIODO_INICIAL);
  const selectId = useId();

  const puntos = comprasPorMes(compras, periodo);
  const total = puntos.reduce((suma, punto) => suma + punto.total, 0);
  const desde = new Date(new Date().getFullYear(), new Date().getMonth() - (periodo - 1), 1);
  const transacciones = compras.filter((compra) => new Date(compra.fecha) >= desde).length;

  return (
    <section className="flex flex-col gap-4">
      {/* Título fuera de la tarjeta, como el resto de secciones del portal. */}
      <h2 className="text-xl font-semibold text-[var(--text-primary)]">Actividad PayPal</h2>

      <Card className="flex flex-col gap-6">
        <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <IconTile variant="highlight" shape="circle">
              <IconChartLine size={22} stroke={1.75} />
            </IconTile>
            <div>
              <p className="flex items-center gap-1.5 text-sm font-medium text-[var(--text-primary)]">
                Compras mediante PayPal
                <span
                  tabIndex={0}
                  title="Suma de tus pagos con PayPal confirmados en el periodo seleccionado."
                  aria-label="Suma de tus pagos con PayPal confirmados en el periodo seleccionado."
                  className="inline-flex rounded-full text-[var(--highlight)] focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]"
                >
                  <IconInfoCircle size={16} stroke={1.75} aria-hidden />
                </span>
              </p>
              <p className="font-display text-3xl font-semibold tabular-nums text-[var(--text-primary)]">
                {formatMonto(total)}
              </p>
              <p className="text-sm text-[var(--text-secondary)]">
                {transacciones} {transacciones === 1 ? "transacción" : "transacciones"} en los últimos {periodo}{" "}
                meses
              </p>
            </div>
          </div>

          {/* Selector de periodo: select nativo (teclado y lector de pantalla
           *  gratis) con ícono de calendario y chevron propios. */}
          <div className="relative w-fit">
            <label htmlFor={selectId} className="sr-only">
              Periodo de la gráfica
            </label>
            <IconCalendar
              size={16}
              stroke={1.75}
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[var(--text-secondary)]"
            />
            <select
              id={selectId}
              value={periodo}
              onChange={(event) => setPeriodo(Number(event.target.value) as Periodo)}
              className="h-9 cursor-pointer appearance-none rounded-[var(--radius)] border border-[color:var(--border-strong)] bg-[var(--bg-surface)] pr-9 pl-9 text-sm text-[var(--text-primary)] focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]"
            >
              {PERIODOS.map((meses) => (
                <option key={meses} value={meses}>
                  Últimos {meses} meses
                </option>
              ))}
            </select>
            <IconChevronDown
              size={16}
              stroke={1.75}
              aria-hidden
              className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[var(--text-secondary)]"
            />
          </div>
        </div>

        {total > 0 ? (
          <TendenciaMensual puntos={puntos} />
        ) : (
          <p className="text-sm text-[var(--text-secondary)]">
            Aún no hay compras registradas en los últimos {periodo} meses.
          </p>
        )}
      </Card>
    </section>
  );
}
