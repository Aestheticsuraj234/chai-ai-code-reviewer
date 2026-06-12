/**
 * Layout for all authenticated (protected) routes.
 *
 * Every page under `(protected)/` requires a valid session. Unauthenticated
 * visitors are redirected to sign-in by `requireAuth()`.
 */

import { requireAuth } from "@/lib/auth-session";

/**
 * Guard wrapper for protected route segments.
 *
 * @param children - Dashboard and other authenticated pages.
 * @returns A full-height container after auth check passes.
 */
export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();

  return <div className="min-h-svh">{children}</div>;
}
