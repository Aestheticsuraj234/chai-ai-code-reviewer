import { infiniteQueryOptions } from "@tanstack/react-query";

import type { DashboardRepo } from "@/features/dashboard/lib/types";
import { githubRepoKeys } from "@/features/github/lib/query-keys";

export type GithubReposPage = {
  repos: DashboardRepo[];
  totalCount: number;
  page: number;
  hasMore: boolean;
};

// Repo list changes slowly, so keep it fresh for 10 minutes
const REPOS_STALE_TIME = 10 * 60 * 1000;

async function fetchReposPage(page: number): Promise<GithubReposPage> {
  const response = await fetch(`/api/github/repos?page=${page}`);

  if (!response.ok) {
    throw new Error("Failed to load repositories");
  }

  return response.json();
}

function getNextPageParam(lastPage: GithubReposPage) {
  if (lastPage.hasMore) {
    return lastPage.page + 1;
  }

  return undefined;
}

export const githubReposInfiniteQuery = infiniteQueryOptions({
  queryKey: githubRepoKeys.list(),
  queryFn: ({ pageParam }) => fetchReposPage(pageParam),
  initialPageParam: 1,
  getNextPageParam,
  staleTime: REPOS_STALE_TIME,
});
