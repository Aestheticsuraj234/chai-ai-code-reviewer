import type { OverviewActivityItem } from "@/features/overview/types/overview";
import { getReviewsThisMonth } from "@/features/billing/server/usage";
import { getUserInstallationId } from "@/features/github/server/installation";
import { prisma } from "@/lib/db";

function getActivityStatus(status: string): OverviewActivityItem["status"] {
  if (status === "rate_limited") {
    return "rate_limited";
  }

  return "approved";
}

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
