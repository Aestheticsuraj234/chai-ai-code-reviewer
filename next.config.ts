/**
 * Next.js configuration for Chai AI Code Reviewer.
 *
 * - `allowedDevOrigins`: lets ngrok (or similar) tunnel to the dev server for
 *   GitHub webhooks and OAuth callbacks during local development.
 * - `serverExternalPackages`: keeps heavy server-only packages out of the
 *   client bundle and avoids bundling issues with Prisma, pg, and Better Auth.
 */
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev tunnel hostname — update when your ngrok URL changes
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
