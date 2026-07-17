import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { IconFileText, IconCircleCheck, IconCircleX, IconUserSquareRounded } from "@tabler/icons-react";
import { BackLink } from "@/components/ui/BackLink";
import { Card, IconTile } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EstadoSolicitudBadge } from "@/components/admin/EstadoSolicitudBadge";
import { EstadoSolicitudForm } from "@/components/admin/EstadoSolicitudForm";
import { DocumentoDownloadButton } from "@/components/admin/DocumentoDownloadButton";
import { formatBytes, formatFechaHora } from "@/lib/admin/format";
import { estadoSolicitudLabel, estadoSolicitudTone, tipoClienteLabel } from "@/lib/admin/labels";
import { getSolicitudDetalle } from "@/lib/admin/queries";
import { routes } from "@/lib/config/site";

export const metadata: Metadata = { title: "Detalle de solicitud" };

const tipoSolicitudLabel: Record<string, string> = {
  nueva: "Nueva solicitud de crédito",
  apertura: "Apertura de línea de crédito",
};

function dato(datos: Record<string, unknown>, key: string): string | null {
  const value = datos[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export default async function AdminSolicitudDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getSolicitudDetalle(id);
  if (!result.ok) notFound();

  const solicitud = result.data;
  const datos = solicitud.datosAdicionales;
  const tipoCliente = dato(datos, "tipoCliente") as "natural" | "juridica" | null;
  const tipoSolicitud = dato(datos, "tipoSolicitud");
  const razonSocial = dato(datos, "razonSocial");
  const numeroCotizacion = dato(datos, "numeroCotizacion");

  return (
    <div className="flex flex-col gap-6">
      <BackLink href={routes.adminSolicitudes}>Volver a solicitudes</BackLink>

      <Card shadow className="bg-brand-navy-900 text-[var(--text-on-dark)]">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div className="flex items-start gap-4">
            <IconTile variant="onDark">
              <IconUserSquareRounded size={22} stroke={1.75} />
            </IconTile>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl">{solicitud.nombreSolicitante}</h1>
                <EstadoSolicitudBadge estado={solicitud.estado} />
              </div>
              <p className="mt-2 text-sm text-slate-300">
                Folio: <span className="font-mono">{solicitud.folio}</span> · {formatFechaHora(solicitud.createdAt)}
              </p>
            </div>
          </div>
          {tipoSolicitud && (
            <div className="text-left sm:text-right">
              <p className="text-xs uppercase tracking-[0.04em] text-slate-400">Tipo de solicitud</p>
              <p className="text-lg font-medium">{tipoSolicitudLabel[tipoSolicitud] ?? tipoSolicitud}</p>
            </div>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-6">
          <Card className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Datos del solicitante</h2>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-[var(--text-muted)]">Tipo de persona</dt>
                <dd className="text-sm font-medium text-[var(--text-primary)]">
                  {tipoCliente ? tipoClienteLabel[tipoCliente] : "No disponible"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--text-muted)]">RUC / Cédula</dt>
                <dd className="font-mono text-sm font-medium text-[var(--text-primary)]">{solicitud.identificacion}</dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--text-muted)]">Correo electrónico</dt>
                <dd className="text-sm font-medium text-[var(--text-primary)]">{solicitud.emailSolicitante}</dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--text-muted)]">Teléfono de contacto</dt>
                <dd className="text-sm font-medium text-[var(--text-primary)]">
                  {solicitud.telefonoSolicitante ?? "No proporcionado"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--text-muted)]">País</dt>
                <dd className="text-sm font-medium text-[var(--text-primary)]">{solicitud.pais ?? "No disponible"}</dd>
              </div>
              {razonSocial && (
                <div>
                  <dt className="text-xs text-[var(--text-muted)]">Razón social</dt>
                  <dd className="text-sm font-medium text-[var(--text-primary)]">{razonSocial}</dd>
                </div>
              )}
              {numeroCotizacion && (
                <div>
                  <dt className="text-xs text-[var(--text-muted)]">N.° de cotización</dt>
                  <dd className="font-mono text-sm font-medium text-[var(--text-primary)]">{numeroCotizacion}</dd>
                </div>
              )}
            </dl>
          </Card>

          <Card className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Documentos adjuntos</h2>
            {solicitud.documentos.length === 0 ? (
              <p className="text-sm text-[var(--text-secondary)]">Esta solicitud no tiene documentos adjuntos.</p>
            ) : (
              <ul className="flex flex-col divide-y divide-[color:var(--border)]">
                {solicitud.documentos.map((doc) => (
                  <li key={doc.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <IconTile variant="accent">
                        <IconFileText size={18} stroke={1.75} />
                      </IconTile>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-[var(--text-primary)]">{doc.nombreArchivo}</p>
                        <p className="text-xs text-[var(--text-muted)]">{formatBytes(doc.tamanoBytes)}</p>
                      </div>
                    </div>
                    <DocumentoDownloadButton storagePath={doc.storagePath} />
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card shadow className="flex flex-col gap-4 border-[color:var(--accent-border)]">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Estado de la solicitud</h2>
            <EstadoSolicitudForm solicitudId={solicitud.id} estadoActual={solicitud.estado} />
          </Card>

          <Card
            className="flex items-start gap-3"
            style={{
              borderColor: solicitud.consentimientoAceptado ? "var(--state-success-border)" : "var(--state-danger-border)",
              backgroundColor: solicitud.consentimientoAceptado ? "var(--state-success-bg)" : "var(--state-danger-bg)",
            }}
          >
            {solicitud.consentimientoAceptado ? (
              <IconCircleCheck size={22} className="mt-0.5 shrink-0 text-[var(--state-success-text)]" />
            ) : (
              <IconCircleX size={22} className="mt-0.5 shrink-0 text-[var(--state-danger-text)]" />
            )}
            <div>
              <p
                className="text-sm font-semibold"
                style={{
                  color: solicitud.consentimientoAceptado ? "var(--state-success-text)" : "var(--state-danger-text)",
                }}
              >
                {solicitud.consentimientoAceptado ? "Consentimiento aceptado" : "Consentimiento no registrado"}
              </p>
              {solicitud.consentimientoFecha && (
                <p className="text-xs text-[var(--text-secondary)]">{formatFechaHora(solicitud.consentimientoFecha)}</p>
              )}
            </div>
          </Card>

          <Card className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Historial</h2>
            <ul className="flex flex-col gap-4">
              {solicitud.historial.map((entry) => (
                <li key={entry.id} className="flex gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--accent)]" />
                  <div>
                    <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
                      Estado cambiado a
                      <StatusBadge tone={estadoSolicitudTone[entry.estadoNuevo]}>
                        {estadoSolicitudLabel[entry.estadoNuevo]}
                      </StatusBadge>
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {formatFechaHora(entry.createdAt)} · Por {entry.actorNombre ?? "Personal interno"}
                    </p>
                    {entry.nota && (
                      <p className="mt-1 text-sm text-[var(--text-secondary)] leading-normal">&ldquo;{entry.nota}&rdquo;</p>
                    )}
                  </div>
                </li>
              ))}
              <li className="flex gap-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--border-strong)]" />
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">Solicitud recibida</p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {formatFechaHora(solicitud.createdAt)} · Registro vía portal web
                  </p>
                </div>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
