import type { Metadata } from "next";

import { DashboardHeader } from "@/features/dashboard/components/dashboard-header";
import { GithubConnectCard } from "@/features/dashboard/components/github-connect-card";
import { getInstallationStatus } from "@/features/github/server/installation";
import { requireAuth } from "@/lib/auth-session";

export const metadata: Metadata = {
  title: "GitHub App · Dashboard",
};

export default async function DashboardGithubPage() {
  const session = await requireAuth();
  const installation = await getInstallationStatus(session.user.id);

  return (
    <>
      <DashboardHeader
        title="GitHub App"
        description="Install or disconnect the reviewer app on your GitHub account."
      />
      <GithubConnectCard userId={session.user.id} installation={installation} />
    </>
  );
}
