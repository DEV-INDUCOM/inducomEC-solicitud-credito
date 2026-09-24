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

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Garantías obtenidas</h2>
          {/* Incluye ciclos anteriores a propósito: el acumulado se reinicia,
           *  las garantías no (guía funcional, sección 14). */}
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Historial completo de beneficios desbloqueados, incluidos los de ciclos anteriores.
          </p>
        </div>
        <GarantiasObtenidas garantias={garantias} />
      </section>

      {pendienteDeAviso && (
        <GarantiaDesbloqueadaModal garantia={pendienteDeAviso} desplazada={desplazadaPorAviso} />
      )}
    </div>
  );
}
