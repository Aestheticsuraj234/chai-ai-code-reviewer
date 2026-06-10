import { inngest } from "@/features/inngest/client";
import { prisma } from "@/lib/db";

export async function triggerRepoSync(
  installationId: number,
  repoFullName: string,
  branch: string
) {
  const repoSync = await prisma.repoSync.upsert({
    where: { repoFullName },
    create: { installationId, repoFullName, branch, status: "pending" },
    update: { installationId, branch, status: "pending" },
  });

  await inngest.send({
    name: "repo/sync.requested",
    data: { repoSyncId: repoSync.id },
  });
}
