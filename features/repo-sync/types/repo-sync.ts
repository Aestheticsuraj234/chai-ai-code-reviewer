export type RepoFile = {
  filePath: string;
  content: string;
};

export type RepoSyncStatus = "pending" | "syncing" | "synced" | "failed";
