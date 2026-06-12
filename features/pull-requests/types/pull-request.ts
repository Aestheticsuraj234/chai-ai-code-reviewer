/**
 * Type definitions for pull request list and detail views.
 *
 * Status values mirror the `pullRequest.status` column in the database.
 * Dates are ISO strings when passed to client components for serialization.
 */

/** Lifecycle of an AI review from webhook receipt to completion. */
export type PullRequestStatus =
  | "pending"
  | "processing"
  | "reviewed"
  | "rate_limited";

/** A single pull request row shown in lists and detail pages. */
export type PullRequestItem = {
  id: string;
  prNumber: number;
  title: string;
  authorLogin: string | null;
  baseBranch: string;
  status: PullRequestStatus;
  reviewComment: string | null;
  reviewedAt: string | null;
  createdAt: string;
};

/** Pull requests grouped under one repository for the list UI. */
export type RepoPullRequests = {
  repoFullName: string;
  pullRequests: PullRequestItem[];
};
