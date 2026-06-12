/**
 * Client-side TanStack Query mutation for triggering repo sync.
 *
 * Wires the Sync button to the server action `syncRepoCodebase`, with
 * optimistic UI updates on the infinite GitHub repos list. Status flows:
 * user click → `pending`/`syncing` in UI → Inngest worker → `synced` or `failed`.
 */
import {
  useMutation,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";

import type { GithubReposPage } from "@/features/github/lib/repos-query";
import { githubRepoKeys } from "@/features/github/lib/query-keys";
import { syncRepoCodebase } from "@/lib/actions/repo-sync";

type SyncRepoInput = {
  repoFullName: string;
  branch: string;
};

/**
 * Optimistically patches sync status on one repo in cached list pages.
 *
 * @param data - Current infinite-query cache for GitHub repos
 * @param repoFullName - Repo to update
 * @param syncStatus - Temporary status shown before server refetch
 * @returns Updated cache, or undefined if no cache existed
 */
function updateRepoSyncStatus(
  data: InfiniteData<GithubReposPage> | undefined,
  repoFullName: string,
  syncStatus: "syncing" | "failed"
) {
  if (!data) {
    return data;
  }

  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      repos: page.repos.map((repo) => {
        if (repo.fullName !== repoFullName) {
          return repo;
        }

        return { ...repo, syncStatus };
      }),
    })),
  };
}

/**
 * React hook that triggers repo sync and keeps the repos list UI in sync.
 *
 * - `onMutate`: immediately shows "syncing" on the clicked repo
 * - `onError`: rolls back to "failed" if the server action throws
 * - `onSettled`: refetches repos so status matches the database
 *
 * @returns TanStack Query mutation object (`mutate`, `isPending`, etc.)
 */
export function useSyncRepoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ repoFullName, branch }: SyncRepoInput) =>
      syncRepoCodebase(repoFullName, branch),
    onMutate: async ({ repoFullName }) => {
      await queryClient.cancelQueries({ queryKey: githubRepoKeys.all });

      const previousData = queryClient.getQueryData<InfiniteData<GithubReposPage>>(
        githubRepoKeys.list()
      );

      queryClient.setQueryData(
        githubRepoKeys.list(),
        updateRepoSyncStatus(previousData, repoFullName, "syncing")
      );

      return { previousData };
    },
    onError: (_error, { repoFullName }, context) => {
      queryClient.setQueryData(
        githubRepoKeys.list(),
        updateRepoSyncStatus(context?.previousData, repoFullName, "failed")
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: githubRepoKeys.all });
    },
  });
}
