import Link, { type LinkProps } from "next/link";
import type { AnchorHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";
import { btnBaseClasses, btnSizeClasses, btnVariantClasses, type ButtonSize, type ButtonVariant } from "./Button";

export interface LinkButtonProps
  extends LinkProps,
    Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
}

export function LinkButton({
  variant = "primary",
  size = "md",
  block = false,
  className,
  children,
  ...props
}: LinkButtonProps) {
  return (
    <Link
      className={cn(
        btnBaseClasses,
        btnVariantClasses[variant],
        btnSizeClasses[size],
        block && "w-full",
        className
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
