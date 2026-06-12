/**
 * @module lib/db
 * @description Database access layer for the app.
 *
 * This module creates and exports a single shared Prisma client instance.
 * Server components, API routes, and Better Auth all import `prisma` from here
 * instead of creating their own database connections.
 *
 * In development, Next.js hot-reloads modules frequently. Without the singleton
 * pattern below, each reload would open a new connection and quickly exhaust
 * PostgreSQL's connection limit.
 */

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";

/**
 * Extends the global object so we can stash the Prisma client across hot reloads.
 * `globalThis` works in both Node.js and edge-like runtimes.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Builds a new Prisma client wired to PostgreSQL via the official driver adapter.
 *
 * @description Reads `DATABASE_URL` from the environment and throws early if it
 * is missing, so misconfiguration fails at startup rather than on the first query.
 * @returns A configured {@link PrismaClient} instance.
 */
function createPrismaClient() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }

  // Prisma 7+ uses driver adapters instead of baking the connection into the client.
  const adapter = new PrismaPg({ connectionString: url });
  return new PrismaClient({ adapter });
}

/**
 * Shared Prisma client used across the entire application.
 *
 * @description Reuses an existing client from `globalThis` when available (dev hot
 * reload), otherwise creates a fresh one. Import this constant — never call
 * `new PrismaClient()` elsewhere.
 */
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// In development, persist the client on globalThis so the next hot reload reuses it.
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
