/**
 * Server-side loader for a single pull request detail page.
 *
 * Enforces ownership: a user can only view PRs that belong to their
 * GitHub App installation, preventing ID-guessing across tenants.
 */

import { prisma } from "@/lib/db";

/**
 * Fetches one pull request by ID, scoped to the user's installation.
 *
 * @param installationId - GitHub App installation ID for the current user.
 * @param pullRequestId - Database UUID from the URL `[id]` segment.
 * @returns The Prisma record, or `null` if not found or not owned by this installation.
 */
export async function getPullRequestById(
  installationId: number,
  pullRequestId: string
) {
  const pullRequest = await prisma.pullRequest.findUnique({
    where: { id: pullRequestId },
  });

  // Reject cross-tenant access — installationId must match the row
  if (!pullRequest || pullRequest.installationId !== installationId) {
    return null;
  }

  return pullRequest;
}
