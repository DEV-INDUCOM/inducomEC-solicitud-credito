import type { Metadata } from "next";
import { IconLock } from "@tabler/icons-react";
import { AuthSplitLayout } from "@/components/layout/portal/AuthSplitLayout";
import { IconTile } from "@/components/ui/Card";
import { ForgotPasswordForm } from "@/components/pages/portal/recuperar-contrasena/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Recuperar contraseña",
  description: "Restablece la contraseña de tu cuenta del Portal de Clientes INDUCOM.",
};

const features = [
  {
    icon: (
      <IconTile variant="onDark">
        <IconLock size={20} stroke={1.75} />
      </IconTile>
    ),
    title: "Proceso seguro",
    description: "El enlace de recuperación se envía únicamente al correo asociado a tu cuenta.",
  },
];

export default function ForgotPasswordPage() {
  return (
    <AuthSplitLayout
      heading="Portal de Clientes INDUCOM"
      description="Restablece tu contraseña para volver a acceder a tu cuenta."
      features={features}
    >
      <ForgotPasswordForm />
    </AuthSplitLayout>
  );
}
