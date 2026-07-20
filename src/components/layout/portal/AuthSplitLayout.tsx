import type { ReactNode } from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { Card } from "@/components/ui/Card";
import { BackLink } from "@/components/ui/BackLink";
import { routes } from "@/lib/config/site";

export interface AuthFeature {
  icon: ReactNode;
  title: string;
  description?: string;
}

export function AuthSplitLayout({
  heading,
  description,
  features,
  note,
  tone = "navy",
  children,
}: {
  heading: string;
  description: string;
  features: AuthFeature[];
  note?: ReactNode;
  tone?: "navy" | "black";
  children: ReactNode;
}) {
  // Fondo del split: azul de marca (#00004A → #000027) por defecto; negro (#0A0A0A → #000000) para el panel admin
  const splitBg =
    tone === "black"
      ? "bg-linear-[165deg] from-[#0A0A0A] to-[#000000]"
      : "bg-linear-[165deg] from-brand-navy-700 to-brand-navy-900";

  return (
    <div className="grid min-h-screen grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] max-[900px]:grid-cols-1">
      <div className={`flex flex-col ${splitBg} px-10 py-12 text-[var(--text-on-dark)] max-[900px]:px-6 max-[900px]:py-8`}>
        <Logo variant="wordmark" onDark className="mb-12 max-[900px]:mb-8 " with_href={false} />

        <h1 className="max-w-[24ch] text-2xl text-[var(--text-on-dark)]">{heading}</h1>
        <p className="mt-3 max-w-[40ch] text-slate-300">{description}</p>

        <ul className="mt-10 flex flex-col gap-6">
          {features.map((feature) => (
            <li key={feature.title} className="flex gap-4">
              {feature.icon}
              <div>
                <p className="font-semibold text-[var(--text-on-dark)]">{feature.title}</p>
                {feature.description && (
                  <p className="mt-1 text-sm text-slate-400 leading-normal">
                    {feature.description}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>

        <div className="flex-1" />

        {note && (
          <>
            <hr className="my-8 border-t border-[color:var(--border-on-dark)]" />
            {note}
          </>
        )}
      </div>

      <div className="flex flex-col items-center justify-center bg-[var(--bg-page-soft)] px-6 py-10">
        <Card shadow className="w-full max-w-[26rem]">
          {children}
        </Card>

        <div className="mt-6 flex gap-6 text-sm">
          <BackLink href={routes.home}>Volver al inicio</BackLink>
          <Link href={routes.privacyPolicy} className="text-[var(--text-secondary)] hover:text-[var(--link-hover)]">
            Política de privacidad
          </Link>
        </div>
      </div>
    </div>
  );
}
