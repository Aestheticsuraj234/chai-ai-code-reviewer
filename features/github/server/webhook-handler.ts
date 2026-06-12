/**
 * Entry point for GitHub webhook HTTP requests.
 *
 * GitHub POSTs events (e.g. `pull_request`) to our API route. We verify the
 * payload signature, filter for review-worthy PR actions, enforce usage limits,
 * then queue an AI review job.
 *
 * @module features/github/server/webhook-handler
 */

import { markPullRequestRateLimited } from "@/features/billing/server/apply-rate-limit";
import { canUserReview } from "@/features/billing/server/usage";
import { getUserIdByInstallationId } from "@/features/github/server/installation";
import { getGithubApp } from "@/features/github/utils/github-app";
import type { PullRequestWebhookPayload } from "@/features/reviews/types/review";
import { savePullRequest } from "@/features/reviews/server/save-pull-request";
import { triggerReviewJob } from "@/features/reviews/server/trigger-review";

/** Only these PR actions mean the code changed enough to warrant a new review. */
const REVIEWABLE_ACTIONS = ["opened", "synchronize", "reopened"];

/**
 * Checks the `X-Hub-Signature-256` header using the GitHub App webhook secret.
 *
 * @param payload - Raw request body string (must not be parsed before verifying).
 * @param signature - Value of the `x-hub-signature-256` header, or null if missing.
 * @returns `true` when GitHub's HMAC matches our configured secret.
 */
async function isSignatureValid(payload: string, signature: string | null) {
  if (!signature) {
    return false;
  }

  const app = getGithubApp();
  // Octokit wraps GitHub's webhook crypto — rejects forged payloads.
  return app.webhooks.verify(payload, signature);
}

/**
 * Handles an incoming GitHub webhook `Request`.
 *
 * Flow:
 * 1. Verify signature (reject with 401 if invalid)
 * 2. Ignore non-`pull_request` events
 * 3. Ignore PR actions we do not review
 * 4. Save the PR, check billing usage limits, then trigger review or mark rate-limited
 *
 * @param request - The raw `Request` from the GitHub webhook route handler.
 * @returns JSON `Response` — always `{ received: true }` for valid ignored events.
 */
export async function handleGithubWebhook(request: Request) {
  // Read body as text first — signature verification needs the exact bytes GitHub signed.
  const payload = await request.text();
  const signature = request.headers.get("x-hub-signature-256");
  const eventName = request.headers.get("x-github-event");

  const isValid = await isSignatureValid(payload, signature);
  if (!isValid) {
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }

  // We only automate reviews for pull requests; other events are acknowledged and dropped.
  if (eventName !== "pull_request") {
    return Response.json({ received: true });
  }

  const event = JSON.parse(payload) as PullRequestWebhookPayload;
  if (!REVIEWABLE_ACTIONS.includes(event.action)) {
    return Response.json({ received: true });
  }

  const pullRequest = await savePullRequest(event);

  // Map GitHub's installation id → our user so we can check their plan and usage.
  const userId = await getUserIdByInstallationId(event.installation.id);
  if (userId) {
    const allowed = await canUserReview(userId);
    if (!allowed) {
      // Free tier hit the monthly cap — save the PR but skip the AI review.
      await markPullRequestRateLimited(pullRequest.id);
      return Response.json({ received: true, rateLimited: true });
    }
  }

  await triggerReviewJob(pullRequest.id);

  return Response.json({ received: true });
}
