/**
 * Marks a pull request when the user has hit their free-tier review limit.
 *
 * The GitHub webhook still saves the PR, but we skip the AI review and set
 * `status: "rate_limited"` so the dashboard can explain what happened.
 *
 * @module features/billing/server/apply-rate-limit
 */

import "server-only";

import { prisma } from "@/lib/db";

/**
 * Updates a pull request to the `rate_limited` status.
 *
 * @param pullRequestId - Internal id of the PR row saved from the webhook.
 * @returns Resolves when the database update completes.
 */
export async function markPullRequestRateLimited(pullRequestId: string) {
  await prisma.pullRequest.update({
    where: { id: pullRequestId },
    data: { status: "rate_limited" },
  });
}
