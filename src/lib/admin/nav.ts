import {
  IconCreditCard,
  IconLayoutDashboard,
  IconQrcode,
  IconBuildingSkyscraper,
  IconWallet,
} from "@tabler/icons-react";
import { routes } from "@/lib/config/site";

export interface AdminNavItem {
  label: string;
  href: string;
  icon: typeof IconLayoutDashboard;
}

export const adminNavItems: AdminNavItem[] = [
  { label: "Resumen", href: routes.adminResumen, icon: IconLayoutDashboard },
  { label: "Solicitudes de crédito", href: routes.adminSolicitudes, icon: IconCreditCard },
  { label: "Empresas", href: routes.adminEmpresas, icon: IconBuildingSkyscraper },
  { label: "Pagos", href: routes.adminPagos, icon: IconWallet },
  { label: "Códigos de invitación", href: routes.adminCodigos, icon: IconQrcode },
];
