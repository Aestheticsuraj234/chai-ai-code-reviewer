import { prisma } from "@/lib/db";

export async function getRepoSyncStatuses(repoFullNames: string[]) {
  const syncs = await prisma.repoSync.findMany({
    where: { repoFullName: { in: repoFullNames } },
    select: { repoFullName: true, status: true },
  });

  const statusByRepo: Record<string, string> = {};

  for (const sync of syncs) {
    statusByRepo[sync.repoFullName] = sync.status;
  }

  return statusByRepo;
}
