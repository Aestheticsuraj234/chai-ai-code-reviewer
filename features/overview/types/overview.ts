import type {
  GithubInstallationStatus,
  SubscriptionPlan,
} from "@/features/dashboard/lib/types";

export type OverviewRepoSummary = {
  totalCount: number;
  publicCount: number;
  privateCount: number;
  hasMorePages: boolean;
};

export type OverviewActivityStatus =
  | "approved"
  | "changes_requested"
  | "rate_limited";

export type OverviewActivityItem = {
  id: string;
  repoFullName: string;
  prNumber: string;
  status: OverviewActivityStatus;
  reviewedAt: string;
};

export type OverviewData = {
  installation: GithubInstallationStatus;
  repos: OverviewRepoSummary | null;
  reviewsUsed: number;
  reviewsLimit: number | null;
  plan: SubscriptionPlan;
  recentActivity: OverviewActivityItem[];
};
