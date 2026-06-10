"use server";

import { redirect } from "next/navigation";

import { DASHBOARD_ROUTES } from "@/features/dashboard/lib/routes";
import { getUserInstallationId } from "@/features/github/server/installation";
import { triggerRepoSync } from "@/features/repo-sync/server/trigger-sync";
import { getServerSession } from "@/lib/auth-session";

export async function syncRepoCodebase(repoFullName: string, branch: string) {
  const session = await getServerSession();

  if (!session) {
    redirect("/sign-in");
  }

  const installationId = await getUserInstallationId(session.user.id);

  if (!installationId) {
    redirect(DASHBOARD_ROUTES.github);
  }

  await triggerRepoSync(installationId, repoFullName, branch);
}
