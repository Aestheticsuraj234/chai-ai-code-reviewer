import { inngest } from "@/features/inngest/client";
import { prisma } from "@/lib/db";
import { getRepoFiles } from "@/features/repo-sync/server/repo-files";
import {
  deleteRepoNamespace,
  saveRepoChunks,
} from "@/features/repo-sync/server/vectors";
import { chunkRepoFiles } from "@/features/repo-sync/utils/chunk-repo";
import { buildRepoNamespace } from "@/features/repo-sync/utils/repo-namespace";

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
