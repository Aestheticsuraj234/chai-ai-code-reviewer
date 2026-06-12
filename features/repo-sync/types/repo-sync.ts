/**
 * Shared types for the repository codebase sync feature.
 *
 * Repo sync indexes an entire branch into Pinecone so PR reviews can pull
 * related code from outside the diff. Status values drive UI labels and gate
 * whether `reviewPullRequest` searches the repo namespace.
 */

/**
 * A source file fetched from GitHub's git tree API during sync.
 */
export type RepoFile = {
  /** Repository-relative path */
  filePath: string;
  /** Full decoded file contents (UTF-8) */
  content: string;
};

/**
 * Lifecycle state of a repo sync job, stored in `RepoSync.status`.
 *
 * - `pending` — event queued, worker not started yet
 * - `syncing` — Inngest function is fetching/chunking/embedding
 * - `synced` — vectors are in Pinecone; reviews may use repo context
 * - `failed` — sync errored; `onFailure` handler sets this
 */
export type RepoSyncStatus = "pending" | "syncing" | "synced" | "failed";
