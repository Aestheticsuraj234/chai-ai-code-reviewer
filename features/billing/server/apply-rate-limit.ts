import "server-only";

import { prisma } from "@/lib/db";

export async function markPullRequestRateLimited(pullRequestId: string) {
  await prisma.pullRequest.update({
    where: { id: pullRequestId },
    data: { status: "rate_limited" },
  });
}
