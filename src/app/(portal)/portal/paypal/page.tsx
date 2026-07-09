import type { Metadata } from "next";
import { IconBrandPaypal } from "@tabler/icons-react";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { IconTile } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "PayPal",
};

export default function PaypalPage() {
  return (
    <ComingSoon
      icon={
        <IconTile variant="accent">
          <IconBrandPaypal size={24} stroke={1.75} />
        </IconTile>
      }
      title="Módulo PayPal"
      description="Aquí verás tu saldo derivado de pagos, historial de pagos e incentivo activo. El saldo se actualiza cuando INDUCOM carga los pagos: no es información en tiempo real."
    />
  );
}
