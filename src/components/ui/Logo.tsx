import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils/cn";

export function Logo({
  variant = "full",
  onDark = false,
  className,
}: {
  variant?: "full" | "wordmark";
  onDark?: boolean;
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
          src="/Images/logo-inducom.png"
          alt="INDUCOM · Soluciones Industriales"
          width={290}
          height={100}
          priority
          className="h-25 w-auto max-[480px]:h-8"
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
