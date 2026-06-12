/**
 * Human-readable labels and badge colors for pull request review status.
 *
 * Centralizing status → UI mapping keeps list and detail pages consistent.
 */

import type { PullRequestStatus } from "@/features/pull-requests/types/pull-request";

/** Display text for each `PullRequestStatus` value. */
export const PR_STATUS_LABELS: Record<PullRequestStatus, string> = {
  pending: "Pending",
  processing: "Reviewing…",
  reviewed: "Reviewed",
  rate_limited: "Rate limited",
};

/**
 * Maps a PR status to a dashboard badge tone for visual emphasis.
 *
 * @param status - Current review lifecycle status.
 * @returns A key accepted by `statusBadge()` from status-styles.
 */
export function getPrStatusTone(
  status: PullRequestStatus
): "neutral" | "info" | "success" | "danger" {
  if (status === "reviewed") {
    return "success";
  }

  if (status === "processing") {
    return "info";
  }

  if (status === "rate_limited") {
    return "danger";
  }

  return "neutral";
}
