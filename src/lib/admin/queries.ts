import "server-only";
import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  AdminClienteDetalle,
  AdminClienteListItem,
  AdminCodigo,
  AdminHistorialEntry,
  AdminPago,
  AdminPerfil,
  AdminSolicitudDetalle,
  AdminSolicitudListItem,
  EstadoSolicitud,
  IncentivoTipo,
  MetodoPago,
  OrigenPago,
} from "./types";
import { getFolio } from "./format";

export const PAGE_SIZE = 10;

export type AdminContextResult =
  | { ok: true; data: AdminPerfil }
  | { ok: false; reason: "sin-sesion" | "sin-perfil" | "error" };

/** Análogo a `getPortalContext` (ver src/lib/portal/queries.ts): el
 *  middleware ya filtró sin-sesión / sin personal_interno, pero el layout
 *  del panel vuelve a resolverlo como defensa en profundidad. */
export const getAdminContext = cache(async (): Promise<AdminContextResult> => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, reason: "sin-sesion" };

  const { data: personal, error } = await supabase
    .from("personal_interno")
    .select("id, nombre, activo")
    .eq("id", user.id)
    .maybeSingle();
  if (error) return { ok: false, reason: "error" };
  if (!personal || !personal.activo) return { ok: false, reason: "sin-perfil" };

  return {
    ok: true,
    data: { id: personal.id, nombre: personal.nombre, email: user.email ?? "" },
  };
});

export const getPaises = cache(async () => {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("paises").select("id, codigo, nombre").order("nombre");
  return data ?? [];
});

// ============================================================================
// Resumen
// ============================================================================

export interface ResumenStats {
  solicitudesEstaSemana: number;
  solicitudesEnRevision: number;
  totalClientes: number;
  clientesConUsuarios: number;
  totalPagosEsteMes: number;
  cantidadPagosEsteMes: number;
  codigosActivos: number;
  codigosProximosAVencer: number;
}

function inicioSemana() {
  const now = new Date();
  const day = now.getDay();
  const diff = (day + 6) % 7; // lunes como primer día
  const inicio = new Date(now);
  inicio.setDate(now.getDate() - diff);
  inicio.setHours(0, 0, 0, 0);
  return inicio.toISOString();
}

function inicioMes() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

export async function getResumenStats(): Promise<{ ok: true; data: ResumenStats } | { ok: false }> {
  const supabase = await createSupabaseServerClient();

  const [
    solicitudesSemana,
    solicitudesRevision,
    clientesTotal,
    perfilesDistintos,
    pagosMes,
    codigosActivos,
    codigosProximos,
  ] = await Promise.all([
    supabase
      .from("solicitudes_credito")
      .select("id", { count: "exact", head: true })
      .gte("created_at", inicioSemana()),
    supabase
      .from("solicitudes_credito")
      .select("id", { count: "exact", head: true })
      .eq("estado", "en_revision"),
    supabase.from("clientes").select("id", { count: "exact", head: true }),
    supabase.from("perfiles").select("cliente_id"),
    supabase.from("pagos").select("monto").gte("fecha", inicioMes()),
    supabase.from("codigos_invitacion").select("id", { count: "exact", head: true }).eq("estado", "activo"),
    supabase
      .from("codigos_invitacion")
      .select("id", { count: "exact", head: true })
      .eq("estado", "activo")
      .lte("fecha_vencimiento", new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()),
  ]);

  if (
    solicitudesSemana.error ||
    solicitudesRevision.error ||
    clientesTotal.error ||
    perfilesDistintos.error ||
    pagosMes.error ||
    codigosActivos.error ||
    codigosProximos.error
  ) {
    return { ok: false };
  }

  const clientesConUsuarios = new Set((perfilesDistintos.data ?? []).map((p) => p.cliente_id)).size;
  const totalPagosEsteMes = (pagosMes.data ?? []).reduce((acc, p) => acc + Number(p.monto), 0);

  return {
    ok: true,
    data: {
      solicitudesEstaSemana: solicitudesSemana.count ?? 0,
      solicitudesEnRevision: solicitudesRevision.count ?? 0,
      totalClientes: clientesTotal.count ?? 0,
      clientesConUsuarios,
      totalPagosEsteMes,
      cantidadPagosEsteMes: (pagosMes.data ?? []).length,
      codigosActivos: codigosActivos.count ?? 0,
      codigosProximosAVencer: codigosProximos.count ?? 0,
    },
  };
}

