import { IconCirclePercentage, IconShieldCheck, IconTruckDelivery } from "@tabler/icons-react";
import type { IncentivoTipo } from "./types";

export const incentivoOrden: IncentivoTipo[] = ["cashback_1", "garantia_extendida", "despacho_rapido"];

export const incentivoCatalogo: Record<
  IncentivoTipo,
  { titulo: string; descripcion: string; icon: typeof IconCirclePercentage }
> = {
  cashback_1: {
    titulo: "Cashback 1%",
    descripcion: "El 1% del monto de cada pago registrado se acredita como saldo acumulado.",
    icon: IconCirclePercentage,
  },
  garantia_extendida: {
    titulo: "Garantía extendida",
    descripcion: "Extensión del período de garantía en los productos adquiridos con línea de crédito INDUCOM.",
    icon: IconShieldCheck,
  },
  despacho_rapido: {
    titulo: "Despacho rápido",
    descripcion: "Prioridad de despacho en tus pedidos frente al tiempo estándar de entrega.",
    icon: IconTruckDelivery,
  },
};
