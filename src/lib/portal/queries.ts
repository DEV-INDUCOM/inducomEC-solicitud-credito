import "server-only";
import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CASHBACK_MINIMO_CANJE } from "./beneficios";
import type {
  PortalCashback,
  PortalCompraCiclo,
  PortalContext,
  PortalGarantia,
  PortalGarantiaResumen,
  PortalPago,
} from "./types";

export type PortalContextResult =
  | { ok: true; data: PortalContext }
  | { ok: false; reason: "sin-sesion" | "sin-perfil" | "cliente-inactivo" | "error" };

/**
 * Perfil + cliente (persona natural o jurídica) del usuario autenticado. El
 * middleware (proxy.ts) ya filtra "sin sesión" / "sin perfil" antes de llegar
 * aquí, pero el layout del portal vuelve a resolverlo (defensa en profundidad:
 * sesión que expira en el medio, perfil eliminado) para poder mostrar un
 * estado propio en vez de asumir que siempre hay datos. `cache()` deduplica
 * la consulta cuando el layout y la página piden el contexto en el mismo
 * request.
 */
export const getPortalContext = cache(async (): Promise<PortalContextResult> => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, reason: "sin-sesion" };

  const { data: perfil, error: perfilError } = await supabase
    .from("perfiles")
    .select("id, email, cliente_id")
    .eq("id", user.id)
    .maybeSingle();
  if (perfilError) return { ok: false, reason: "error" };
  if (!perfil) return { ok: false, reason: "sin-perfil" };

  // `nombre_visible` vive en `clientes` (no hace falta unir con el subtipo
  // personas_naturales/empresas): es el mismo nombre para ambos tipos hoy.
  const { data: clienteRaw, error: clienteError } = await supabase
    .from("clientes")
    .select("id, nombre_visible, activo, paises(nombre)")
    .eq("id", perfil.cliente_id)
    .maybeSingle();
  if (clienteError) return { ok: false, reason: "error" };
  if (!clienteRaw) return { ok: false, reason: "sin-perfil" };

  // El cliente Supabase no está tipado con un schema generado; el embed
  // `paises(nombre)` se tipa a mano acá en vez de confiar en la inferencia.
  const cliente = clienteRaw as unknown as {
    id: string;
    nombre_visible: string;
    activo: boolean;
    paises: { nombre: string } | { nombre: string }[] | null;
  };

  // Cliente desactivado por INDUCOM: la sesión sigue siendo válida, pero no
  // debe poder usar el portal. Se corta acá, no ocultando botones en la UI.
  if (!cliente.activo) return { ok: false, reason: "cliente-inactivo" };

  const pais = Array.isArray(cliente.paises) ? cliente.paises[0]?.nombre : cliente.paises?.nombre;

  // Ya no se consulta `incentivos_cliente`: el cashback del 1% es universal
  // (lo aplica la vista saldo_por_cliente) y no hay incentivos asignables.
  // La tabla sigue existiendo en la base, solo dejó de usarse.
  return {
    ok: true,
    data: {
      perfil: { id: perfil.id, email: perfil.email, clienteId: perfil.cliente_id },
      cliente: {
        id: cliente.id,
        nombre: cliente.nombre_visible,
        pais: pais ?? null,
      },
    },
  };
});

/**
 * El "saldo" que ve el cliente es siempre el cashback (1% de lo pagado por
 * PayPal) menos lo que ya canjeó. Todo lo calcula la vista
 * `saldo_por_cliente` (ver 20260923000000_beneficios_cashback_garantia.sql);
 * acá solo se deriva el faltante para llegar al mínimo de canje.
 */
export async function getCashback(
  clienteId: string
): Promise<{ ok: true; cashback: PortalCashback } | { ok: false }> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("saldo_por_cliente")
    .select("saldo_cashback, cashback_redimido, cashback_disponible")
    .eq("cliente_id", clienteId)
    .maybeSingle();
  if (error) return { ok: false };

  const disponible = Number(data?.cashback_disponible ?? 0);
  return {
    ok: true,
    cashback: {
      acumulado: Number(data?.saldo_cashback ?? 0),
      redimido: Number(data?.cashback_redimido ?? 0),
      disponible,
      faltanteParaCanje: Math.max(CASHBACK_MINIMO_CANJE - disponible, 0),
      puedeCanjear: disponible >= CASHBACK_MINIMO_CANJE,
    },
  };
}

