import type { Metadata } from "next";
import { IconBrandPaypal, IconFileInvoice, IconReceipt2 } from "@tabler/icons-react";
import { Card, IconTile } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: perfil } = user
    ? await supabase.from("perfiles").select("empresa_id").eq("id", user.id).maybeSingle()
    : { data: null };
  const { data: empresa } = perfil
    ? await supabase.from("empresas").select("nombre").eq("id", perfil.empresa_id).maybeSingle()
    : { data: null };
  const { data: saldoRow } = perfil
    ? await supabase.from("saldo_por_empresa").select("saldo").eq("empresa_id", perfil.empresa_id).maybeSingle()
    : { data: null };

  const saldo = Number(saldoRow?.saldo ?? 0);
  const saldoFormateado = new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
  }).format(Number.isFinite(saldo) ? saldo : 0);

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

      <div className="mt-8 grid grid-cols-2 gap-5 max-[560px]:grid-cols-1">
        <Card>
          <p className="font-mono text-xs font-semibold tracking-[0.06em] text-[var(--text-secondary)] uppercase">
            Empresa
          </p>
          <p className="mt-3 text-xl font-semibold">{empresa?.nombre ?? "Empresa no disponible"}</p>
        </Card>
        <Card>
          <p className="font-mono text-xs font-semibold tracking-[0.06em] text-[var(--text-secondary)] uppercase">
            Saldo registrado
          </p>
          <p className="mt-3 text-xl font-semibold">{saldoFormateado}</p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Calculado desde los pagos registrados.</p>
        </Card>
      </div>

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
