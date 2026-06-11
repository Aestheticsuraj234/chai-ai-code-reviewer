import { markPullRequestRateLimited } from "@/features/billing/server/apply-rate-limit";
import { canUserReview } from "@/features/billing/server/usage";
import { getUserIdByInstallationId } from "@/features/github/server/installation";
import { getGithubApp } from "@/features/github/utils/github-app";
import type { PullRequestWebhookPayload } from "@/features/reviews/types/review";
import { savePullRequest } from "@/features/reviews/server/save-pull-request";
import { triggerReviewJob } from "@/features/reviews/server/trigger-review";

const REVIEWABLE_ACTIONS = ["opened", "synchronize", "reopened"];

async function isSignatureValid(payload: string, signature: string | null) {
  if (!signature) {
    return false;
  }

  const app = getGithubApp();
  return app.webhooks.verify(payload, signature);
}

export async function handleGithubWebhook(request: Request) {
  const payload = await request.text();
  const signature = request.headers.get("x-hub-signature-256");
  const eventName = request.headers.get("x-github-event");

  const isValid = await isSignatureValid(payload, signature);
  if (!isValid) {
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }

  if (eventName !== "pull_request") {
    return Response.json({ received: true });
  }

  const event = JSON.parse(payload) as PullRequestWebhookPayload;
  if (!REVIEWABLE_ACTIONS.includes(event.action)) {
    return Response.json({ received: true });
  }

  const pullRequest = await savePullRequest(event);

  const userId = await getUserIdByInstallationId(event.installation.id);
  if (userId) {
    const allowed = await canUserReview(userId);
    if (!allowed) {
      await markPullRequestRateLimited(pullRequest.id);
      return Response.json({ received: true, rateLimited: true });
    }
  }

  await triggerReviewJob(pullRequest.id);

  return Response.json({ received: true });
}
