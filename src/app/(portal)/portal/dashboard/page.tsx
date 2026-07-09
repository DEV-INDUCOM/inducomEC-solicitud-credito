import type { Metadata } from "next";
import { IconBrandPaypal, IconFileInvoice, IconReceipt2 } from "@tabler/icons-react";
import { Card, IconTile } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";

export const metadata: Metadata = {
  title: "Dashboard",
};

const modules = [
  {
    icon: IconBrandPaypal,
    title: "PayPal",
    description: "Saldo derivado de pagos, historial e incentivo activo.",
  },
  {
    icon: IconReceipt2,
    title: "Facturas y pagos",
    description: "Consulta de facturación y estados de cuenta por empresa.",
  },
  {
    icon: IconFileInvoice,
    title: "Cotizaciones",
    description: "Solicitud y seguimiento de cotizaciones comerciales.",
  },
];

export default function DashboardPage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl">Bienvenido al portal</h1>
        <p className="mt-2 text-[var(--text-secondary)]">
          Esta es una vista de estructura: los módulos se activarán a medida que se conecten al
          backend de Supabase.
        </p>
      </div>

      <Alert variant="info" title="Vista en construcción">
        Este dashboard todavía no tiene datos reales ni autenticación conectada. Es únicamente la
        estructura visual del portal privado.
      </Alert>

      <div className="mt-8 grid grid-cols-3 gap-5 max-[860px]:grid-cols-2 max-[560px]:grid-cols-1">
        {modules.map(({ icon: Icon, title, description }) => (
          <Card key={title}>
            <IconTile>
              <Icon size={22} stroke={1.75} />
            </IconTile>
            <p className="mt-4 text-base font-semibold">{title}</p>
            <p className="mt-2 text-sm text-[var(--text-secondary)] leading-normal">{description}</p>
            <span className="mt-4 inline-flex rounded-full border border-[color:var(--state-neutral-border)] bg-[var(--state-neutral-bg)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.04em] text-[var(--state-neutral-text)]">
              Próximamente
            </span>
          </Card>
        ))}
      </div>
    </>
  );
}
