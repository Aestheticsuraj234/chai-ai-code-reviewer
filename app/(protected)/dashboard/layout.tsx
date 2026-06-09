import { QueryProvider } from "@/components/providers/query-provider";
import { DashboardShell } from "@/features/dashboard/components/dashboard-shell";
import { requireAuth } from "@/lib/auth-session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();

  return (
    <QueryProvider>
      <DashboardShell user={session.user} plan="Pro">
        {children}
      </DashboardShell>
    </QueryProvider>
  );
}
