import type { Metadata } from "next";
import { IconChartBar, IconClipboardCheck, IconLock } from "@tabler/icons-react";
import { AuthSplitLayout } from "@/components/layout/portal/AuthSplitLayout";
import { IconTile } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { LoginForm } from "@/components/pages/portal/login/LoginForm";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Accede al Portal de Clientes INDUCOM con tu correo y contraseña.",
};

const features = [
  {
    icon: (
      <IconTile variant="onDark">
        <IconLock size={20} stroke={1.75} />
      </IconTile>
    ),
    title: "Acceso privado",
    description: "Entorno securizado de grado industrial para la gestión de su cuenta corporativa.",
  },
  {
    icon: (
      <IconTile variant="onDark">
        <IconChartBar size={20} stroke={1.75} />
      </IconTile>
    ),
    title: "Información centralizada",
    description: "Consulte facturación, estados de cuenta y pedidos en un solo panel de control.",
  },
  {
    icon: (
      <IconTile variant="onDark">
        <IconClipboardCheck size={20} stroke={1.75} />
      </IconTile>
    ),
    title: "Beneficios habilitados",
    description: "Aproveche líneas de crédito exclusivas y tarifas preferenciales para socios B2B.",
  },
];

export default function LoginPage() {
  return (
    <AuthSplitLayout
      heading="Portal de Clientes INDUCOM"
      description="Accede de forma segura a las herramientas digitales habilitadas para tu empresa."
      features={features}
      note={
        <Alert variant="onDark">El acceso requiere una cuenta creada con código de invitación.</Alert>
      }
    >
      <LoginForm />
    </AuthSplitLayout>
  );
}
