/**
 * Dashboard button to start or re-run repository codebase sync.
 *
 * Sync is optional but improves PR reviews: once `syncRepoCodebase` finishes,
 * `reviewPullRequest` can search the repo Pinecone namespace for code outside
 * the diff. This component shows live status (Sync / Syncing… / Re-sync).
 */
"use client";

import type { RepoSyncStatus } from "@/features/repo-sync/types/repo-sync";
import { useSyncRepoMutation } from "@/features/repo-sync/lib/sync-repo-mutation";
import { Button } from "@/components/ui/button";

type SyncRepoButtonProps = {
  repoFullName: string;
  branch: string;
  syncStatus: RepoSyncStatus | null;
};

/**
 * @param status - Current sync status from the server or optimistic UI
 * @returns True while a sync is queued or running
 */
function isSyncInProgress(status: RepoSyncStatus | null) {
  return status === "pending" || status === "syncing";
}

/**
 * @param status - Current sync status
 * @returns Button label appropriate for the lifecycle state
 */
function getButtonLabel(status: RepoSyncStatus | null) {
  if (isSyncInProgress(status)) {
    return "Syncing…";
  }

  if (status === "synced") {
    return "Re-sync";
  }

  return "Sync";
}

/**
 * Triggers `repo/sync.requested` via server action and reflects status in the UI.
 *
 * @param props.repoFullName - Repository in `owner/repo` form
 * @param props.branch - Branch to index (passed through to Inngest worker)
 * @param props.syncStatus - Last known status from the repos list query
 * @returns Rendered sync button with disabled state during active sync
 */
export function SyncRepoButton({
  repoFullName,
  branch,
  syncStatus,
}: SyncRepoButtonProps) {
  const syncRepo = useSyncRepoMutation();

  function handleSync() {
    // Server action upserts RepoSync + sends Inngest event
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
