/**
 * Aggregates all data needed for the dashboard Overview page.
 *
 * Pulls installation status, billing usage, subscription plan, recent activity,
 * and (when connected) a repository summary into one `OverviewData` object.
 */

import type { OverviewData } from "@/features/overview/types/overview";
import { getUsageSummary } from "@/features/billing/server/usage";
import {
  getInstallationStatus,
  getUserInstallationId,
} from "@/features/github/server/installation";
import { getUserSubscription } from "@/features/settings/server/subscription";

import { getRecentReviewActivity } from "./activity";
import { getInstallationRepoSummary } from "./repo-summary";

/**
 * Loads the complete overview payload for a signed-in user.
 *
 * Repo stats are skipped (`repos: null`) when GitHub is not connected,
 * so the UI can show a "Connect GitHub" banner instead of empty numbers.
 *
 * @param userId - Authenticated user's database ID.
 * @returns Structured data consumed by `OverviewContent`.
 */
export async function getOverview(userId: string): Promise<OverviewData> {
  // These three queries run regardless of GitHub connection state
  const installation = await getInstallationStatus(userId);
  const subscription = await getUserSubscription(userId);
  const usage = await getUsageSummary(userId);
  const recentActivity = await getRecentReviewActivity(userId);

  const base = {
    installation,
    reviewsUsed: usage.used,
    reviewsLimit: usage.limit,
    plan: subscription.plan,
    recentActivity,
  };

  if (!installation.connected) {
    return {
      ...base,
      repos: null,
    };
  }

  const installationId = await getUserInstallationId(userId);

  if (!installationId) {
    return {
      ...base,
      repos: null,
    };
  }

  const repos = await getInstallationRepoSummary(installationId);

  return {
    ...base,
    repos,
  };
}
