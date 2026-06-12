/**
 * Enqueues a pull-request review background job.
 *
 * This is the bridge between the synchronous webhook handler and the async
 * Inngest workflow. The webhook saves the PR to the database, then calls
 * `triggerReviewJob` so heavy work (GitHub fetch, chunking, Pinecone, AI)
 * runs outside the HTTP response window.
 */
import { inngest } from "@/features/inngest/client";

/**
 * Sends a `github/pr.received` event to Inngest.
 *
 * The `reviewPullRequest` function in `review-pr-function.ts` listens for
 * this event and runs the full review pipeline in durable steps.
 *
 * @param pullRequestId - Primary key of the `PullRequest` row in our database
 * @returns Resolves when the event is accepted by Inngest
 */
export async function triggerReviewJob(pullRequestId: string) {
  await inngest.send({
    name: "github/pr.received",
    data: { pullRequestId },
  });
}
