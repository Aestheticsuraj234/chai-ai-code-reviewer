/**
 * Type definitions for the dashboard Overview page data model.
 *
 * `OverviewData` is assembled server-side by `get-overview.ts` and passed
 * as props to `OverviewContent`. Types here describe that contract.
 */

import type {
  GithubInstallationStatus,
  SubscriptionPlan,
} from "@/features/dashboard/lib/types";

/**
 * Repository counts shown on the Overview stat card.
 * `hasMorePages` is true when GitHub returns more repos than the first page.
 */
export type OverviewRepoSummary = {
  totalCount: number;
  publicCount: number;
  privateCount: number;
  hasMorePages: boolean;
};

/** Simplified review outcome labels for the activity feed. */
export type OverviewActivityStatus =
  | "approved"
  | "changes_requested"
  | "rate_limited";

/** One row in the "Recent activity" list on the Overview page. */
export type OverviewActivityItem = {
  id: string;
  repoFullName: string;
  prNumber: string;
  status: OverviewActivityStatus;
  reviewedAt: string;
};

/**
 * Everything the Overview page needs in a single object.
 * `repos` is null when the GitHub App is not connected yet.
 */
export type OverviewData = {
  installation: GithubInstallationStatus;
  repos: OverviewRepoSummary | null;
  reviewsUsed: number;
  reviewsLimit: number | null;
  plan: SubscriptionPlan;
  recentActivity: OverviewActivityItem[];
};