export async function getUltimasSolicitudes(limit = 5) {
  const solicitudes = await getSolicitudes({}, 1, limit);
  return solicitudes;
}

export async function getUltimosPagos(limit = 5): Promise<{ ok: true; pagos: AdminPago[] } | { ok: false }> {
  return getPagos({}, 1, limit);
}

// ============================================================================
// Solicitudes de crédito
// ============================================================================

export interface SolicitudesFiltros {
  estado?: EstadoSolicitud;
  paisId?: number;
  desde?: string;
  hasta?: string;
  q?: string;
}

const ESTADOS_SOLICITUD: EstadoSolicitud[] = [
  "recibido",
  "en_revision",
  "aprobado",
  "rechazado",
  "pendiente_informacion",
];

export async function getSolicitudCounts(): Promise<Record<EstadoSolicitud, number>> {
  const supabase = await createSupabaseServerClient();
  const counts = await Promise.all(
    ESTADOS_SOLICITUD.map((estado) =>
      supabase.from("solicitudes_credito").select("id", { count: "exact", head: true }).eq("estado", estado)
    )
  );

  const result = {} as Record<EstadoSolicitud, number>;
  ESTADOS_SOLICITUD.forEach((estado, i) => {
    result[estado] = counts[i].count ?? 0;
  });
  return result;
}

export async function getSolicitudes(
  filtros: SolicitudesFiltros,
  page = 1,
  pageSize = PAGE_SIZE
): Promise<{ ok: true; items: AdminSolicitudListItem[]; total: number } | { ok: false }> {
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("solicitudes_credito")
    .select("id, nombre_solicitante, nombre_empresa, identificacion, estado, created_at, paises(nombre), documentos_credito(id)", {
      count: "exact",
    })
    .order("created_at", { ascending: false });

  if (filtros.estado) query = query.eq("estado", filtros.estado);
  if (filtros.paisId) query = query.eq("pais_id", filtros.paisId);
  if (filtros.desde) query = query.gte("created_at", filtros.desde);
  if (filtros.hasta) query = query.lte("created_at", filtros.hasta);
  if (filtros.q) {
    const q = filtros.q.trim();
    query = query.or(
      `nombre_solicitante.ilike.%${q}%,nombre_empresa.ilike.%${q}%,identificacion.ilike.%${q}%`
    );
  }

  const from = (page - 1) * pageSize;
  const { data, error, count } = await query.range(from, from + pageSize - 1);
  if (error || !data) return { ok: false };

  return {
    ok: true,
    total: count ?? 0,
    items: data.map((row) => {
      const paisRel = row.paises as unknown as { nombre: string } | { nombre: string }[] | null;
      const pais = Array.isArray(paisRel) ? paisRel[0]?.nombre : paisRel?.nombre;
      const documentos = row.documentos_credito as unknown as { id: string }[] | null;
      return {
        id: row.id,
        folio: getFolio(row.id),
        nombreSolicitante: row.nombre_solicitante,
        nombreEmpresa: row.nombre_empresa,
        identificacion: row.identificacion,
        pais: pais ?? null,
        estado: row.estado as EstadoSolicitud,
        cantidadDocumentos: documentos?.length ?? 0,
        createdAt: row.created_at,
      };
    }),
  };
}

