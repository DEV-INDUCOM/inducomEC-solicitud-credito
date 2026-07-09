import { IconSettings, IconUsersGroup, IconShieldCheck, IconWorld } from "@tabler/icons-react";
import { Card, IconTile } from "@/components/ui/Card";

const items = [
  {
    icon: IconSettings,
    title: "Soluciones industriales",
    description: "Equipos de alta ingeniería para todo tipo de operación técnica compleja.",
  },
  {
    icon: IconUsersGroup,
    title: "Asesoría técnica",
    description: "Expertos certificados acompañando cada etapa de su implementación técnica.",
  },
  {
    icon: IconShieldCheck,
    title: "Servicio y respaldo",
    description: "Garantía total con soporte postventa multirregional de respuesta inmediata.",
  },
  {
    icon: IconWorld,
    title: "Cobertura regional",
    description: "Presencia consolidada en Ecuador, Perú, Colombia y Bolivia.",
  },
];

export function ValueCards() {
  return (
    <section className="bg-[var(--bg-surface)] py-16">
      {/* Grid responsive de tarjetas: 4 columnas en escritorio, baja a
          2 columnas por debajo de 900px, y a 1 columna (apiladas) por
          debajo de 520px. Cambia esos números si quieres que el salto
          a 2 o 1 columna ocurra en otro ancho. */}
      <div className="page-container grid grid-cols-4 gap-6 max-[900px]:grid-cols-2 max-[520px]:grid-cols-1">
        {items.map(({ icon: Icon, title, description }) => (
          <Card key={title} className="flex flex-col gap-4">
            <IconTile>
              <Icon size={22} stroke={1.75} />
            </IconTile>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-[var(--text-secondary)] leading-normal">{description}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
