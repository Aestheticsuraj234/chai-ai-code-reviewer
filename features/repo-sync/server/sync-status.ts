/**
 * Reads repository sync status for the dashboard.
 *
 * When listing GitHub repos in the UI, we batch-fetch `RepoSync` rows so each
 * card can show whether codebase indexing is pending, in progress, or ready
 * for richer PR reviews.
 */
import { prisma } from "@/lib/db";

/**
 * Loads sync status for many repositories in one database query.
 *
 * Repos without a `RepoSync` row are omitted from the result — the UI treats
 * missing keys as "never synced".
 *
 * @param repoFullNames - List of `owner/repo` strings to look up
 * @returns Map of `repoFullName` → status string (`pending`, `syncing`, etc.)
 */
export async function getRepoSyncStatuses(repoFullNames: string[]) {
  const syncs = await prisma.repoSync.findMany({
    where: { repoFullName: { in: repoFullNames } },
    select: { repoFullName: true, status: true },
  });

  const statusByRepo: Record<string, string> = {};

  for (const sync of syncs) {
    statusByRepo[sync.repoFullName] = sync.status;
  }

  return statusByRepo;
}
