import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils/cn";

export function Logo({
  variant = "full",
  onDark = false,
  // src: permite pasar otra imagen (ej. una versión clara para fondos oscuros)
  // sin tocar los usos existentes, que se quedan con el logo por defecto.
  src = "/Images/logo-inducom.png",
  // imageClassName: el className del Logo solo llega al <Link> exterior, no
  // al <Image>. Para cambiar el tamaño (h-*) por instancia hay que pasar esto.
  imageClassName = "h-27 w-auto max-[480px]:h-8",
  // width/height: relación de aspecto REAL del archivo en src (no del logo
  // original). Si usas otro PNG con otra proporción, pásalos o se distorsiona.
  width = 290,
  height = 100,
  className,
}: {
  variant?: "full" | "wordmark";
  onDark?: boolean;
  src?: string;
  imageClassName?: string;
  width?: number;
  height?: number;
  className?: string;
}) {
  return (
    <Link
      href="/"
      className={cn("inline-flex items-center gap-3 text-inherit hover:text-inherit", className)}
      aria-label="INDUCOM, ir al inicio"
    >
      {variant === "full" ? (
        <Image
          src={src}
          alt="INDUCOM · Soluciones Industriales"
          width={width}
          height={height}
          priority
          className={imageClassName}
          // La clase w-auto solo vive en CSS; Next no la ve y avisa por el aspect ratio.
          // Se declara width: auto tambien inline para que el warning desaparezca.
          style={{ width: "auto" }}
        />
      ) : (
        <span
          className={cn(
            "font-display text-lg font-bold",
            onDark ? "text-[var(--text-on-dark)]" : "text-[var(--text-primary)]"
          )}
        >
          Inducom
        </span>
      )}
    </Link>
  );
}