export async function getPagos(
  clienteId: string,
  limit?: number
): Promise<{ ok: true; pagos: PortalPago[] } | { ok: false }> {
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("pagos")
    .select(
      "id, monto_pagado, fecha, origen, referencia, created_at, cotizacion_numero, deal_nombre, monto_cotizado, cotizacion_url"
    )
    .eq("cliente_id", clienteId)
    .order("fecha", { ascending: false });
  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error || !data) return { ok: false };

  return {
    ok: true,
    pagos: data.map((pago) => ({
      id: pago.id,
      montoPagado: Number(pago.monto_pagado),
      fecha: pago.fecha,
      origen: pago.origen as "manual" | "csv" | "paypal",
      referencia: pago.referencia,
      creadoEn: pago.created_at,
      // Snapshot de la cotización: null en pagos manuales/CSV.
      cotizacionNumero: pago.cotizacion_numero,
      dealNombre: pago.deal_nombre,
      montoCotizado: pago.monto_cotizado === null ? null : Number(pago.monto_cotizado),
      cotizacionUrl: pago.cotizacion_url,
    })),
  };
}

/** Fila cruda de `garantias_extendidas` con el número de ciclo embebido.
 *  El cliente de Supabase no está tipado con un schema generado, así que los
 *  embeds se tipan a mano (mismo criterio que `paises(nombre)` más arriba). */
interface GarantiaRow {
  id: string;
  ciclo_id: string;
  umbral: number;
  cotizacion_numero: string | null;
  deal_nombre: string | null;
  cotizacion_url: string | null;
  monto_pago: number;
  acumulado_alcanzado: number;
  meses_fabrica: number;
  meses_extension: number;
  meses_totales: number;
  fecha_inicio: string;
  fecha_fin_fabrica: string;
  fecha_fin_total: string;
  estado: "activa" | "revocada_por_limite";
  vista_en: string | null;
  desplazada_por: string | null;
  ciclos_garantia: { numero: number } | { numero: number }[] | null;
}

function mapGarantia(row: GarantiaRow, hoy: string): PortalGarantia {
  const ciclo = Array.isArray(row.ciclos_garantia) ? row.ciclos_garantia[0] : row.ciclos_garantia;
  return {
    id: row.id,
    cicloId: row.ciclo_id,
    cicloNumero: ciclo?.numero ?? null,
    umbral: Number(row.umbral),
    cotizacionNumero: row.cotizacion_numero,
    dealNombre: row.deal_nombre,
    cotizacionUrl: row.cotizacion_url,
    montoPago: Number(row.monto_pago),
    acumuladoAlcanzado: Number(row.acumulado_alcanzado),
    mesesFabrica: row.meses_fabrica,
    mesesExtension: row.meses_extension,
    mesesTotales: row.meses_totales,
    fechaInicio: row.fecha_inicio,
    fechaFinFabrica: row.fecha_fin_fabrica,
    fechaFinTotal: row.fecha_fin_total,
    estado: row.estado,
    // La expiración no se guarda en la base (sería un job diario): se compara
    // la fecha de fin con hoy, en formato YYYY-MM-DD para que ordene bien.
    vigente: row.estado === "activa" && row.fecha_fin_total >= hoy,
    vistaEn: row.vista_en,
  };
}

/**
 * Ciclo actual + compras que acumularon en él + historial de garantías.
 * Va todo junto porque la pantalla de garantía necesita las tres cosas y
 * salen de tres consultas que no dependen entre sí.
 *
 * Un cliente sin pagos PayPal todavía no tiene fila en `ciclos_garantia`
 * (el ciclo se crea con el primer pago): en ese caso se devuelve un ciclo 1
 * en cero, que es exactamente lo que hay que mostrar.
 */
