import type { OverviewData } from "@/features/overview/types/overview";
import { getUsageSummary } from "@/features/billing/server/usage";
import {
  getInstallationStatus,
  getUserInstallationId,
} from "@/features/github/server/installation";
import { getUserSubscription } from "@/features/settings/server/subscription";

import { getRecentReviewActivity } from "./activity";
import { getInstallationRepoSummary } from "./repo-summary";

export async function getOverview(userId: string): Promise<OverviewData> {
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
