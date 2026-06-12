/**
 * @module lib/auth-session
 * @description Server-side session helpers for Next.js App Router pages.
 *
 * Use these functions in Server Components, Server Actions, and route handlers
 * when you need to know who is logged in. They read the session cookie via
 * Better Auth's API and optionally redirect unauthenticated users.
 */

import { auth } from "@/lib/auth";
import {
  DEFAULT_AUTH_CALLBACK,
  SIGN_IN_PATH,
} from "@/lib/auth-routes";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Reads the current user's session on the server.
 *
 * @description Forwards request headers to Better Auth so it can validate the
 * session cookie. Returns `null` when the user is not signed in.
 * @returns The active session object, or `null` if unauthenticated.
 */
export async function getServerSession() {
  return auth.api.getSession({
    // `headers()` is async in Next.js 15+ — must await before passing along.
    headers: await headers(),
  });
}

/**
 * Ensures the caller is authenticated; redirects to sign-in otherwise.
 *
 * @description Call at the top of protected Server Components or actions.
 * After this function returns, TypeScript knows `session` is non-null.
 * @param redirectTo - Path to send unauthenticated users to. Defaults to {@link SIGN_IN_PATH}.
 * @returns The validated session (never null).
 */
export async function requireAuth(redirectTo = SIGN_IN_PATH) {
  const session = await getServerSession();

  if (!session) {
    // `redirect()` throws internally — execution stops here for guests.
    redirect(redirectTo);
  }

  return session;
}

/**
 * Ensures the caller is *not* authenticated; redirects signed-in users away.
 *
 * @description Use on pages like `/sign-in` so logged-in users skip the form
 * and land on the dashboard (or a safe callback URL).
 * @param redirectTo - Where to send users who already have a session. Defaults to {@link DEFAULT_AUTH_CALLBACK}.
 */
export async function requireUnauth(redirectTo = DEFAULT_AUTH_CALLBACK) {
  const session = await getServerSession();

  if (session) {
    redirect(redirectTo);
  }
}
