import type { Metadata } from "next";
import { CreditRequestForm } from "@/components/pages/landing/solicitud-formulario/CreditRequestForm";

export const metadata: Metadata = {
  title: "Solicitud de crédito",
  description:
    "Solicite su línea de crédito industrial con INDUCOM. No requiere iniciar sesión ni ser cliente previo.",
};

// El wizard trae su propio header + stepper + tarjeta (ver CreditRequestForm),
// por eso esta página ya no envuelve nada extra como el h1/Card que tenía antes.
export default function CreditRequestPage() {
  return <CreditRequestForm />;
}
