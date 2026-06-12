/**
 * Inngest workflow: sync a repository branch into Pinecone.
 *
 * Optional companion to PR review. When a user syncs a repo from the dashboard,
 * this function fetches source files, chunks them, and embeds everything in
 * the repo namespace. Later, `reviewPullRequest` searches that namespace for
 * context outside the PR diff.
 *
 * Pipeline: mark syncing → fetch & chunk → (re-sync) clear old vectors →
 * upsert to Pinecone → mark synced with chunk count.
 */
import { inngest } from "@/features/inngest/client";
import { prisma } from "@/lib/db";
import { getRepoFiles } from "@/features/repo-sync/server/repo-files";
import {
  deleteRepoNamespace,
  saveRepoChunks,
} from "@/features/repo-sync/server/vectors";
import { chunkRepoFiles } from "@/features/repo-sync/utils/chunk-repo";
import { buildRepoNamespace } from "@/features/repo-sync/utils/repo-namespace";

/**
 * Durable Inngest function that indexes one repository branch.
 *
 * Listens for `repo/sync.requested` with `{ repoSyncId }`. On failure, the
 * `onFailure` hook marks the `RepoSync` row as `failed` for the UI.
 *
 * @param event - Inngest event; `event.data.repoSyncId` is the DB primary key
 * @param step - Step runner for named, retriable pipeline stages
 * @returns Final status and chunk count after a successful sync
 */
export const syncRepoCodebase = inngest.createFunction(
  {
    id: "sync-repo-codebase",
    triggers: { event: "repo/sync.requested" },
    onFailure: async ({ event }) => {
      await prisma.repoSync.update({
        where: { id: event.data.event.data.repoSyncId },
        data: { status: "failed" },
      });
    },
  },
  async ({ event, step }) => {
    const repoSyncId = event.data.repoSyncId;

    const repoSync = await step.run("mark-syncing", async () => {
      return prisma.repoSync.update({
        where: { id: repoSyncId },
        data: { status: "syncing" },
      });
    });

    const chunks = await step.run("fetch-and-chunk-codebase", async () => {
      const files = await getRepoFiles(
        repoSync.installationId,
        repoSync.repoFullName,
        repoSync.branch
      );

      return chunkRepoFiles(files);
    });

    const namespace = buildRepoNamespace(repoSync.repoFullName);

    // A re-sync replaces everything, so drop the old vectors first
    if (repoSync.syncedAt) {
      await step.run("clear-old-vectors", async () => {
        await deleteRepoNamespace(namespace);
      });
    }

    await step.run("save-vectors-to-pinecone", async () => {
      await saveRepoChunks(namespace, chunks);
    });

    await step.run("mark-synced", async () => {
      await prisma.repoSync.update({
        where: { id: repoSyncId },
        data: {
          status: "synced",
          syncedAt: new Date(),
          chunkCount: chunks.length,
        },
      });
    });

    return { repoSyncId, status: "synced", chunkCount: chunks.length };
  }
);
