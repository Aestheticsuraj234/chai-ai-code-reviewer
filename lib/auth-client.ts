/**
 * @module lib/auth-client
 * @description Browser-side Better Auth client for React components.
 *
 * Server code imports `auth` from `lib/auth.ts`. Client components (buttons,
 * forms, hooks) import `authClient` from this file instead. The client talks
 * to the same `/api/auth/*` endpoints but is safe to bundle for the browser.
 *
 * Typical usage: `authClient.signIn.social({ provider: "github" })` or
 * `authClient.useSession()` in a Client Component.
 */

import { createAuthClient } from "better-auth/react";

/**
 * Pre-configured Better Auth React client.
 *
 * @description Defaults to the current site's origin for API calls, so no base
 * URL is required in most deployments. Use only in Client Components marked
 * with `"use client"`.
 */
export const authClient = createAuthClient();
