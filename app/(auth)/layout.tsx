/**
 * Layout for unauthenticated routes (sign-in).
 *
 * Redirects signed-in users away from auth pages via `requireUnauth`.
 * Centers the sign-in card on a muted background.
 */

import { requireUnauth } from "@/lib/auth-session";

/**
 * Auth route group layout — sign-in and related pages.
 *
 * @param children - Auth page content (e.g. sign-in card).
 * @returns Centered container for auth UI.
 */
export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Bounce authenticated users to the dashboard
  await requireUnauth();

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-muted/40 px-4 py-12">
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
