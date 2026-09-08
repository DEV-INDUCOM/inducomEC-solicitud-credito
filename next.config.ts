import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Miniaturas de YouTube (portada del video corporativo de la landing).
    // Sin esto, next/image bloquea la imagen por ser de un dominio externo.
    remotePatterns: [{ protocol: "https", hostname: "i.ytimg.com" }],
  },
};

export default nextConfig;
