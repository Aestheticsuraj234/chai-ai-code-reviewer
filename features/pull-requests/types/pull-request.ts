export type PullRequestStatus =
  | "pending"
  | "processing"
  | "reviewed"
  | "rate_limited";

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

export type RepoPullRequests = {
  repoFullName: string;
  pullRequests: PullRequestItem[];
};