export async function getSolicitudDetalle(
  id: string
): Promise<{ ok: true; data: AdminSolicitudDetalle } | { ok: false }> {
  const supabase = await createSupabaseServerClient();

  const { data: row, error } = await supabase
    .from("solicitudes_credito")
    .select(
      "id, estado, nombre_solicitante, email_solicitante, telefono_solicitante, identificacion, datos_adicionales, nombre_empresa, consentimiento_aceptado, consentimiento_fecha, created_at, paises(nombre)"
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !row) return { ok: false };

  const [{ data: documentos }, { data: historial }] = await Promise.all([
    supabase
      .from("documentos_credito")
      .select("id, nombre_archivo, tipo_mime, tamano_bytes, storage_path")
      .eq("solicitud_id", id)
      .order("created_at", { ascending: true }),
    supabase
      .from("historial_solicitud")
      .select("id, estado_anterior, estado_nuevo, nota, created_at, personal_interno(nombre)")
      .eq("solicitud_id", id)
      .order("created_at", { ascending: false }),
  ]);

  const paisRel = row.paises as unknown as { nombre: string } | { nombre: string }[] | null;
  const pais = Array.isArray(paisRel) ? paisRel[0]?.nombre : paisRel?.nombre;

  const historialEntries: AdminHistorialEntry[] = (historial ?? []).map((h) => {
    const actor = h.personal_interno as unknown as { nombre: string } | { nombre: string }[] | null;
    const actorNombre = Array.isArray(actor) ? actor[0]?.nombre : actor?.nombre;
    return {
      id: h.id,
      estadoAnterior: h.estado_anterior as EstadoSolicitud,
      estadoNuevo: h.estado_nuevo as EstadoSolicitud,
      nota: h.nota,
      actorNombre: actorNombre ?? null,
      createdAt: h.created_at,
    };
  });

  return {
    ok: true,
    data: {
      id: row.id,
      folio: getFolio(row.id),
      estado: row.estado as EstadoSolicitud,
      nombreSolicitante: row.nombre_solicitante,
      emailSolicitante: row.email_solicitante,
      telefonoSolicitante: row.telefono_solicitante,
      identificacion: row.identificacion,
      pais: pais ?? null,
      nombreEmpresa: row.nombre_empresa,
      datosAdicionales: (row.datos_adicionales ?? {}) as Record<string, unknown>,
      consentimientoAceptado: row.consentimiento_aceptado,
      consentimientoFecha: row.consentimiento_fecha,
      createdAt: row.created_at,
      montoSolicitado: null,
      documentos: (documentos ?? []).map((d) => ({
        id: d.id,
        nombreArchivo: d.nombre_archivo,
        tipoMime: d.tipo_mime,
        tamanoBytes: d.tamano_bytes,
        storagePath: d.storage_path,
      })),
      historial: historialEntries,
    },
  };
}

// ============================================================================
// Empresas (clientes)
// ============================================================================

export interface ClientesFiltros {
  q?: string;
  paisId?: number;
  incentivo?: IncentivoTipo | "sin_incentivo";
  tipoCliente?: "natural" | "juridica";
}

export async function getClientes(
  filtros: ClientesFiltros,
  page = 1,
  pageSize = PAGE_SIZE
): Promise<{ ok: true; items: AdminClienteListItem[]; total: number } | { ok: false }> {
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("admin_resumen_clientes")
    .select("*", { count: "exact" })
    .order("nombre_visible", { ascending: true });

  if (filtros.q) query = query.or(`nombre_visible.ilike.%${filtros.q}%,identificacion.ilike.%${filtros.q}%`);
  if (filtros.tipoCliente) query = query.eq("tipo_cliente", filtros.tipoCliente);
  if (filtros.incentivo === "sin_incentivo") query = query.is("incentivo_tipo", null);
  else if (filtros.incentivo) query = query.eq("incentivo_tipo", filtros.incentivo);

  const from = (page - 1) * pageSize;
  const { data, error, count } = await query.range(from, from + pageSize - 1);
  if (error || !data) return { ok: false };

  // El filtro de país exige el nombre (viene desde un <select> de paises.id);
  // se resuelve antes de armar la respuesta para no tener que unir la tabla
  // `paises` dos veces solo para filtrar por id.
  let items = data;
  if (filtros.paisId) {
    const paises = await getPaises();
    const paisNombre = paises.find((p) => p.id === filtros.paisId)?.nombre;
    items = items.filter((row) => row.pais_nombre === paisNombre);
  }

  return {
    ok: true,
    total: filtros.paisId ? items.length : count ?? 0,
    items: items.map((row) => ({
      id: row.cliente_id,
      nombre: row.nombre_visible,
      identificacion: row.identificacion,
      tipoCliente: row.tipo_cliente as "natural" | "juridica",
      pais: row.pais_nombre,
      usuarios: Number(row.usuarios),
      incentivoActivo: (row.incentivo_tipo as IncentivoTipo | null) ?? null,
      totalPagos: Number(row.total_pagos),
      cashbackAcumulado: row.incentivo_tipo === "cashback_1" ? Number(row.total_pagos) * 0.01 : null,
      ultimoPago: row.ultimo_pago,
    })),
  };
}

