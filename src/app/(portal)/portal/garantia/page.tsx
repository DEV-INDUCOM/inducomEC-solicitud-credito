import type { Metadata } from "next";
import { Alert } from "@/components/ui/Alert";
import { BackLink } from "@/components/ui/BackLink";
import { ErrorState } from "@/components/ui/ErrorState";
import { GarantiaBeneficios } from "@/components/portal/GarantiaBeneficios";
import { GarantiaCicloCard } from "@/components/portal/GarantiaCicloCard";
import { GarantiaComprasCiclo } from "@/components/portal/GarantiaComprasCiclo";
import { GarantiaDesbloqueadaModal } from "@/components/portal/GarantiaDesbloqueadaModal";
import { GarantiasObtenidas } from "@/components/portal/GarantiasObtenidas";
import { UMBRAL_10K, UMBRAL_5K } from "@/lib/portal/beneficios";
import { formatMonto } from "@/lib/portal/format";
import { getGarantiaResumen, getPortalContext } from "@/lib/portal/queries";
import { routes } from "@/lib/config/site";

export const metadata: Metadata = {
  title: "Garantía extendida",
};

export default async function GarantiaPage() {
  const context = await getPortalContext();
  // El layout del portal ya filtra sin-sesión / sin-perfil / error.
  if (!context.ok) return null;

  const resultado = await getGarantiaResumen(context.data.cliente.id);
  if (!resultado.ok) {
    return (
      <div className="flex flex-col gap-8">
        <h1 className="text-3xl">Garantía extendida</h1>
        <ErrorState title="No pudimos cargar tu garantía" />
      </div>
    );
  }

  const { ciclo, compras, garantias, pendienteDeAviso, desplazadaPorAviso } = resultado.resumen;
  const garantiasDelCiclo = garantias.filter((garantia) => garantia.cicloId === ciclo.id);
  // v2: activas = extensión corriendo hoy; pasadas = vencida o reemplazada
  // (la garantía de fábrica de esas cotizaciones puede seguir vigente).
  const garantiasActivas = garantias.filter((garantia) => garantia.vigente);
  const garantiasPasadas = garantias.filter((garantia) => !garantia.vigente);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <BackLink href={routes.paypal}>Volver al módulo PayPal</BackLink>
        <div>
          <h1 className="text-3xl">Garantía extendida</h1>
          <p className="mt-2 text-[var(--text-secondary)]">
            Seguimiento de tus compras acumuladas y beneficios de garantía.
          </p>
        </div>
      </div>

      <Alert variant="info" title="Solo se consideran las compras pagadas mediante PayPal">
        Al alcanzar los {formatMonto(UMBRAL_5K)} y {formatMonto(UMBRAL_10K)} se asignan meses
        adicionales de garantía a la cotización que desbloquea cada beneficio.
      </Alert>

      <GarantiaCicloCard ciclo={ciclo} />

      <GarantiaBeneficios ciclo={ciclo} garantiasDelCiclo={garantiasDelCiclo} />

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">
            Compras que cuentan para tu garantía
          </h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Solo las compras pagadas con PayPal que forman parte del ciclo actual.
          </p>
        </div>
        <GarantiaComprasCiclo compras={compras} />
      </section>

      {/* Incluyen ciclos anteriores a propósito: el acumulado se reinicia,
       *  las garantías no (guía funcional, sección 14). */}
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Garantías activas</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Cotizaciones con meses adicionales de garantía vigentes hoy.
          </p>
        </div>
        <GarantiasObtenidas
          garantias={garantiasActivas}
          vacioTitulo="Aún no tienes garantías activas"
          vacioDescripcion="Cuando alcances USD 5.000 o USD 10.000, la cotización que complete el umbral aparecerá aquí con el detalle de la garantía asignada."
        />
      </section>

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Garantías pasadas</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Cotizaciones cuya extensión ya venció o fue reemplazada por un beneficio más reciente.
          </p>
        </div>
        <GarantiasObtenidas
          garantias={garantiasPasadas}
          vacioTitulo="No tienes garantías pasadas"
          vacioDescripcion="Aquí verás las cotizaciones cuya extensión de garantía haya terminado."
        />
      </section>

      {pendienteDeAviso && (
        <GarantiaDesbloqueadaModal garantia={pendienteDeAviso} desplazada={desplazadaPorAviso} />
      )}
    </div>
  );
}
