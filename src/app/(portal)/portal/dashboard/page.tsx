import type { Metadata } from "next";
import { IconPigMoney, IconShieldCheck } from "@tabler/icons-react";
import { Card, IconTile } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";

import { ActividadPaypal } from "@/components/portal/ActividadPaypal";
import { CompanySummary } from "@/components/portal/CompanySummary";
import { ResumenBeneficioCard } from "@/components/portal/ResumenBeneficioCard";
import { UltimosMovimientos } from "@/components/portal/UltimosMovimientos";
import { formatMonto } from "@/lib/portal/format";
import { portalNavItems } from "@/lib/portal/nav";
import { getCashback, getGarantiaResumen, getPagos, getPortalContext } from "@/lib/portal/queries";
import { routes } from "@/lib/config/site";

export const metadata: Metadata = {
  title: "Dashboard",
};

const modulosFuturos = portalNavItems.filter((item) => item.href === null);

/**
 * El dashboard es un RESUMEN EJECUTIVO: responde "¿cómo está mi cuenta?".
 * El detalle de cada beneficio (progreso del ciclo, umbrales, historial de
 * garantías, tabla completa de pagos) vive en su módulo y no se duplica acá.
 */
export default async function DashboardPage() {
  const context = await getPortalContext();
  // El layout del portal ya filtra sin-sesión / sin-perfil / error antes de
  // renderizar esta página; esta rama es solo defensa de tipos.
  if (!context.ok) return null;

  const { perfil, cliente } = context.data;
  const [cashbackResult, pagosResult, garantiaResult] = await Promise.all([
    getCashback(cliente.id),
    getPagos(cliente.id),
    getGarantiaResumen(cliente.id),
  ]);

  // Solo el conteo de beneficios vigentes y el último obtenido: el estado de
  // los umbrales es asunto de la pantalla de garantía.
  const garantiasVigentes = garantiaResult.ok
    ? garantiaResult.resumen.garantias.filter((garantia) => garantia.vigente)
    : [];
  const ultimaGarantia = garantiasVigentes[0] ?? null;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl">Bienvenido, {cliente.nombre}</h1>
        <p className="mt-2 text-[var(--text-secondary)]">
          Este es el estado general de tu cuenta.
        </p>
      </div>

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {cashbackResult.ok ? (
          <ResumenBeneficioCard
            titulo="Cashback"
            icono={<IconPigMoney size={22} stroke={1.75} />}
            estado={
              cashbackResult.cashback.puedeCanjear
                ? { tone: "success", label: "Disponible" }
                : { tone: "neutral", label: "Acumulado" }
            }
            valor={
              <p className="font-mono text-4xl font-medium tabular-nums text-[var(--text-primary)]">
                {formatMonto(cashbackResult.cashback.disponible)}
              </p>
            }
            ctaHref={routes.paypal}
            ctaLabel="Ver cashback"
          />
        ) : (
          <ErrorState title="No pudimos cargar tu cashback" />
        )}

        {garantiaResult.ok ? (
          <ResumenBeneficioCard
            titulo="Garantía extendida"
            icono={<IconShieldCheck size={22} stroke={1.75} />}
            estado={
              garantiasVigentes.length > 0
                ? { tone: "success", label: "Activa" }
                : { tone: "neutral", label: "Sin beneficios" }
            }
            valor={
              <p className="text-2xl font-semibold text-[var(--text-primary)]">
                {garantiasVigentes.length === 0
                  ? "Sin beneficios desbloqueados"
                  : `${garantiasVigentes.length} ${
                      garantiasVigentes.length === 1 ? "beneficio activo" : "beneficios activos"
                    }`}
              </p>
            }
            detalle={
              ultimaGarantia
                ? `Último beneficio: ${ultimaGarantia.mesesTotales} meses de garantía total`
                : undefined
            }
            ctaHref={routes.garantia}
            ctaLabel="Ver garantías"
          />
        ) : (
          <ErrorState title="No pudimos cargar tu garantía" />
        )}
      </section>

      {pagosResult.ok && garantiaResult.ok ? (
        <ActividadPaypal
          pagos={pagosResult.pagos}
          totalCiclo={garantiaResult.resumen.ciclo.acumulado}
          transaccionesCiclo={garantiaResult.resumen.compras.length}
        />
      ) : (
        <ErrorState title="No pudimos cargar tu actividad de PayPal" />
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[2fr_1fr]">
        {pagosResult.ok ? (
          <UltimosMovimientos pagos={pagosResult.pagos} />
        ) : (
          <ErrorState title="No pudimos cargar tus pagos" />
        )}
        <CompanySummary cliente={cliente} perfil={perfil} />
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">Próximamente</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {modulosFuturos.map(({ label, icon: Icon }) => (
            <Card key={label} className="flex flex-col gap-3">
              <IconTile>
                <Icon size={22} stroke={1.75} />
              </IconTile>
              <p className="text-base font-semibold text-[var(--text-primary)]">{label}</p>
              <span className="inline-flex w-fit rounded-full border border-dashed border-[color:var(--state-neutral-border)] bg-[var(--state-neutral-bg)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.04em] text-[var(--state-neutral-text)]">
                Próximamente
              </span>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
