import type { PullRequestStatus } from "@/features/pull-requests/types/pull-request";

export const PR_STATUS_LABELS: Record<PullRequestStatus, string> = {
  pending: "Pending",
  processing: "Reviewing…",
  reviewed: "Reviewed",
  rate_limited: "Rate limited",
};

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
