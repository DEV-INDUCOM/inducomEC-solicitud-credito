import type { Metadata } from "next";
import { Card } from "@/components/ui/Card";
import { CreditRequestForm } from "@/components/pages/landing/solicitud-formulario/CreditRequestForm";

export const metadata: Metadata = {
  title: "Solicitud de crédito",
  description:
    "Solicite su línea de crédito industrial con INDUCOM. No requiere iniciar sesión ni ser cliente previo.",
};

export default function CreditRequestPage() {
  return (
    <section className="pt-12 pb-20">
      <div className="page-container">
        <div className="mb-10 max-w-[42rem]">
          <h1 className="text-4xl">Solicitud de crédito</h1>
          <p className="mt-4 text-lg text-[var(--text-secondary)] leading-normal">
            Complete el formulario con los datos de su empresa. No necesita iniciar sesión ni ser
            cliente de INDUCOM para aplicar: evaluaremos su solicitud y, si es aprobada, le
            enviaremos un código de invitación para crear su cuenta en el portal.
          </p>
        </div>

        <Card shadow className="max-w-[48rem]">
          <CreditRequestForm />
        </Card>
      </div>
    </section>
  );
}
