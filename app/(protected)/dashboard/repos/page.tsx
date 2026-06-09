import type { Metadata } from "next";
import Link from "next/link";

import { DashboardHeader } from "@/features/dashboard/components/dashboard-header";
import { ReposList } from "@/features/dashboard/components/repos-list";
import { DASHBOARD_ROUTES } from "@/features/dashboard/lib/routes";
import { getInstallationStatus } from "@/features/github/server/installation";
import { requireAuth } from "@/lib/auth-session";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Repositories · Dashboard",
};

function ReposNotConnected() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
      <p className="text-sm text-muted-foreground">
        Install the GitHub App first to see your repositories.
      </p>
      <Button nativeButton={false} render={<Link href={DASHBOARD_ROUTES.github} />}>
        Go to GitHub App
      </Button>
    </div>
  );
}

export default async function DashboardReposPage() {
  const session = await requireAuth();
  const installation = await getInstallationStatus(session.user.id);

  const header = (
    <DashboardHeader
      title="Repositories"
      description="All public and private repositories available to the GitHub App."
    />
  );

  if (!installation.connected) {
    return (
      <>
        {header}
        <ReposNotConnected />
      </>
    );
  }

  return (
    <>
      {header}
      <ReposList />
    </>
  );
}
