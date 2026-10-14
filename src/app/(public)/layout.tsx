import Script from "next/script";
import { PublicNavbar } from "@/components/layout/landing/PublicNavbar";
import { PublicFooter } from "@/components/layout/landing/PublicFooter";
import { Analytics } from "@vercel/analytics/next";

// ID del contenedor de Google Tag Manager (portal-credito.inducom-ec).
// No es secreto: viaja al navegador en cada pagina. Dentro de GTM se configura
// la etiqueta de GA4 (G-65QM578MFK) y demas tags sin tocar este codigo.
const GTM_ID = "GTM-TD38D59J";

export default function PublicGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div data-surface="landing">
      {/* Google Tag Manager: solo carga en el area publica (landing + solicitud),
          no en portal privado ni admin. Mide de donde vienen los visitantes. */}
      <Script id="gtm-base" strategy="afterInteractive">
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${GTM_ID}');`}
      </Script>
      {/* Respaldo para navegadores sin JS. */}
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
        />
      </noscript>

      <PublicNavbar />
      <main>{children}</main>
      <PublicFooter />
      {/* Vercel Web Analytics: solo mide el trafico publico (landing + solicitud).
          No cuenta portal privado ni admin. Sin cookies, solo reporta en produccion. */}
      <Analytics />
    </div>
  );
}
