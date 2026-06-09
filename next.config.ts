import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["edge-bankbook-coastal.ngrok-free.dev"],
  serverExternalPackages: [
    "better-auth",
    "@prisma/client",
    "prisma",
    "pg",
    "@prisma/adapter-pg",
  ],
};

export default nextConfig;
