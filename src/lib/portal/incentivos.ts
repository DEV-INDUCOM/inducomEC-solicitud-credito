import { IconCirclePercentage, IconShieldCheck, IconTruckDelivery } from "@tabler/icons-react";
import type { IncentivoTipo } from "./types";

export const incentivoOrden: IncentivoTipo[] = ["cashback_1", "garantia_extendida"];

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
  }
};

/**
 * Con cashback activo, el "saldo acumulado" que se muestra es el 1% de lo
 * pagado (lo que el cliente realmente acredita), no el monto pagado en sí —
 * `getSaldo()` trae la suma bruta de `pagos.monto` desde la vista
 * `saldo_por_cliente`; acá se aplica la regla de negocio del incentivo.
 * Sin cashback activo, el saldo se muestra tal cual llega (bruto).
 */
export function calcularSaldoAcumulado(saldoBruto: number, incentivo: IncentivoTipo | null): number {
  return incentivo === "cashback_1" ? saldoBruto * 0.01 : saldoBruto;
}
