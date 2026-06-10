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

    const namespace = buildPrNamespace(
      pullRequest.repoFullName,
      pullRequest.prNumber
    );

    await step.run("save-vectors-to-pinecone", async () => {
      await saveChunksToPinecone(namespace, chunks);
    });

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
        data: { status: "reviewed" },
      });
    });

    return { pullRequestId, status: "reviewed" };
  }
);
