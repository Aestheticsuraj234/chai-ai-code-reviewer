/**
 * @module proxy
 * @description Next.js middleware entry point for route protection.
 *
 * In this project, `proxy.ts` at the repo root acts like traditional
 * `middleware.ts`: it runs on matched paths before the request hits a page.
 * Auth logic lives in `lib/auth-proxy.ts` so it can be tested and documented
 * separately from the middleware wiring.
 *
 * @see lib/auth-proxy.ts — session checks and redirect rules
 */

import { handleAuthProxy } from "@/lib/auth-proxy";
import type { NextRequest } from "next/server";

/**
 * Middleware handler invoked by Next.js for every matched route.
 *
 * @description Thin wrapper around {@link handleAuthProxy}. Keeping this file
 * small makes it obvious which URLs are protected via `config.matcher`.
 * @param request - Incoming request from the edge middleware runtime.
 * @returns Response that either continues the request or redirects to sign-in.
 */
export async function proxy(request: NextRequest) {
  return handleAuthProxy(request);
}

/**
 * Limits which paths run auth middleware.
 *
 * @description Only these patterns pay the cost of a session lookup. Public
 * marketing pages and API routes outside this list are not gated here.
 */
export const config = {
  matcher: ["/sign-in", "/dashboard", "/dashboard/:path*"],
};
