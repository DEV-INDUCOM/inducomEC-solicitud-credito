import type { Metadata } from "next";
import { IconLock, IconShieldCheck, IconUsersGroup } from "@tabler/icons-react";
import { AuthSplitLayout } from "@/components/layout/portal/AuthSplitLayout";
import { IconTile } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { AdminLoginForm } from "@/components/pages/admin/login/AdminLoginForm";

export const metadata: Metadata = {
  title: "Panel administrativo",
  description: "Acceso al panel administrativo de INDUCOM.",
};

const features = [
  {
    icon: (
      <IconTile variant="onDark">
        <IconLock size={20} stroke={1.75} />
      </IconTile>
    ),
    title: "Acceso restringido",
    description: "Cada acción queda registrada a nombre de la persona que la realiza.",
  },
  {
    icon: (
      <IconTile variant="onDark">
        <IconUsersGroup size={20} stroke={1.75} />
      </IconTile>
    ),
    title: "Gestión de clientes",
    description: "Solicitudes de crédito, empresas, pagos y códigos de invitación en un solo lugar.",
  },
  {
    icon: (
      <IconTile variant="onDark">
        <IconShieldCheck size={20} stroke={1.75} />
      </IconTile>
    ),
    title: "Datos aislados",
    description: "El acceso a la información se controla en la base de datos, no en la pantalla.",
  },
];

export default function AdminLoginPage() {
  return (
    <AuthSplitLayout
      heading="Panel administrativo INDUCOM"
      description="Gestiona solicitudes de crédito, empresas, pagos y códigos de invitación."
      features={features}
      note={<Alert variant="onDark">Este acceso es exclusivo para personal interno de INDUCOM.</Alert>}
    >
      <AdminLoginForm />
    </AuthSplitLayout>
  );
}
