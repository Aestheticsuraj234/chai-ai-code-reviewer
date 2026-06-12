/**
 * @module lib/auth
 * @description Server-side Better Auth configuration for this app.
 *
 * Better Auth is the authentication library that handles sign-in, sessions, and
 * OAuth flows. This file wires it to our Prisma database and GitHub OAuth app.
 * API routes under `/api/auth/*` and server helpers import `auth` from here.
 *
 * @see https://www.better-auth.com/docs — Better Auth documentation
 */

import { betterAuth } from "better-auth/minimal";
import { nextCookies } from "better-auth/next-js";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db";

/**
 * Configured Better Auth instance for server-side use.
 *
 * @description Exposes `auth.api.*` methods (getSession, signInSocial, etc.)
 * and is mounted by the Next.js auth route handler. Client components use
 * `authClient` from `lib/auth-client.ts` instead.
 */
export const auth = betterAuth({
  // Store users, sessions, and OAuth accounts in PostgreSQL via Prisma.
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      /**
       * Maps GitHub's profile payload to the user fields we persist in the database.
       * GitHub sometimes omits `email` (private email or no public email set).
       */
      mapProfileToUser: (profile) => ({
        // Fallback: synthetic noreply address so every user has a unique email column.
        email: profile.email ?? `${profile.id}@users.noreply.github.com`,
        // Fallback: use GitHub login when display name is not provided.
        name: profile.name ?? profile.login,
      }),
    },
  },
  // Syncs session cookies with Next.js `cookies()` so Server Components can read sessions.
  plugins: [nextCookies()],
});
