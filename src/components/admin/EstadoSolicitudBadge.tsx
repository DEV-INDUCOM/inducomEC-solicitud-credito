import { StatusBadge } from "@/components/ui/StatusBadge";
import { estadoSolicitudLabel, estadoSolicitudTone } from "@/lib/admin/labels";
import type { EstadoSolicitud } from "@/lib/admin/types";

export function EstadoSolicitudBadge({ estado }: { estado: EstadoSolicitud }) {
  return <StatusBadge tone={estadoSolicitudTone[estado]}>{estadoSolicitudLabel[estado]}</StatusBadge>;
}
