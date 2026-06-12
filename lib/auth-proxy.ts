/**
 * @module lib/auth-proxy
 * @description Request-level auth gate used by Next.js middleware (`proxy.ts`).
 *
 * Middleware runs before a page renders. This module checks the session cookie
 * and either allows the request through or redirects to `/sign-in` with a
 * `callbackUrl` so users return to their original destination after login.
 */

import { auth } from "@/lib/auth";
import { getSafeCallbackPath, SIGN_IN_PATH } from "@/lib/auth-routes";
import { NextRequest, NextResponse } from "next/server";

/**
 * Builds a redirect response to the sign-in page, preserving the intended destination.
 *
 * @param request - The incoming middleware request (used for the origin URL).
 * @param pathname - The protected path the user tried to visit.
 * @returns A `NextResponse.redirect` to `/sign-in?callbackUrl=...`.
 */
function redirectToSignIn(request: NextRequest, pathname: string) {
  const signInUrl = new URL(SIGN_IN_PATH, request.url);
  // Include query string so filters/search params survive the round-trip through sign-in.
  signInUrl.searchParams.set(
    "callbackUrl",
    `${pathname}${request.nextUrl.search}`
  );
  return NextResponse.redirect(signInUrl);
}

/**
 * Resolves where to send a user after they sign in from the sign-in page.
 *
 * @param request - Request whose `callbackUrl` search param may hold the target path.
 * @returns A same-site path safe to redirect to (never an external URL).
 */
function getPostAuthRedirectPath(request: NextRequest): string {
  const callbackUrl = request.nextUrl.searchParams.get("callbackUrl");
  return getSafeCallbackPath(callbackUrl);
}

/**
 * Main auth middleware handler — call this from `proxy.ts`.
 *
 * @description Flow:
 * 1. `/` is always public.
 * 2. `/sign-in`: logged-in users redirect away; guests proceed.
 * 3. All other matched routes: guests redirect to sign-in; authenticated users proceed.
 * @param request - The incoming `NextRequest` from middleware.
 * @returns `NextResponse.next()` to continue, or a redirect response.
 */
export async function handleAuthProxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Landing page stays public — no session check needed.
  if (pathname === "/") {
    return NextResponse.next();
  }

  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (pathname === SIGN_IN_PATH) {
    // Already signed in? Skip the form and go to callback or dashboard.
    if (session) {
      const redirectPath = getPostAuthRedirectPath(request);
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }

    return NextResponse.next();
  }

  // Protected route without a session → send to sign-in with return URL.
  if (!session) {
    return redirectToSignIn(request, pathname);
  }

  return NextResponse.next();
}
