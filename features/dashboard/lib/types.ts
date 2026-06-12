/**
 * Shared TypeScript types for the dashboard feature.
 *
 * These types describe the shape of data shown across dashboard pages —
 * repositories, GitHub App connection status, and subscription info.
 * Keeping them in one place ensures server and client code stay in sync.
 */

import type { RepoSyncStatus } from "@/features/repo-sync/types/repo-sync";

/** Whether a repository is visible to everyone or only to collaborators. */
export type RepoVisibility = "public" | "private";

/**
 * A repository row displayed in the Repositories table.
 * Fields mirror what the GitHub API returns, plus optional sync status.
 */
export type DashboardRepo = {
  id: string;
  name: string;
  fullName: string;
  visibility: RepoVisibility;
  defaultBranch: string;
  updatedAt: string;
  language: string | null;
  stars: number;
  syncStatus?: RepoSyncStatus | null;
};

/**
 * Whether the user has installed the GitHub App and on which account.
 * `accountLogin` is the GitHub username or org name the app was installed for.
 */
export type GithubInstallationStatus = {
  connected: boolean;
  accountLogin: string | null;
  installedAt: string | null;
};

/** The two billing tiers available in the app. */
export type SubscriptionPlan = "free" | "pro";

/**
 * The user's current subscription state, used on the Settings page
 * and in the sidebar user menu badge.
 */
export type UserSubscription = {
  plan: SubscriptionPlan;
  status: "active" | "canceled" | "trialing";
  renewsAt: string | null;
};
