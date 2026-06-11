import { QueryProvider } from "@/components/providers/query-provider";
import { DashboardShell } from "@/features/dashboard/components/dashboard-shell";
import { PLAN_DETAILS } from "@/features/settings/lib/plan-details";
import { getUserSubscription } from "@/features/settings/server/subscription";
import { requireAuth } from "@/lib/auth-session";

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
