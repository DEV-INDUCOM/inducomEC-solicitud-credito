import type { Metadata } from "next";
import {
  IconAt,
  IconBraces,
  IconBuildingBank,
  IconFileText,
  IconTarget,
  IconUserCheck,
} from "@tabler/icons-react";
import { BackLink } from "@/components/ui/BackLink";
import { Card, IconTile } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { PolicyHero } from "@/components/pages/landing/politicas-de-seguridad/PolicyHero";
import { PolicySection } from "@/components/pages/landing/politicas-de-seguridad/PolicySection";
import { contactInfo, routes } from "@/lib/config/site";

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description:
    "Cómo INDUCOM recopila, usa y protege los datos personales y financieros del portal de clientes y la solicitud de crédito.",
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <div className="page-container">
        <div className="py-5">
          <BackLink href={routes.home}>Volver al inicio</BackLink>
        </div>
      </div>

      <PolicyHero
        title="Política de Privacidad"
        subtitle="Comprometidos con la transparencia y la protección de su información corporativa y financiera en nuestro portal de clientes y solicitudes de crédito."
      />

      <div className="page-container">
        <div className="mx-auto max-w-[52rem] pt-10 pb-16">
          <PolicySection icon={<IconBuildingBank size={22} stroke={1.75} />} number={1} title="Responsable del Tratamiento">
            <p>
              INDUCOM Industrial, con domicilio legal en el domicilio corporativo principal, actúa
              como el responsable del tratamiento de los datos personales y financieros que usted
              proporcione a través de este portal. Somos responsables de garantizar que su
              información sea manejada con los más altos estándares de seguridad y de acuerdo con
              la legislación vigente.
            </p>
          </PolicySection>

          <PolicySection
            icon={<IconTarget size={22} stroke={1.75} />}
            number={2}
            title="Finalidad del Tratamiento"
            list={[
              "Evaluar y procesar solicitudes de crédito comercial.",
              "Gestionar la relación comercial continua entre INDUCOM y su representada.",
              "Cumplir con requerimientos legales y normativas financieras aplicables.",
              "Brindar soporte técnico y acceso a servicios personalizados en el portal de clientes.",
            ]}
          >
            <p>Los datos recopilados tienen como objetivo primordial:</p>
          </PolicySection>

          <PolicySection icon={<IconBraces size={22} stroke={1.75} />} number={3} title="Datos Solicitados">
            <p>
              Solicitamos información necesaria para la validación de perfiles corporativos,
              incluyendo pero no limitado a: datos de contacto (nombre, cargo, correo),
              información fiscal de la empresa, estados financieros consolidados, y documentación
              legal de representación.
            </p>

            <Card className="mt-4 bg-[var(--bg-page-soft)]">
              <div className="mb-3 flex items-center gap-3">
                <IconTile variant="accent">
                  <IconFileText size={20} stroke={1.75} />
                </IconTile>
                <p className="text-base font-semibold">Documentos Adjuntos</p>
              </div>
              <p className="text-[var(--text-secondary)] leading-normal italic">
                Toda la documentación cargada al sistema, tales como balances, RUC o actas de
                constitución, tiene un carácter estrictamente confidencial. Su uso es exclusivo
                para auditoría interna y procesos de aprobación de crédito, y bajo ninguna
                circunstancia se comparten o publican en plataformas abiertas.
              </p>
            </Card>

            <div className="mt-4 grid grid-cols-2 gap-4 max-[560px]:grid-cols-1">
              <Card>
                <p className="mb-2 text-base font-semibold">Conservación</p>
                <p className="text-sm text-[var(--text-secondary)] leading-normal">
                  Conservamos sus datos durante el tiempo estrictamente necesario para cumplir con
                  los fines comerciales para los que fueron recabados y para satisfacer
                  obligaciones legales.
                </p>
              </Card>
              <Card>
                <p className="mb-2 text-base font-semibold">Seguridad</p>
                <p className="text-sm text-[var(--text-secondary)] leading-normal">
                  Implementamos protocolos de seguridad de grado industrial y limitamos el acceso
                  únicamente al personal autorizado por INDUCOM para la gestión de riesgos
                  financieros.
                </p>
              </Card>
            </div>
          </PolicySection>

          <PolicySection icon={<IconUserCheck size={22} stroke={1.75} />} number={4} title="Derechos del Titular">
            <p>
              Usted mantiene el derecho de acceder, rectificar, actualizar o solicitar la
              eliminación de sus datos personales de nuestras bases de datos comerciales, siempre
              que no interfiera con procesos legales en curso o deudas pendientes.
            </p>
          </PolicySection>

          <PolicySection icon={<IconAt size={22} stroke={1.75} />} number={5} title="Contacto">
            <p>
              Para cualquier consulta sobre sus datos, puede dirigirse al correo oficial de
              protección de datos: <a href={`mailto:${contactInfo.privacyEmail}`}>{contactInfo.privacyEmail}</a>.
            </p>
          </PolicySection>

          <Alert title="Nota importante" className="mt-10">
            Esta política de privacidad es una versión informativa preliminar y debe ser validada
            y confirmada por el área legal oficial de INDUCOM antes de su publicación definitiva.
          </Alert>
        </div>
      </div>
    </>
  );
}