export async function getTotalAcumuladoGlobal(): Promise<number> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("pagos").select("monto");
  return (data ?? []).reduce((acc, p) => acc + Number(p.monto), 0);
}

export async function getClienteDetalle(id: string): Promise<{ ok: true; data: AdminClienteDetalle } | { ok: false }> {
  const supabase = await createSupabaseServerClient();

  const { data: cliente, error } = await supabase
    .from("clientes")
    .select("id, nombre_visible, identificacion, tipo_cliente, email, paises(nombre)")
    .eq("id", id)
    .maybeSingle();
  if (error || !cliente) return { ok: false };

  const [{ data: perfiles }, { data: pagos }, { data: incentivo }, { data: saldo }] = await Promise.all([
    supabase.from("perfiles").select("id, email").eq("cliente_id", id),
    supabase
      .from("pagos")
      .select("id, monto, fecha, origen, metodo_pago, referencia, created_at")
      .eq("cliente_id", id)
      .order("fecha", { ascending: false }),
    supabase.from("incentivos_cliente").select("tipo").eq("cliente_id", id).maybeSingle(),
    supabase.from("saldo_por_cliente").select("saldo").eq("cliente_id", id).maybeSingle(),
  ]);

  const paisRel = cliente.paises as unknown as { nombre: string } | { nombre: string }[] | null;
  const pais = Array.isArray(paisRel) ? paisRel[0]?.nombre : paisRel?.nombre;

  return {
    ok: true,
    data: {
      id: cliente.id,
      nombre: cliente.nombre_visible,
      identificacion: cliente.identificacion,
      tipoCliente: cliente.tipo_cliente as "natural" | "juridica",
      pais: pais ?? null,
      email: cliente.email,
      incentivoActivo: (incentivo?.tipo as IncentivoTipo | null) ?? null,
      usuarios: perfiles ?? [],
      pagos: (pagos ?? []).map((p) => ({
        id: p.id,
        clienteId: id,
        clienteNombre: cliente.nombre_visible,
        monto: Number(p.monto),
        fecha: p.fecha,
        origen: p.origen as OrigenPago,
        metodoPago: p.metodo_pago as MetodoPago | null,
        referencia: p.referencia,
        createdAt: p.created_at,
      })),
      saldo: Number(saldo?.saldo ?? 0),
    },
  };
}

// ============================================================================
// Pagos
// ============================================================================

export interface PagosFiltros {
  clienteId?: string;
  desde?: string;
  hasta?: string;
  origen?: OrigenPago;
  referencia?: string;
}

export async function getPagos(
  filtros: PagosFiltros,
  page = 1,
  pageSize = PAGE_SIZE
): Promise<{ ok: true; pagos: AdminPago[]; total: number } | { ok: false }> {
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("pagos")
    .select("id, monto, fecha, origen, metodo_pago, referencia, created_at, clientes(id, nombre_visible)", {
      count: "exact",
    })
    .order("fecha", { ascending: false });

  if (filtros.clienteId) query = query.eq("cliente_id", filtros.clienteId);
  if (filtros.desde) query = query.gte("fecha", filtros.desde);
  if (filtros.hasta) query = query.lte("fecha", filtros.hasta);
  if (filtros.origen) query = query.eq("origen", filtros.origen);
  if (filtros.referencia) query = query.ilike("referencia", `%${filtros.referencia}%`);

  const from = (page - 1) * pageSize;
  const { data, error, count } = await query.range(from, from + pageSize - 1);
  if (error || !data) return { ok: false };

  return {
    ok: true,
    total: count ?? 0,
    pagos: data.map((row) => {
      const clienteRel = row.clientes as unknown as { id: string; nombre_visible: string } | { id: string; nombre_visible: string }[] | null;
      const cliente = Array.isArray(clienteRel) ? clienteRel[0] : clienteRel;
      return {
        id: row.id,
        clienteId: cliente?.id ?? "",
        clienteNombre: cliente?.nombre_visible ?? "—",
        monto: Number(row.monto),
        fecha: row.fecha,
        origen: row.origen as OrigenPago,
        metodoPago: row.metodo_pago as MetodoPago | null,
        referencia: row.referencia,
        createdAt: row.created_at,
      };
    }),
  };
}

