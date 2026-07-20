import type { Metadata } from "next";
import { IconLock } from "@tabler/icons-react";
import { AuthSplitLayout } from "@/components/layout/portal/AuthSplitLayout";
import { IconTile } from "@/components/ui/Card";
import { UpdatePasswordForm } from "@/components/pages/portal/actualizar-contrasena/UpdatePasswordForm";

export const metadata: Metadata = {
  title: "Actualizar contraseña",
  description: "Crea una nueva contraseña para tu cuenta del Portal de Clientes INDUCOM.",
};

// searchParams es async en Next 16; ?origen=admin llega desde el redirectTo del correo
export default async function UpdatePasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ origen?: string }>;
}) {
  const { origen } = await searchParams;
  return (
    <AuthSplitLayout
      heading="Portal de Clientes INDUCOM"
      description="Actualiza tu contraseña de forma segura."
      features={[{ icon: <IconTile variant="onDark"><IconLock size={20} stroke={1.75} /></IconTile>, title: "Enlace temporal y seguro" }]}
    >
      <UpdatePasswordForm origen={origen} />
    </AuthSplitLayout>
  );
}
