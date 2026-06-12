/**
 * Persists pull-request metadata from GitHub webhooks.
 *
 * First step in the webhook → review pipeline: when GitHub notifies us of a
 * new or updated PR, we upsert a row so the dashboard can show status and
 * Inngest can look up installation id, repo name, and PR number later.
 */
import type { PullRequestWebhookPayload } from "@/features/reviews/types/review";
import { prisma } from "@/lib/db";

/**
 * Safely reads the PR author's GitHub login from the webhook payload.
 *
 * @param user - `pull_request.user` from the webhook, or null for bots/deleted users
 * @returns Login string, or null if unavailable
 */
function getAuthorLogin(
  user: { login: string } | null
): string | null {
  if (!user) {
    return null;
  }
  return user.login;
}

/**
 * Creates or updates a `PullRequest` record from a GitHub webhook payload.
 *
 * Uses `repoFullName` + `prNumber` as the natural key so repeated webhooks
 * (e.g. new commits on the same PR) update the same row and reset status to
 * `pending` for another review pass.
 *
 * @param payload - Parsed `pull_request` webhook body
 * @returns The upserted Prisma `PullRequest` row (includes `id` for Inngest)
 */
export async function savePullRequest(payload: PullRequestWebhookPayload) {
  const repoFullName = payload.repository.full_name;
  const prNumber = payload.pull_request.number;

  const pullRequest = await prisma.pullRequest.upsert({
    where: {
      repoFullName_prNumber: { repoFullName, prNumber },
    },
    create: {
      installationId: payload.installation.id,
      repoFullName,
      prNumber,
      title: payload.pull_request.title,
      authorLogin: getAuthorLogin(payload.pull_request.user),
      headSha: payload.pull_request.head.sha,
      baseBranch: payload.pull_request.base.ref,
      status: "pending",
    },
    update: {
      title: payload.pull_request.title,
      headSha: payload.pull_request.head.sha,
      // New commits mean we need a fresh review
      status: "pending",
    },
  });

  return pullRequest;
}
