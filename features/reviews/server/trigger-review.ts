import { inngest } from "@/features/inngest/client";

export async function triggerReviewJob(pullRequestId: string) {
  await inngest.send({
    name: "github/pr.received",
    data: { pullRequestId },
  });
}
