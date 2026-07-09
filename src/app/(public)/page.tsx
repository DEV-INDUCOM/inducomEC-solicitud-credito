import type { Metadata } from "next";
import { Hero } from "@/components/sections/landing/Hero";
import { ValueCards } from "@/components/sections/landing/ValueCards";
import { AccessProcess } from "@/components/sections/landing/AccessProcess";
import { ManagementFeature } from "@/components/sections/landing/ManagementFeature";
import { FaqSection } from "@/components/sections/landing/FaqSection";
import { ClosingCta } from "@/components/sections/landing/ClosingCta";

export const metadata: Metadata = {
  title: "Portal de Clientes",
  description:
    "Solicite su línea de crédito industrial y acceda al Portal de Clientes INDUCOM: gestión de cuenta, pagos y beneficios exclusivos.",
};

export default function LandingPage() {
  return (
    <>
      <Hero />
      <ValueCards />
      <AccessProcess />
      <ManagementFeature />
      <FaqSection />
      <ClosingCta />
    </>
  );
}
