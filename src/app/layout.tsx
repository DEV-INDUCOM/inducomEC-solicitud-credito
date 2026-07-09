import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Portal de Clientes INDUCOM",
    template: "%s · Portal de Clientes INDUCOM",
  },
  description:
    "Portal de Clientes INDUCOM: solicitud de crédito, acceso al portal y gestión de línea de crédito para empresas industriales.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
