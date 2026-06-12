/**
 * Fetches a lightweight repository summary for the Overview stat card.
 *
 * Only the first page of installation repos is loaded — enough to count
 * public vs private repos without paginating through the entire list.
 */

import type { OverviewRepoSummary } from "@/features/overview/types/overview";
import { getInstallationReposPage } from "@/features/github/server/repos";

/**
 * Tallies how many repos are public vs private on a single page of results.
 *
 * @param repos - Array of repos with a `visibility` field.
 * @returns Counts for each visibility type.
 */
function countReposByVisibility(repos: { visibility: "public" | "private" }[]) {
  let publicCount = 0;
  let privateCount = 0;

  for (const repo of repos) {
    if (repo.visibility === "public") {
      publicCount++;
      continue;
    }

    privateCount++;
  }

  return { publicCount, privateCount };
}

/**
 * Builds repo summary stats for a GitHub App installation.
 *
 * Uses page 1 only; `totalCount` from the API reflects the full set even
 * when `hasMorePages` indicates additional pages exist.
 *
 * @param installationId - GitHub App installation numeric ID.
 * @returns Summary counts for the Overview repositories stat card.
 */
export async function getInstallationRepoSummary(
  installationId: number
): Promise<OverviewRepoSummary> {
  const page = await getInstallationReposPage(installationId, 1);
  const { publicCount, privateCount } = countReposByVisibility(page.repos);

  return {
    totalCount: page.totalCount,
    publicCount,
    privateCount,
    hasMorePages: page.hasMore,
  };
}
