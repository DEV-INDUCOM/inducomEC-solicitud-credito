import { IconSettings, IconUsersGroup, IconShieldCheck, IconWorld } from "@tabler/icons-react";
import { Card, IconTile } from "@/components/ui/Card";
import { Reveal } from "@/components/ui/Reveal";

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
    // py-20 (antes py-28): sección escaneable, no necesita tanto aire como las de "detención"
    <section className="bg-[var(--bg-medium-dark)] py-20">
      <div className="page-container">
        {/* Título agregado: antes las 4 tarjetas caían sin contexto ni heading */}
        <Reveal className="mb-12 text-center">
          <h2 className="text-4xl text-[var(--text-primary)]">Por qué elegir INDUCOM</h2>
          <span className="mx-auto mt-3 block h-[3px] w-14 rounded-full bg-[var(--accent)]" aria-hidden="true" />
        </Reveal>

        {/* Grid responsive de tarjetas: 4 columnas en escritorio, baja a
            2 columnas por debajo de 900px, y a 1 columna (apiladas) por
            debajo de 520px. Cambia esos números si quieres que el salto
            a 2 o 1 columna ocurra en otro ancho. */}
        <div className="grid grid-cols-4 gap-6 max-[900px]:grid-cols-2 max-[520px]:grid-cols-1">
          {items.map(({ icon: Icon, title, description }, index) => (
            // delayMs escalonado: cada tarjeta aparece un poco después que la anterior
            <Reveal key={title} delayMs={index * 100}>
              {/* hover: borde + elevación naranja, antes las tarjetas eran estáticas */}
              <Card className="flex h-full flex-col gap-4 transition-all duration-200 hover:-translate-y-1 hover:border-[color:var(--accent)] hover:shadow-md">
                {/* variant="accent": antes era gris sobre gris (neutral), ahora usa el naranja de marca */}
                <IconTile variant="accent">
                  <Icon size={22} stroke={1.75} />
                </IconTile>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-normal">{description}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
