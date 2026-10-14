import { PublicNavbar } from "@/components/layout/landing/PublicNavbar";
import { PublicFooter } from "@/components/layout/landing/PublicFooter";
import { Analytics } from "@vercel/analytics/next";

export default function PublicGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div data-surface="landing">
      <PublicNavbar />
      <main>{children}</main>
      <PublicFooter />
      {/* Vercel Web Analytics: solo mide el trafico publico (landing + solicitud).
          No cuenta portal privado ni admin. Sin cookies, solo reporta en produccion. */}
      <Analytics />
    </div>
  );
}
