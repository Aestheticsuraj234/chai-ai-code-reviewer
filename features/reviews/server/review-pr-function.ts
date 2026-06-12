/**
 * Inngest workflow: end-to-end pull request review.
 *
 * Triggered by `github/pr.received` (sent from `triggerReviewJob` after a
 * webhook). This is the core of the webhook → review pipeline:
 *
 * 1. Mark PR as processing in the database
 * 2. Fetch PR files from GitHub → chunk diffs → embed in Pinecone (PR namespace)
 * 3. Optionally search repo-sync namespace for broader codebase context
 * 4. Generate AI review → post GitHub comment → mark PR reviewed
 *
 * Each phase is an Inngest `step` so failures retry from the last safe point.
 */
import { inngest } from "@/features/inngest/client";
import { prisma } from "@/lib/db";
import { buildRepoNamespace } from "@/features/repo-sync/utils/repo-namespace";
import { generateReview } from "@/features/reviews/server/generate-review";
import { getPullRequestFiles } from "@/features/reviews/server/pr-files";
import { postPrComment } from "@/features/reviews/server/pr-comment";
import {
  buildPrNamespace,
  saveChunksToPinecone,
  searchPrContext,
} from "@/features/reviews/server/vectors";
import { chunkPrFiles } from "@/features/reviews/utils/chunk-code";

/**
 * Durable Inngest function that reviews one pull request.
 *
 * Listens for `github/pr.received` with `{ pullRequestId }` in event data.
 *
 * @param event - Inngest event; `event.data.pullRequestId` is the DB primary key
 * @param step - Step runner for named, retriable pipeline stages
 * @returns Final status object written after all steps succeed
 */
export const reviewPullRequest = inngest.createFunction(
  { id: "review-pull-request", triggers: { event: "github/pr.received" } },
  async ({ event, step }) => {
    const pullRequestId = event.data.pullRequestId;

    const pullRequest = await step.run("mark-processing", async () => {
      return prisma.pullRequest.update({
        where: { id: pullRequestId },
        data: { status: "processing" },
      });
    });

    const chunks = await step.run("breakdown-code", async () => {
      const files = await getPullRequestFiles(
        pullRequest.installationId,
        pullRequest.repoFullName,
        pullRequest.prNumber
      );

      // Turn unified diffs into fixed-size chunks for embedding
      return chunkPrFiles(pullRequest.prNumber, files);
    });

    if (chunks.length === 0) {
      await step.run("mark-reviewed-no-code", async () => {
        await prisma.pullRequest.update({
          where: { id: pullRequestId },
          data: { status: "reviewed" },
        });
      });

      return { pullRequestId, status: "reviewed", reason: "no code to review" };
    }

    // PR namespace isolates this diff from other PRs and from repo-wide sync data
    const namespace = buildPrNamespace(
      pullRequest.repoFullName,
      pullRequest.prNumber
    );

    await step.run("save-vectors-to-pinecone", async () => {
      await saveChunksToPinecone(namespace, chunks);
    });

    // Pinecone needs a short delay before new vectors appear in search results
    await step.sleep("wait-for-vectors-to-index", "10s");

    // Extra context from the on-demand codebase sync, when the repo was synced
    const repoContextSnippets = await step.run("search-repo-context", async () => {
      const repoSync = await prisma.repoSync.findUnique({
        where: { repoFullName: pullRequest.repoFullName },
      });

      if (!repoSync || repoSync.status !== "synced") {
        return [];
      }

      const repoNamespace = buildRepoNamespace(pullRequest.repoFullName);
      return searchPrContext(repoNamespace, pullRequest.title);
    });

    const review = await step.run("generate-ai-review", async () => {
      // Search within this PR's namespace for chunks related to the PR title
      const contextSnippets = await searchPrContext(
        namespace,
        pullRequest.title
      );

      return generateReview({
        repoFullName: pullRequest.repoFullName,
        title: pullRequest.title,
        contextSnippets,
        repoContextSnippets,
      });
    });

    await step.run("post-pr-comment", async () => {
      await postPrComment(
        pullRequest.installationId,
        pullRequest.repoFullName,
        pullRequest.prNumber,
        review
      );
    });

    await step.run("mark-reviewed", async () => {
      await prisma.pullRequest.update({
        where: { id: pullRequestId },
        data: {
          status: "reviewed",
          reviewComment: review,
          reviewedAt: new Date(),
        },
      });
    });

    return { pullRequestId, status: "reviewed" };
  }
);
