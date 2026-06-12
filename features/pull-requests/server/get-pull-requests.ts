/**
 * Server loader for the pull requests list page.
 *
 * Fetches all PRs for an installation and groups them by repository
 * so the UI can render one card per repo with nested PR rows.
 */

import type {
  PullRequestItem,
  PullRequestStatus,
  RepoPullRequests,
} from "@/features/pull-requests/types/pull-request";
import { prisma } from "@/lib/db";

/** Shape of a row returned from Prisma before client serialization. */
type PullRequestRecord = {
  id: string;
  repoFullName: string;
  prNumber: number;
  title: string;
  authorLogin: string | null;
  baseBranch: string;
  status: string;
  reviewComment: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
};

/**
 * Converts a database record into a JSON-serializable `PullRequestItem`.
 *
 * @param record - Raw Prisma pull request row.
 * @returns Item with ISO date strings for client components.
 */
function toPullRequestItem(record: PullRequestRecord): PullRequestItem {
  return {
    id: record.id,
    prNumber: record.prNumber,
    title: record.title,
    authorLogin: record.authorLogin,
    baseBranch: record.baseBranch,
    status: record.status as PullRequestStatus,
    reviewComment: record.reviewComment,
    reviewedAt: record.reviewedAt?.toISOString() ?? null,
    createdAt: record.createdAt.toISOString(),
  };
}

/**
 * Loads all pull requests for an installation, grouped by repository.
 *
 * @param installationId - GitHub App installation ID for the current user.
 * @returns An array of repo groups, each with its pull requests (newest first within each group).
 */
export async function getPullRequestsByRepo(
  installationId: number
): Promise<RepoPullRequests[]> {
  const records = await prisma.pullRequest.findMany({
    where: { installationId },
    orderBy: { updatedAt: "desc" },
  });

  const groups: RepoPullRequests[] = [];

  // Single pass: append each PR to an existing group or start a new one
  for (const record of records) {
    let group = groups.find((g) => g.repoFullName === record.repoFullName);

    if (!group) {
      group = { repoFullName: record.repoFullName, pullRequests: [] };
      groups.push(group);
    }

    group.pullRequests.push(toPullRequestItem(record));
  }

  return groups;
}
