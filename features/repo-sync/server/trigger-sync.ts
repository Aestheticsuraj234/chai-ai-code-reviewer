/**
 * Enqueues a repository codebase sync background job.
 *
 * Called from the dashboard when a user clicks Sync. Creates or resets a
 * `RepoSync` row, then sends `repo/sync.requested` to Inngest — the same
 * pattern as `triggerReviewJob` for pull requests.
 */
import { inngest } from "@/features/inngest/client";
import { prisma } from "@/lib/db";

/**
 * Upserts sync metadata and starts the `syncRepoCodebase` Inngest function.
 *
 * Setting status to `pending` lets the UI show activity immediately; the worker
 * flips it to `syncing` then `synced` (or `failed` on error).
 *
 * @param installationId - GitHub App installation for API access
 * @param repoFullName - Repository in `owner/repo` form
 * @param branch - Git branch to index (usually default branch from UI)
 * @returns Resolves when the Inngest event is sent
 */
export async function triggerRepoSync(
  installationId: number,
  repoFullName: string,
  branch: string
) {
  const repoSync = await prisma.repoSync.upsert({
    where: { repoFullName },
    create: { installationId, repoFullName, branch, status: "pending" },
    update: { installationId, branch, status: "pending" },
  });

  await inngest.send({
    name: "repo/sync.requested",
    data: { repoSyncId: repoSync.id },
  });
}
