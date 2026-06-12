/**
 * Tracks how many AI reviews a user has used and whether they can start another.
 *
 * Free plan: capped per month (`FREE_MONTHLY_LIMIT`).
 * Pro plan: unlimited reviews while subscription status is active.
 *
 * @module features/billing/server/usage
 */

import { FREE_MONTHLY_LIMIT, getMonthStart } from "@/features/billing/lib/limits";
import { getUserSubscription } from "@/features/billing/server/subscription";
import { prisma } from "@/lib/db";

/** Review count plus optional limit for display on the settings page. */
export type UsageSummary = {
  used: number;
  /** `null` means unlimited (Pro). A number means the free-tier monthly cap. */
  limit: number | null;
};

/** Looks up the GitHub installation id so we can count PRs for this user's repos. */
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

/**
 * Counts completed AI reviews for the user's connected GitHub installation this month.
 *
 * Only PRs with `status: "reviewed"` and `reviewedAt` in the current month count.
 *
 * @param userId - The user whose usage we are measuring.
 * @returns Number of reviews used this month (0 if GitHub is not connected).
 */
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

/**
 * Decides whether the user is allowed to trigger another AI review right now.
 *
 * Called from the GitHub webhook handler before enqueueing a review job.
 *
 * @param userId - The user who owns the GitHub installation.
 * @returns `true` if Pro (active) or free tier still has quota remaining.
 */
export async function canUserReview(userId: string): Promise<boolean> {
  const subscription = await getUserSubscription(userId);

  // Pro with an active subscription — no monthly cap.
  if (subscription.plan === "pro" && subscription.status === "active") {
    return true;
  }

  const used = await getReviewsThisMonth(userId);
  return used < FREE_MONTHLY_LIMIT;
}

/**
 * Builds usage numbers for the settings UI (used + limit).
 *
 * @param userId - The user viewing their settings.
 * @returns `{ used, limit }` where `limit` is `null` for unlimited Pro.
 */
export async function getUsageSummary(userId: string): Promise<UsageSummary> {
  const subscription = await getUserSubscription(userId);
  const used = await getReviewsThisMonth(userId);

  if (subscription.plan === "pro" && subscription.status === "active") {
    return { used, limit: null };
  }

  return { used, limit: FREE_MONTHLY_LIMIT };
}
