/**
 * Dashboard-specific layout — sidebar shell and React Query provider.
 *
 * Runs after the parent `(protected)` layout auth check. Loads subscription
 * plan label for the sidebar user menu and wraps pages in `DashboardShell`.
 */

import { QueryProvider } from "@/components/providers/query-provider";
import { DashboardShell } from "@/features/dashboard/components/dashboard-shell";
import { PLAN_DETAILS } from "@/features/settings/lib/plan-details";
import { getUserSubscription } from "@/features/settings/server/subscription";
import { requireAuth } from "@/lib/auth-session";

/**
 * Layout for all `/dashboard/*` routes.
 *
 * @param children - Dashboard page content inside the main inset area.
 * @returns Sidebar layout with query client and user session context.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();
  const subscription = await getUserSubscription(session.user.id);
  const planLabel = PLAN_DETAILS[subscription.plan].label;

  return (
    <QueryProvider>
      <DashboardShell user={session.user} plan={planLabel}>
        {children}
      </DashboardShell>
    </QueryProvider>
  );
}
