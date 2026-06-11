

import { FREE_MONTHLY_LIMIT, getMonthStart } from "@/features/billing/lib/limits";
import { getUserSubscription } from "@/features/billing/server/subscription";
import { prisma } from "@/lib/db";

export type UsageSummary = {
  used: number;
  limit: number | null;
};

async function getUserInstallationId(userId: string): Promise<number | null> {
  const installation = await prisma.githubInstallation.findUnique({
    where: { userId },
    select: { installationId: true },
  });

  if (!installation) {
    return null;
  }

  return installation.installationId;
}

export async function getReviewsThisMonth(userId: string): Promise<number> {
  const installationId = await getUserInstallationId(userId);

  if (!installationId) {
    return 0;
  }

  return prisma.pullRequest.count({
    where: {
      installationId,
      status: "reviewed",
      reviewedAt: { gte: getMonthStart() },
    },
  });
}

export async function canUserReview(userId: string): Promise<boolean> {
  const subscription = await getUserSubscription(userId);

  if (subscription.plan === "pro" && subscription.status === "active") {
    return true;
  }

  const used = await getReviewsThisMonth(userId);
  return used < FREE_MONTHLY_LIMIT;
}

export async function getUsageSummary(userId: string): Promise<UsageSummary> {
  const subscription = await getUserSubscription(userId);
  const used = await getReviewsThisMonth(userId);

  if (subscription.plan === "pro" && subscription.status === "active") {
    return { used, limit: null };
  }

  return { used, limit: FREE_MONTHLY_LIMIT };
}
