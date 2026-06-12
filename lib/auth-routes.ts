/**
 * @module lib/auth-routes
 * @description Shared auth path constants and redirect safety helpers.
 *
 * Centralizing route strings avoids typos between middleware, Server Actions,
 * and pages. `getSafeCallbackPath` prevents open-redirect attacks where a
 * malicious `callbackUrl` would send users to an external phishing site.
 */

/**
 * Path to the GitHub sign-in page.
 *
 * @description Used by middleware, session helpers, and the sign-in form.
 */
export const SIGN_IN_PATH = "/sign-in";

/**
 * Default landing page after a successful sign-in when no callback is provided.
 */
export const DEFAULT_AUTH_CALLBACK = "/dashboard";

/**
 * Validates a post-login redirect target so it stays on this site.
 *
 * @description Only relative paths starting with a single `/` are allowed.
 * Rejects `//evil.com` (protocol-relative URL) and absolute URLs like
 * `https://evil.com`, which attackers could smuggle via `callbackUrl`.
 * @param callbackUrl - Raw value from a query param or form field; may be null/undefined.
 * @returns The callback path if safe, otherwise {@link DEFAULT_AUTH_CALLBACK}.
 */
export function getSafeCallbackPath(
  callbackUrl: string | null | undefined
): string {
  // Must start with `/` but not `//` — the latter is treated as an external URL by browsers.
  if (callbackUrl?.startsWith("/") && !callbackUrl.startsWith("//")) {
    return callbackUrl;
  }
  return DEFAULT_AUTH_CALLBACK;
}
