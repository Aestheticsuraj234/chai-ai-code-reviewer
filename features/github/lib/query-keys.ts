/**
 * TanStack Query cache keys for GitHub-related client data.
 *
 * Stable key factories keep invalidation predictable — e.g. `githubRepoKeys.all`
 * matches every repo query, while `list()` targets only the paginated repo list.
 *
 * @module features/github/lib/query-keys
 */

/** Root keys for GitHub repository queries in the React Query cache. */
export const githubRepoKeys = {
  /** Base segment shared by all github repo queries. */
  all: ["github", "repos"] as const,
  /**
   * Key for the infinite repo list query.
   * @returns Tuple used as `queryKey` in `useInfiniteQuery`.
   */
  list: () => [...githubRepoKeys.all, "list"] as const,
};
