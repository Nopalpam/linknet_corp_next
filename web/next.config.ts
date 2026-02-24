import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow images from backend API and external sources
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },

  // Environment variables exposed to the browser
  env: {
    NEXT_PUBLIC_SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME || "LinkNet",
  },
};

export default nextConfig;
