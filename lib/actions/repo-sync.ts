/**
 * @module lib/actions/repo-sync
 * @description Server Action to trigger a repository codebase sync.
 *
 * When a user requests a sync from the dashboard, this action verifies they
 * are logged in, have a GitHub App installation, and then enqueues background
 * work (via Inngest) to pull and index repository files.
 */

"use server";

import { redirect } from "next/navigation";

import { DASHBOARD_ROUTES } from "@/features/dashboard/lib/routes";
import { getUserInstallationId } from "@/features/github/server/installation";
import { triggerRepoSync } from "@/features/repo-sync/server/trigger-sync";
import { getServerSession } from "@/lib/auth-session";

/**
 * Starts a background sync for a specific repo branch.
 *
 * @description Called from the repos UI when a user wants to refresh indexed
 * code. Without a GitHub App installation ID, sync cannot call the GitHub API,
 * so those users are sent to the GitHub connection page.
 * @param repoFullName - GitHub repo identifier in `owner/repo` form (e.g. `vercel/next.js`).
 * @param branch - Branch name to sync (e.g. `main`).
 * @returns Resolves when the sync job has been triggered (work continues in the background).
 */
export async function syncRepoCodebase(repoFullName: string, branch: string) {
  const session = await getServerSession();

  if (!session) {
    redirect("/sign-in");
  }

  const installationId = await getUserInstallationId(session.user.id);

  if (!installationId) {
    // User is signed in but has not installed the GitHub App yet.
    redirect(DASHBOARD_ROUTES.github);
  }

  await triggerRepoSync(installationId, repoFullName, branch);
}
