import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lelang.go.id" },
      { protocol: "https", hostname: "**.lelang.go.id" },
      { protocol: "https", hostname: "koelak.co.id" },
      { protocol: "https", hostname: "www.ibid.astra.co.id" },
    ],
  },
  // Izinkan origin preview platform mengakses aset dev server.
  allowedDevOrigins: ["*.space-z.ai", "preview-chat-*.space-z.ai"],
};

export default nextConfig;