export async function getGarantiaResumen(
  clienteId: string
): Promise<{ ok: true; resumen: PortalGarantiaResumen } | { ok: false }> {
  const supabase = await createSupabaseServerClient();
  const hoy = new Date().toISOString().slice(0, 10);

  const [cicloRes, garantiasRes] = await Promise.all([
    supabase
      .from("ciclos_garantia")
      .select("id, numero, acumulado, umbral_5k_pago_id, umbral_10k_pago_id")
      .eq("cliente_id", clienteId)
      .eq("estado", "abierto")
      .maybeSingle(),
    supabase
      .from("garantias_extendidas")
      .select(
        "id, ciclo_id, umbral, cotizacion_numero, deal_nombre, cotizacion_url, monto_pago, acumulado_alcanzado, meses_fabrica, meses_extension, meses_totales, fecha_inicio, fecha_fin_fabrica, fecha_fin_total, estado, vista_en, desplazada_por, ciclos_garantia(numero)"
      )
      .eq("cliente_id", clienteId)
      .order("created_at", { ascending: false }),
  ]);

  if (cicloRes.error || garantiasRes.error) return { ok: false };

  const cicloRow = cicloRes.data as {
    id: string;
    numero: number;
    acumulado: number;
    umbral_5k_pago_id: string | null;
    umbral_10k_pago_id: string | null;
  } | null;

  const ciclo = {
    id: cicloRow?.id ?? "",
    numero: cicloRow?.numero ?? 1,
    acumulado: Number(cicloRow?.acumulado ?? 0),
    umbral5kDesbloqueado: cicloRow?.umbral_5k_pago_id != null,
    umbral10kDesbloqueado: cicloRow?.umbral_10k_pago_id != null,
  };

  let compras: PortalCompraCiclo[] = [];
  if (cicloRow) {
    const { data, error } = await supabase
      .from("pagos_ciclo_garantia")
      .select("pago_id, monto, acumulado_despues, pagos(fecha, cotizacion_numero, deal_nombre)")
      .eq("ciclo_id", cicloRow.id)
      .order("acumulado_despues", { ascending: false });
    if (error) return { ok: false };

    compras = (data ?? []).map((fila) => {
      const row = fila as unknown as {
        pago_id: string;
        monto: number;
        acumulado_despues: number;
        pagos:
          | { fecha: string; cotizacion_numero: string | null; deal_nombre: string | null }
          | { fecha: string; cotizacion_numero: string | null; deal_nombre: string | null }[]
          | null;
      };
      const pago = Array.isArray(row.pagos) ? row.pagos[0] : row.pagos;
      return {
        pagoId: row.pago_id,
        fecha: pago?.fecha ?? "",
        monto: Number(row.monto),
        acumuladoDespues: Number(row.acumulado_despues),
        cotizacionNumero: pago?.cotizacion_numero ?? null,
        dealNombre: pago?.deal_nombre ?? null,
      };
    });
  }

  const filas = (garantiasRes.data ?? []) as unknown as GarantiaRow[];
  const garantias = filas.map((fila) => mapGarantia(fila, hoy));

  // El modal se muestra una sola vez: la garantía más reciente sin `vista_en`.
  const filaPendiente = filas.find((fila) => fila.vista_en === null) ?? null;
  const pendienteDeAviso = filaPendiente ? mapGarantia(filaPendiente, hoy) : null;
  // Si esa garantía desplazó a otra (regla del máximo de 2), el mismo modal
  // tiene que avisarlo: el cliente no puede enterarse en silencio.
  const filaDesplazada = filaPendiente
    ? filas.find((fila) => fila.desplazada_por === filaPendiente.id) ?? null
    : null;

  return {
    ok: true,
    resumen: {
      ciclo,
      compras,
      garantias,
      pendienteDeAviso,
      desplazadaPorAviso: filaDesplazada ? mapGarantia(filaDesplazada, hoy) : null,
    },
  };
}
