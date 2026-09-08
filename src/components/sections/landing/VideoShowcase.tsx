"use client";

import { useState } from "react";
import Image from "next/image";
import {
  IconPlayerPlayFilled,
  IconBolt,
  IconReportMoney,
  IconShieldCheck,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Card, IconTile } from "@/components/ui/Card";
import { Reveal } from "@/components/ui/Reveal";

// ID del video de YouTube = lo que va después de "v=" en la URL.
// Para cambiar el video, reemplace solo esta línea.
const YOUTUBE_ID = "oDb4Po9ELUc";

// Portada oficial del video en YouTube: se actualiza sola si cambian la
// miniatura en YouTube. maxresdefault existe solo si el video se subió en HD;
// si algún día se sube uno SD, usar "hqdefault.jpg".
const THUMBNAIL_URL = `https://i.ytimg.com/vi/${YOUTUBE_ID}/maxresdefault.jpg`;

// Etiquetas decorativas sobre la portada (esquina superior izquierda).
const overlayTags = ["INDUCOM TV", "Video oficial"];

const highlights = [
  {
    icon: IconBolt,
    title: "Automatización operativa",
    description: "Registro inmediato y cotizaciones ágiles en minutos.",
  },
  {
    icon: IconReportMoney,
    title: "Transparencia financiera",
    description: "Estado de líneas de crédito e incentivos en tiempo real.",
  },
  {
    icon: IconShieldCheck,
    title: "Respaldo y garantía",
    description: "Asistencia directa de ingenieros técnicos certificados.",
  },
];

export function VideoShowcase() {
  // false = solo se ve la portada y NO se carga nada de YouTube (la landing
  // pesa menos y no hay cookies de terceros hasta que el usuario lo pide).
  // true = se monta el iframe con autoplay, así el video se reproduce aquí
  // mismo sin mandar al usuario a youtube.com.
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section className="bg-[var(--bg-page-soft)] py-28" id="video">
      <div className="page-container">
        <Reveal className="text-center">
          <Badge className="mb-4">
            <IconPlayerPlayFilled size={12} aria-hidden="true" />
            Video corporativo
          </Badge>
          <h2 className="mx-auto max-w-[24ch] text-3xl text-[var(--text-primary)]">
            Descubra cómo impulsamos la gestión industrial de su empresa
          </h2>
          <p className="mx-auto mt-3 max-w-[62ch] text-[var(--text-muted)]">
            Un recorrido rápido por las funcionalidades exclusivas, gestión de líneas de crédito B2B
            y soporte técnico especializado para la industria.
          </p>
        </Reveal>

        {/* Marco navy alrededor del reproductor, igual que la mockup del portal */}
        <Reveal delayMs={150} className="mx-auto mt-12 max-w-[54rem]">
          <div className="rounded-xl bg-brand-navy-900 p-3 shadow-lg max-[520px]:p-2">
            {/* aspect-video mantiene el 16:9 en cualquier ancho, sin alto fijo */}
            <div className="relative aspect-video overflow-hidden rounded-lg bg-brand-navy-950">
              {isPlaying ? (
                <iframe
                  className="absolute inset-0 h-full w-full"
                  // youtube-nocookie = modo de privacidad mejorada de YouTube.
                  // rel=0 evita sugerencias de otros canales al terminar.
                  src={`https://www.youtube-nocookie.com/embed/${YOUTUBE_ID}?autoplay=1&rel=0&modestbranding=1`}
                  title="Video corporativo INDUCOM"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                // Toda la portada es un solo botón: clic en cualquier parte reproduce
                <button
                  type="button"
                  onClick={() => setIsPlaying(true)}
                  aria-label="Reproducir video de presentación"
                  className="group absolute inset-0 h-full w-full cursor-pointer"
                >
                  <Image
                    src={THUMBNAIL_URL}
                    alt=""
                    fill
                    sizes="(max-width: 900px) 100vw, 860px"
                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                  {/* Velo oscuro para que los textos blancos se lean sobre cualquier miniatura */}
                  <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,39,0.45)_0%,rgba(0,0,39,0.12)_45%,rgba(0,0,39,0.72)_100%)]" />

                  <span className="absolute top-4 left-4 flex gap-2 max-[520px]:top-2 max-[520px]:left-2">
                    {overlayTags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-sm bg-brand-navy-900/70 px-2 py-1 text-[10px] font-semibold tracking-[0.08em] text-white uppercase backdrop-blur-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </span>

                  <span className="absolute top-1/2 left-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-brand-orange-500 text-white shadow-lg transition group-hover:scale-110 max-[520px]:h-12 max-[520px]:w-12">
                    {/* ml-1 centra ópticamente el triángulo dentro del círculo */}
                    <IconPlayerPlayFilled size={26} className="ml-1" aria-hidden="true" />
                  </span>

                  <span className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-brand-navy-900/70 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm max-[520px]:bottom-3 max-[520px]:text-xs">
                    Ver video de presentación
                  </span>
                </button>
              )}
            </div>
          </div>
        </Reveal>

        <div className="mx-auto mt-6 grid max-w-[54rem] grid-cols-3 gap-6 max-[760px]:grid-cols-1">
          {highlights.map(({ icon: Icon, title, description }, index) => (
            <Reveal key={title} delayMs={250 + index * 100}>
              <Card className="h-full p-5">
                <div className="flex items-center gap-3">
                  <IconTile variant="accent" className="h-8 w-8">
                    <Icon size={17} stroke={1.75} />
                  </IconTile>
                  <h3 className="text-sm font-semibold">{title}</h3>
                </div>
                <p className="mt-3 text-sm text-[var(--text-secondary)] leading-normal">
                  {description}
                </p>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
