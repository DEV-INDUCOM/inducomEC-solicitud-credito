import Link from "next/link";
import type { ReactNode } from "react";
import { IconArrowLeft } from "@tabler/icons-react";
import { cn } from "@/lib/utils/cn";

export function BackLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--link-hover)]",
        className
      )}
    >
      <IconArrowLeft size={16} aria-hidden="true" />
      {children}
    </Link>
  );
}
