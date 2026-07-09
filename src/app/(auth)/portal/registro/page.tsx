import type { Metadata } from "next";
import Link from "next/link";
import { IconArrowRight, IconBuilding, IconKey, IconShieldCheck } from "@tabler/icons-react";
import { AuthSplitLayout } from "@/components/layout/portal/AuthSplitLayout";
import { IconTile } from "@/components/ui/Card";
import { RegisterForm } from "@/components/pages/portal/registro/RegisterForm";
import { routes } from "@/lib/config/site";

export const metadata: Metadata = {
  title: "Crear cuenta",
  description: "Registro cerrado por código de invitación para el Portal de Clientes INDUCOM.",
};

const features = [
  {
    icon: (
      <IconTile variant="onDark" shape="circle">
        <IconKey size={18} stroke={1.75} />
      </IconTile>
    ),
    title: "Código de un solo uso",
  },
  {
    icon: (
      <IconTile variant="onDark" shape="circle">
        <IconBuilding size={18} stroke={1.75} />
      </IconTile>
    ),
    title: "Acceso asociado a tu empresa",
  },
  {
    icon: (
      <IconTile variant="onDark" shape="circle">
        <IconShieldCheck size={18} stroke={1.75} />
      </IconTile>
    ),
    title: "Portal privado para clientes aprobados",
  },
];

export default function RegisterPage() {
  return (
    <AuthSplitLayout
      heading="Registro con código de invitación"
      description="Crea tu cuenta únicamente si INDUCOM te ha entregado un código válido."
      features={features}
      note={
        <div>
          <p className="text-sm text-slate-400 leading-normal">
            Si aún no tienes un código, primero debes completar la solicitud de crédito para ser
            evaluado por nuestro equipo comercial.
          </p>
          <Link
            href={routes.creditRequest}
            className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-brand-orange-400 hover:text-brand-orange-300"
          >
            Iniciar solicitud de crédito
            <IconArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
      }
    >
      <RegisterForm />
    </AuthSplitLayout>
  );
}