export interface PagosStats {
  totalPeriodo: number;
  cantidadTransacciones: number;
  cashbackGenerado: number;
}

export async function getPagosStats(desde?: string, hasta?: string): Promise<{ ok: true; data: PagosStats } | { ok: false }> {
  const supabase = await createSupabaseServerClient();
  let query = supabase.from("pagos").select("monto, cliente_id");
  if (desde) query = query.gte("fecha", desde);
  if (hasta) query = query.lte("fecha", hasta);

  const { data, error } = await query;
  if (error || !data) return { ok: false };

  const { data: incentivos } = await supabase.from("incentivos_cliente").select("cliente_id, tipo").eq("tipo", "cashback_1");
  const clientesCashback = new Set((incentivos ?? []).map((i) => i.cliente_id));

  const totalPeriodo = data.reduce((acc, p) => acc + Number(p.monto), 0);
  const cashbackGenerado = data
    .filter((p) => clientesCashback.has(p.cliente_id))
    .reduce((acc, p) => acc + Number(p.monto) * 0.01, 0);

  return {
    ok: true,
    data: { totalPeriodo, cantidadTransacciones: data.length, cashbackGenerado },
  };
}

export async function getClientesOptions(): Promise<{ id: string; nombre: string }[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("clientes").select("id, nombre_visible").order("nombre_visible");
  return (data ?? []).map((c) => ({ id: c.id, nombre: c.nombre_visible }));
}

// ============================================================================
// Códigos de invitación
// ============================================================================

export interface CodigosFiltros {
  clienteId?: string;
  estado?: "activo" | "usado" | "vencido";
  vence?: string;
}

export async function getCodigos(
  filtros: CodigosFiltros,
  page = 1,
  pageSize = PAGE_SIZE
): Promise<{ ok: true; items: AdminCodigo[]; total: number } | { ok: false }> {
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("codigos_invitacion")
    .select(
      "id, codigo, estado, fecha_vencimiento, created_at, clientes(id, nombre_visible), usado_por",
      { count: "exact" }
    )
    .order("created_at", { ascending: false });

  if (filtros.clienteId) query = query.eq("cliente_id", filtros.clienteId);
  if (filtros.estado) query = query.eq("estado", filtros.estado);
  if (filtros.vence) query = query.lte("fecha_vencimiento", filtros.vence);

  const from = (page - 1) * pageSize;
  const { data, error, count } = await query.range(from, from + pageSize - 1);
  if (error || !data) return { ok: false };

  return {
    ok: true,
    total: count ?? 0,
    items: data.map((row) => {
      const clienteRel = row.clientes as unknown as { id: string; nombre_visible: string } | { id: string; nombre_visible: string }[] | null;
      const cliente = Array.isArray(clienteRel) ? clienteRel[0] : clienteRel;
      return {
        id: row.id,
        codigo: row.codigo,
        clienteId: cliente?.id ?? "",
        clienteNombre: cliente?.nombre_visible ?? "—",
        estado: row.estado as "activo" | "usado" | "vencido",
        fechaVencimiento: row.fecha_vencimiento,
        usadoPorEmail: null,
        createdAt: row.created_at,
      };
    }),
  };
}

export async function getCodigosStats(): Promise<{ totalGenerados: number; activosHoy: number }> {
  const supabase = await createSupabaseServerClient();
  const [{ count: total }, { count: activos }] = await Promise.all([
    supabase.from("codigos_invitacion").select("id", { count: "exact", head: true }),
    supabase.from("codigos_invitacion").select("id", { count: "exact", head: true }).eq("estado", "activo"),
  ]);
  return { totalGenerados: total ?? 0, activosHoy: activos ?? 0 };
}
