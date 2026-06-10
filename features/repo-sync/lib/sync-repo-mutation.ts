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
