import { IconBrandPaypal, IconFileInvoice, IconLayoutDashboard, IconReceipt2 } from "@tabler/icons-react";
import { routes } from "@/lib/config/site";

export interface PortalNavItem {
  label: string;
  href: string | null;
  icon: typeof IconLayoutDashboard;
}

/** Los ítems sin `href` son módulos futuros: se listan deshabilitados con
 *  badge "próximamente" en vez de un enlace roto. */
export const portalNavItems: PortalNavItem[] = [
  { label: "Dashboard", href: routes.dashboard, icon: IconLayoutDashboard },
  { label: "PayPal", href: routes.paypal, icon: IconBrandPaypal },
  { label: "Facturas y pagos", href: null, icon: IconReceipt2 },
  { label: "Cotizaciones", href: null, icon: IconFileInvoice },
];
