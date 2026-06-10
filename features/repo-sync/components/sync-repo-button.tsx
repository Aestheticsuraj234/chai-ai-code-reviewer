"use client";

import type { RepoSyncStatus } from "@/features/repo-sync/types/repo-sync";
import { useSyncRepoMutation } from "@/features/repo-sync/lib/sync-repo-mutation";
import { Button } from "@/components/ui/button";

type SyncRepoButtonProps = {
  repoFullName: string;
  branch: string;
  syncStatus: RepoSyncStatus | null;
};

function isSyncInProgress(status: RepoSyncStatus | null) {
  return status === "pending" || status === "syncing";
}

function getButtonLabel(status: RepoSyncStatus | null) {
  if (isSyncInProgress(status)) {
    return "Syncing…";
  }

  if (status === "synced") {
    return "Re-sync";
  }

  return "Sync";
}

export function SyncRepoButton({
  repoFullName,
  branch,
  syncStatus,
}: SyncRepoButtonProps) {
  const syncRepo = useSyncRepoMutation();

  function handleSync() {
    syncRepo.mutate({ repoFullName, branch });
  }

  const status = syncRepo.isPending ? "syncing" : syncStatus;

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={syncRepo.isPending || isSyncInProgress(syncStatus)}
      onClick={handleSync}
    >
      {getButtonLabel(status)}
    </Button>
  );
}
