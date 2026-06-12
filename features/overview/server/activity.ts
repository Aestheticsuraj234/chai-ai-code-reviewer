/**
 * Server helpers for the Overview "Recent activity" feed.
 *
 * Loads the latest AI-reviewed pull requests for the user's GitHub App
 * installation and maps database status values into display-friendly labels.
 */

import type { OverviewActivityItem } from "@/features/overview/types/overview";
import { getReviewsThisMonth } from "@/features/billing/server/usage";
import { getUserInstallationId } from "@/features/github/server/installation";
import { prisma } from "@/lib/db";

/**
 * Maps internal PR status strings to activity feed status labels.
 *
 * Only `rate_limited` gets a distinct label; other reviewed states show as approved.
 *
 * @param status - Raw status string from the `pullRequest` table.
 * @returns A value suitable for `OverviewActivityItem["status"]`.
 */
function getActivityStatus(status: string): OverviewActivityItem["status"] {
  if (status === "rate_limited") {
    return "rate_limited";
  }

  return "approved";
}

/**
 * Fetches up to 10 recent reviewed pull requests for the Overview activity list.
 *
 * Returns an empty array when the user has no GitHub App installation,
 * since there is no installation scope to query PRs against.
 *
 * @param userId - Authenticated user's database ID.
 * @returns Chronologically ordered activity items (newest first).
 */
export async function getRecentReviewActivity(
  userId: string
): Promise<OverviewActivityItem[]> {
  const installationId = await getUserInstallationId(userId);

  if (!installationId) {
    return [];
  }

  const pullRequests = await prisma.pullRequest.findMany({
    where: {
      installationId,
      // Only show PRs that finished (or hit the rate limit)
      status: { in: ["reviewed", "rate_limited"] },
    },
    orderBy: { updatedAt: "desc" },
    take: 10,
    select: {
      id: true,
      repoFullName: true,
      prNumber: true,
      status: true,
      reviewedAt: true,
      updatedAt: true,
    },
  });

  return pullRequests.map((pullRequest) => {
    // Prefer reviewedAt when set; fall back to last update time
    let reviewedAt = pullRequest.updatedAt.toISOString();

    if (pullRequest.reviewedAt) {
      reviewedAt = pullRequest.reviewedAt.toISOString();
    }

    return {
      id: pullRequest.id,
      repoFullName: pullRequest.repoFullName,
      prNumber: `#${pullRequest.prNumber}`,
      status: getActivityStatus(pullRequest.status),
      reviewedAt,
    };
  });
}

export { getReviewsThisMonth };
